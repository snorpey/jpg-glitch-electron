// {
// 	name
//  content
//  meta?
//  path (complete) => Node Only
// }

import toBuffer from 'blob-to-buffer';
import { readFile, writeFile } from 'fs';

export function loadFile ( filePath, encoding ) {
	return new Promise( ( resolve, reject ) => {
		readFile( filePath, encoding, ( err, fileContent ) => {
			if ( err ) {
				reject( err );
			} else {
				resolve( { filePath, fileContent } );
			}
		} );
	} );
}

export function saveFile ( filePath, fileContent, encoding ) {
	return new Promise( ( resolve, reject ) => {
		writeFile( filePath, fileContent, encoding, err => {
			if ( err ) {
				reject( err );
			} else {
				resolve( { filePath, fileContent } );
			}
		} );
	} );
}

// export function saveFileAs ( fileNameWithExtension, fileContent, encoding ) {
// 	return save( fileContent, fileNameWithExtension );
// }

export function loadTextFile ( filePath ) {
	return loadFile( filePath, 'utf-8' );
}

export function saveTextFile ( filePath, fileContent, encoding = 'utf8' ) {
	return saveFile( filePath, fileContent, encoding );
}

// export function saveTextFileAs ( fileNameWithExtension, fileContent, encoding = 'utf8' ) {
// 	return saveFileAs( fileNameWithExtension, fileContent, encoding );
// }

export function fetchBlob ( blobURL ) {
	return fetch( blobURL )
		.then( res => res.blob() );
}

export function blobUrlToBuffer ( blobURL ) {
	return fetchBlob( blobURL )
		.then( blob => {
			return new Promise( ( resolve, reject ) => {
				toBuffer( blob, ( err, buffer ) => {
					if ( err ) {
						reject( err );
					} else {
						resolve( buffer );
					}
				} );
			} );
		} );
}