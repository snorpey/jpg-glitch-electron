import { loadLocalImageToImageData, blobURLFromImageFile, dataURLtoBlobURL, getBlobURL, arrayBufferToBlob } from '@/util/image.js';
import { getFileName, getExtension } from '@/util/path.js';
import { blobUrlToBuffer, saveFile, fetchBlob, loadTextFile } from '@/util/file.js';
import { clone } from '@/util/object.js';
import { toArrayBuffer } from '@/util/buffer.js';
import { revokeObjectURL } from '@/util/blob.js';

const { dialog } = require( 'electron' ).remote;

const state = {
	files: [ ],
	activeFileId: null,
	defaultParams: {
		seed:       25, // integer between 0 and 99
		quality:    30, // integer between 0 and 99
		amount:     35, // integer between 0 and 99
		iterations: 20  // integer
	}
};

const getters = {
	files ( state ) {
		// return classes
		return state.files;
	},

	filteredFiles: ( state, getters ) => ( key, value ) => {
		return getters.files.filter( file => file[key] === value );
	},

	fileById: ( state, getters ) => fileId => {
		return getters.filteredFiles( 'id', fileId )[0];
	},

	hasOpenFiles ( state ) {
		return state.files.length;
	},

	activeFileId ( state ) {
		return state.activeFileId;
	},

	activeFile ( state, getters ) {
		return getters.fileById( getters.activeFileId );
	},

	isFileActive: state => fileId => {
		return state.activeFileId === fileId;
	},

	hasFileUnsavedChanges: ( state, getters ) => fileId => {
		const file = getters.fileById( fileId );

		if ( file ) {
			return file.history.length ? file.history[file.history.length - 1].type !== 'save' : false;
		} else {
			return false;
		}
	},

	latestEvent: ( state, getters ) => ( fileId, key ) => {
		const file = getters.fileById( fileId );

		if ( file ) {
			const events = file.history.filter( event => event.key === key );
			return events.length ? events[events.length - 1].value : state.defaultParams[key];
		} else {
			return null;
		}
	},

	params: ( state, getters ) => fileId => {
		return {
			seed: getters.latestEvent( fileId, 'seed' ),
			quality: getters.latestEvent( fileId, 'quality' ),
			amount: getters.latestEvent( fileId, 'amount' ),
			iterations: getters.latestEvent( fileId, 'iterations' )
		};
	}
};

const mutations = {
	ADD_FILE ( state, file ) {
		state.files.push( file );
	},

	REMOVE_FILE ( state, file ) {
		const indexData = state.files
			.map( ( file, index ) => {
				return { id: file.id, index };
			} )
			.filter( data => data.id === file.id )[0];

		if ( indexData ) {
			state.files.splice( indexData.index, 1 );
		}
	},

	SET_ACTIVE_FILE_ID ( state, newId ) {
		state.activeFileId = newId;
	},

	ADD_EVENT ( state, change ) {
		change.file.history.push( change.event );
	},

	SET_FILE_ATTR ( state, change ) {
		if ( change && change.file && change.key ) {
			change.file[change.key] = change.value;
		}
	}
};

