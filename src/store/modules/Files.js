// import { arrayBufferToBlob } from 'blob-util';
import {
	loadLocalImageToImageData,
	blobURLFromImageFile,
	dataURLtoBlobURL,
	getBlobURL
} from '@/util/image.js';
import { getFileName, getExtension } from '@/util/path.js';
import { blobUrlToBuffer, /*saveFile,*/ fetchBlob, loadTextFile } from '@/util/file.js';
import { clone } from '@/util/object.js';
import { toArrayBuffer } from '@/util/buffer.js';
import { revokeObjectURL } from '@/util/blob.js';

let openFileDialog;
let exportFileAs;
let saveFileAs;
let saveFile;

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
	},

	defaultParams ( state ) {
		return Object.assign( { }, state.defaultParams );
	}
};

if ( ! process.env.IS_ELECTRON ) {
	// create file input listener
	import('@/util/browser.js')
		.then( module => {
			module.initFileInputField()
		} );
}

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
		let promise = Promise.resolve( [ ] );
		
		const openDialogParams = {
			properties: [ 'openFile', 'multiSelections' ],
			filters: [
				{ name: 'Images', extensions: [ 'jpg', 'jpeg', 'png', 'glitch' ] }
			]
		};

		if ( process.env.IS_ELECTRON ) {
			promise = openFileDialog
				? Promise.resolve()
				: import('@/util/electron.js').then( module => openFileDialog = module.openFileDialog );

			promise = promise
				.then( () => openFileDialog( openDialogParams ) )
				.tnen( glitchFiles => dispatch( 'openFiles', glitchFiles ) );
		}

		// import in browser works differently and
		// cannot be triggered by a function
	},

	requestToExportImage ( { dispatch, getters }, fileId ) {
		const glitchFile = getters.fileById( fileId );

		if ( glitchFile && glitchFile.glitchBlobURL ) {
			let promise = Promise.resolve();
			
			if ( process.env.IS_ELECTRON ) {
				// import dependency on the fly
				promise = exportFileAs
						? Promise.resolve()
						: import('@/util/electron.js').then( module => exportFileAs = module.exportFileAs );

					promise = promise.then( () => {
						return exportFileAs( glitchFile );
					} )
					.then( exportAsResult => {
						if ( exportAsResult ) {
							dispatch( 'updateHistory', {
								fileId,
								event: {
									type: 'export',
									fileName: getFileName( exportAsResult.filePath, true )
								}
							} );
						}
					} );

			} else {
				// import dependency on the fly
				promise = exportFileAs
					? Promise.resolve()
					: import('@/util/browser.js').then( module => exportFileAs = module.exportFileAs );

				promise = promise.then( () => {
					return exportFileAs( glitchFile );
				} )
				.then( () => {
					dispatch( 'updateHistory', {
						fileId,
						event: {
							type: 'export',
							fileName: getFileName( glitchFile.fileName ) + '.glitch'
						}
					} );
				} );
			}
		}
	},

	requestToOpenFiles ( { getters, dispatch } ) {
		let promise = Promise.resolve( [ ] );
		
		const openDialogParams = {
			properties: [ 'openFile', 'multiSelections' ],
			filters: [
				{ name: 'Images', extensions: [ 'jpg', 'jpeg', 'png', 'glitch' ] }
			]
		};

		if ( process.env.IS_ELECTRON ) {
			promise = openFileDialog
				? Promise.resolve()
				: import('@/util/electron.js').then( module => openFileDialog = module.openFileDialog );

			promise = promise.then( () => {
				return openFileDialog( openDialogParams );
			} );
		} else {
			// import dependency on the fly
			promise = openFileDialog
				? Promise.resolve()
				: import('@/util/browser.js').then( module => openFileDialog = module.openFileDialog );

			promise = promise.then( () => {
				return openFileDialog( openDialogParams );
			} );
		}

		promise
			.then( glitchFiles => dispatch( 'openFiles', glitchFiles ) );
	},

	openFiles ( { getters, dispatch, commit }, glitchFiles ) {
		glitchFiles.forEach( file => {
			commit( 'ADD_FILE', file );
		} );

		dispatch( 'updateActiveFile' );
	},

	saveFile ( { getters, dispatch, commit }, fileId ) {
		const glitchFile = getters.fileById( fileId );

		if ( process.env.IS_ELECTRON ) {
			if ( glitchFile ) {
				if (
					glitchFile.isOnHardDrive &&
					glitchFile.filePath
				) {
					let promise = Promise.resolve();
					
					promise = saveFile
						? Promise.resolve()
						: import( '@/util/electron.js' )
							.then( module => saveFile = module.saveFile );

					promise = promise
						.then( () => saveFile( glitchFile ) )
						.then( saveResult => {

							if ( saveResult ) {
								dispatch( 'updateHistory', {
									fileId,
									event: {
										type: 'save',
										fileName: getFileName( saveResult.filePath, true )
									}
								} );
							}
						} );
					
					return promise;
				} else {
					dispatch( 'requestToSaveFileAs', fileId );
				}

			} else {
				// no glitch file found
			}
		} else {
			if ( glitchFile ) {
				dispatch( 'requestToSaveFileAs', fileId );
			}
		}
	},

	requestToSaveFileAs ( { dispatch, commit, getters }, fileId ) {
		const glitchFile = getters.fileById( fileId );

		if ( glitchFile ) {
			let promise = Promise.resolve();
			
			if ( process.env.IS_ELECTRON ) {								
				promise = saveFileAs
						? Promise.resolve()
						: import( '@/util/electron.js' )
							.then( module => saveFileAs = module.saveFileAs );

				promise = promise
					.then( () => saveFileAs( glitchFile ) )
					.then( saveAsResult => {
						// update glitchFile and and name if the user stored a different file name						
						if ( glitchFile.fileName !== getFileName( saveAsResult.filePath ) ) {
							commit( 'SET_FILE_ATTR', {
								file: glitchFile,
								key: 'fileName',
								value: getFileName( saveAsResult.filePath )
							} );
						}

						commit( 'SET_FILE_ATTR', {
							file: glitchFile,
							key: 'filePath',
							value: saveAsResult.filePath
						} );

						commit( 'SET_FILE_ATTR', {
							file: glitchFile,
							key: 'isOnHardDrive',
							value: true
						} );

						dispatch( 'updateHistory', {
							fileId,
							event: {
								type: 'save',
								fileName: getFileName( saveAsResult.filePath, true )
							}
						} );
					} );
			} else {
				// import dependency on the fly
				promise = saveFileAs
					? Promise.resolve()
					: import('@/util/browser.js').then( module => saveFileAs = module.saveFileAs );

				promise = promise
					.then( () => {
						// convert BlobURL to ArrayBuffer
						// that we can store in JSON format
						return saveFileAs( glitchFile )
					} );
			}
		}
	},

	closeFile ( { dispatch, commit, getters }, fileId ) {
		const file = getters.fileById( fileId );
		
		if ( file ) {
			if ( file.glitchBlobURL ) {
				if ( process.env.IS_ELECTRON ) {
					revokeObjectURL( file.glitchBlobURL );
				} else {
					URL.revokeObjectURL( file.glitchBlobURL );
				}
			}

			if ( file.srcBlobURL ) {
				if ( process.env.IS_ELECTRON ) {
					revokeObjectURL( file.srcBlobURL );
				} else {
					URL.revokeObjectURL( file.srcBlobURL );
				}
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

	randomControlValues ( { getters, dispatch }, change ) {
		if ( change ) {
			Object.keys( getters.defaultParams )
				.forEach( key => {
					const event = {
						type: 'param',
						key,
						value: Math.floor( Math.random() * 100 )
					};

					dispatch( 'updateHistory', { fileId: change.fileId, event } );
				} );			
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
			const glitchBlobURL = dataURLtoBlobURL( change.dataURL );

			commit( 'SET_FILE_ATTR', { file, key: 'glitchBlobURL', value: glitchBlobURL } );
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

export default {
	getters,
	state,
	mutations,
	actions
};
