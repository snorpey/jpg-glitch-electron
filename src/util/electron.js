import { remote } from 'electron';
import { getExtension, isImageFilePath, isGlitchFilePath } from '@/util/path.js';
import { blobURLFromImagePath } from '@/util/image.js';
import { loadTextFile, saveTextFileAs, saveTextFile, saveFile as saveFileToDisk, blobUrlToBuffer } from '@/util/file.js';
import { lookup as getMimeTypeFromFilePath } from 'mime-types';
import { glitchFilefromImageBlobURL, glitchFileFromJSON, glitchFileToJSON } from '@/util/GlitchFile.js';

export function openFileDialog ( dialogParams ) {
	return remote.dialog.showOpenDialog( dialogParams )
		.then( result => {
			if ( result.filePaths ) {
				return Promise.all( result.filePaths.map( loadFileFromHardDrive ) )
			} else {
				throw new Error( 'Could not open files.' );
			}
		} );
}

export function loadFileFromHardDrive ( filePath ) {
	const extension = getExtension( filePath );

	if ( isImageFilePath( filePath ) ) {
		const fileType = getMimeTypeFromFilePath( filePath );

		return blobURLFromImagePath( filePath )
			.then( blobURL => {
				return glitchFilefromImageBlobURL( blobURL, filePath, fileType );
			} );
	} else {
		if ( isGlitchFilePath( filePath ) )	 {
			return loadTextFile( filePath )
				.then( fileData => {
					const { filePath, fileContent } = fileData;

					return glitchFileFromJSON( fileContent, filePath, true );
				} );
		} else {
			console.log( 'cant handle', filePath, isGlitchFilePath( filePath ) );
			return Promise.reject( new Error( 'Could not handle file type of file:' + filePath ) );
		}
	}
}

export function saveFile ( glitchFile, filePath = null ) {
	if ( ! filePath ) {
		filePath = glitchFile.filePath;
	}

	if ( filePath ) {
		console.log( 'STORING FILE....', filePath );
		return glitchFileToJSON( glitchFile )
			.then( json => saveTextFile( filePath, json ) );
	} else {
		console.log( 'NO FILE PATH!', filePath );
		return Promise.reject( new Error( 'No file path was given' ) );
	}
}

export function saveFileAs ( glitchFile ) {
	const saveDialogParams = {
		properties: [ 'openFile', 'multiSelections' ],
		filters: [
			{ name: 'Images', extensions: [ 'glitch' ] }
		],
		defaultPath: glitchFile.filePath
	};

	return remote.dialog.showSaveDialog( saveDialogParams )
		.then( result => {
			if ( result.filePath ) {
				return saveFile( glitchFile, result.filePath );
			} else {
				if ( result.canceled ) {
					console.log( 'Save was canceled' );
					return null;
				} else {
					throw new Error( 'Could not save file' );
				}
			}
		} );
	
	return saveTextFileAs( glitchFile.fileName + '.glitch', json );
}

export function exportFileAs ( glitchFile ) {
	if ( glitchFile.glitchBlobURL ) {
		const saveDialogParams = {
		properties: [ 'openFile', 'multiSelections' ],
		filters: [
			{ name: 'Images', extensions: [ 'png' ] }
		]
	};

	return remote.dialog.showSaveDialog( saveDialogParams )
		.then( result => {
			if ( result.filePath ) {
				return blobUrlToBuffer( glitchFile.glitchBlobURL )
					.then( buffer => saveFileToDisk( result.filePath, buffer, 'binary' ) );
			} else {
				if ( result.canceled ) {
					console.log( 'Save was canceled' );
					return null;
				} else {
					throw new Error( 'Could not save file' );
				}
			}
		} );
	} else {
		return Promise.reject( new Error( 'Could not export glitch file: No glitchBlobURL found.' ) );
	}
}