const actions = {
	requestToImportImage ( { dispatch } ) {
		const openDialogParams = {
			properties: [ 'openFile', 'multiSelections' ],
			filters: [
				{ name: 'Images', extensions: [ 'jpg', 'png' ] }
			]
		};

		dialog.showOpenDialog( openDialogParams, filePaths => {
			if ( filePaths && filePaths.length ) {
				const imagePathsToImport = filePaths.filter( filePath => {
					return [ 'jpg', 'png', 'svg', 'gif' ].indexOf( getExtension( filePath ) ) !== -1;
				} );

				const filePathsToOpen = filePaths.filter( filePath => {
					return [ 'glitch' ].indexOf( getExtension( filePath ) ) !== -1;
				} );

				dispatch( 'importImages', imagePathsToImport );
				dispatch( 'openFiles', filePathsToOpen );
			}
		} );
	},

	importImages ( { dispatch, commit }, imagePaths ) {		
		Promise.all( imagePaths.map( blobURLFromImageFile ) )
			.then( blobURLs => {
				blobURLs
					.map( ( srcBlobURL, index ) => {
						const fileName = getFileName( imagePaths[index] );
						return newFileFromBlobURL( { srcBlobURL, fileName } );
					} )
					.forEach( file => {
						commit( 'ADD_FILE', file );
						dispatch( 'activateFile', file.id );
					} );

					dispatch( 'updateActiveFile' );
			} );
	},

	requestToExportImage ( { dispatch, getters }, fileId ) {
		const file = getters.fileById( fileId );

		if ( file && file.glitchBlobURL ) {
			const saveDialogParams = {
				filters: [
					{ name: 'Images', extensions: [ 'jpg' ] }
				]
			};

			dialog.showSaveDialog( saveDialogParams, filePath => {
				if ( filePath && filePath.length ) {
					blobUrlToBuffer( file.glitchBlobURL )
						.then( buffer => {
							dispatch( 'exportFile', {
								fileId,
								filePath,
								fileContent: buffer
							} );
						} );
				}
			} );
		}
	},
	
	exportFile ( { getters, dispatch }, change ) {		
		if ( change.filePath && change.fileContent ) {
			saveFile( change.filePath, change.fileContent )
				.then( () => {
					dispatch( 'updateHistory', {
						fileId: change.fileId,
						event: {
							type: 'export',
							fileName: getFileName( change.filePath )
						}
					} );
				} );
		}
	},

	requestToOpenFile ( { getters, dispatch } ) {
		const openDialogParams = {
			properties: [ 'openFile', 'multiSelections' ],
			filters: [
				{ name: 'Glitch File', extensions: [ 'glitch' ] }
			]
		};

		dialog.showOpenDialog( openDialogParams, imagePaths => {
			if ( imagePaths && imagePaths.length ) {
				dispatch( 'openFiles', imagePaths );
			}
		} );
	},

	openFiles ( { getters, dispatch, commit }, filePaths ) {
		if ( filePaths && filePaths.length ) {
			Promise.all( filePaths.map( loadTextFile ) )
				.then( files => {
					return Promise.all( files.map( newFileFromLoadedFile ) )
				} )
				.then( files => {
					return files.filter( fileData => !! fileData );
				} )
				.then( files => {					
					files.forEach( file => {
						commit( 'ADD_FILE', file );
					} );

					dispatch( 'updateActiveFile' );
				} );
		}
	},

	saveFile ( { getters, dispatch, commit }, fileId ) {
		const file = getters.fileById( fileId );

		if ( file ) {
			if ( file.filePath ) {
				const fileData = clone( file );

				blobUrlToBuffer( file.srcBlobURL )
					.then( srcBuffer => {
						delete fileData.srcBlobURL;
						delete fileData.glitchBlobURL;
						delete fileData.filePath;
						delete fileData.fileName;
						delete fileData.id;

						fileData.srcBuffer = srcBuffer;

						return JSON.stringify( fileData );
					} )
					.then( fileData => {
						return saveFile( file.filePath, fileData );
					} )
					.then( () => {
						dispatch( 'updateHistory', {
							fileId,
							event: { type: 'save' }
						} );
					} );
			} else {
				dispatch( 'requestToSaveFileAs', fileId );
			}
		}
	},

	requestToSaveFileAs ( { dispatch, commit, getters }, fileId ) {
		const file = getters.fileById( fileId );

		if ( file ) {
			const saveDialogParams = {
				filters: [
					{ name: 'Glitch File', extensions: [ 'glitch' ] }
				]
			};

			dialog.showSaveDialog( saveDialogParams, filePath => {
				if ( filePath && filePath.length ) {
					commit( 'SET_FILE_ATTR', {
						file,
						key: 'filePath',
						value: filePath
					} );

					dispatch( 'saveFile', fileId );
				}
			} );
		}
	},

	closeFile ( { dispatch, commit, getters }, fileId ) {
		const file = getters.fileById( fileId );
		
		if ( file ) {
			if ( file.glitchBlobURL ) {
				revokeObjectURL( file.glitchBlobURL );
			}

			if ( file.srcBlobURL ) {
				revokeObjectURL( file.srcBlobURL );
			}

			commit( 'REMOVE_FILE', file );
			dispatch( 'updateActiveFile' );
		}
	},

	updateActiveFile ( { getters, dispatch } ) {
		if ( getters.activeFileId && ! getters.files.length ) {
			dispatch( 'activateFile', null );
		}

		if ( ! getters.activeFileId && getters.files.length ) {
			dispatch( 'activateFile', getters.files[0].id );
		}

		if (
			getters.activeFileId &&
			getters.files.length &&
			! getters.fileById( getters.activeFileId )
		) {
			dispatch( 'activateFile', getters.files[0].id );
		}
	},

	activateFile ( { getters, commit }, fileId = null ) {
		if ( getters.fileById( fileId ) || fileId === null ) {
			commit( 'SET_ACTIVE_FILE_ID', fileId );
		}
	},

	updateControl ( { getters, dispatch }, change ) {
		if ( change ) {
			const event = {
				type: change.type || 'param',
				key: change.key,
				value: change.value
			};
						
			dispatch( 'updateHistory', { fileId: change.fileId, event } );
		}
	},

	updateHistory ( { getters, commit }, change ) {
		const event = change.event;
		const file = getters.fileById( change.fileId );

		if ( file && event && event.type ) {
			if ( ! event.date ) {
				event.date = Date.now();
			}

			commit( 'ADD_EVENT', { file, event } );
		}
	},

	updateGlitch ( { getters, commit }, change ) {
		const file = getters.fileById( change.fileId );

		if ( file && change.dataURL ) {
			dataURLtoBlobURL( change.dataURL )
				.then( glitchBlobURL => {
					commit( 'SET_FILE_ATTR', { file, key: 'glitchBlobURL', value: glitchBlobURL } )
				} );
		}
	},

	quit ( { getters, commit } ) {
		getters.files.forEach( file => {
			if ( file.srcBlobURL ) {
				revokeObjectURL( file.srcBlobURL );
			}

			if ( file.glitchBlobURL ) {
				revokeObjectURL( file.glitchBlobURL );
			}
		} );
	}
};

// function newFileFromBlobURL ( imageData, fileName = null ) {
// function newFileFromBlobURL ( srcBlobURL, filePath = null, history = [ ] ) {
function newFileFromBlobURL ( params = { } ) {
	const history = params.history || [ ];
	const filePath = params.filePath || null;
	const fileName = params.fileName || ( !! filePath ? getFileName( filePath ) : 'Untitled' );
	const srcBlobURL = params.srcBlobURL || null;

	if ( ! history.length ) {
		history.push( { type: 'param', key: 'seed', value: 25, date: Date.now() } );
		history.push( { type: 'param', key: 'quality', value: 30, date: Date.now() } );
		history.push( { type: 'param', key: 'amount', value: 35, date: Date.now() } );
		history.push( { type: 'param', key: 'iterations', value: 20, date: Date.now() } );
	}

	return {
		id: Date.now() + '_' + ~~( Math.random() * 10000 ),
		glitchBlobURL: null,
		
		fileName,
		filePath,
		
		srcBlobURL,
		history
	};
}

function newFileFromLoadedFile ( file ) {
	if ( file && file.filePath && file.fileContent ) {
		const fileContent = JSON.parse( file.fileContent );

		if ( fileContent.srcBuffer ) {
			return arrayBufferToBlob( toArrayBuffer( fileContent.srcBuffer.data ) )
				.then( blob => {
					return getBlobURL( blob )
				} )
				.then( srcBlobURL => {
					const filePath = file.filePath;
					const history = fileContent.history;

					return newFileFromBlobURL( { srcBlobURL, filePath, history } );
				} );
		} else {
			return new Promise( resolve => resolve( null ) );
		}
	} else {
		return new Promise( resolve => resolve( null ) );
	}
}

export default {
	getters,
	state,
	mutations,
	actions
};
