import { isImageFilePath, isGlitchFilePath, getFileName } from '@/util/path.js';
import { toArrayBuffer } from '@/util/buffer.js';
import { getBlobURL, blobURLFromArrayBuffer } from '@/util/image.js';
import { fetchBlob } from '@/util/file.js';
import { arrayBufferToBlob } from 'blob-util';

export class GlitchFile {
	constructor( params = { } ) {
		// unique id
		this.id = params.id || Date.now() + '_' + ~~( Math.random() * 10000 );
		
		// fileName: without extension
		this.fileName = params.fileName || 'Untitled';

		// electron: complete path
		// browser: fileName with extension
		this.filePath = params.filePath || `${this.fileName}.glitch`;

		// name of the original image file
		this.srcFilePath = params.srcFilePath || `${this.fileName}.jpg`;
		this.srcFileType = params.srcFileType;

		this.srcBlobURL = params.srcBlobURL;

		this.history = params.history || [ ];
		this.glitchBlobURL = null;

		this.isOnHardDive = !! params.isOnHardDive;
	}
}
	
export function glitchFilefromFileInput ( fileInputItem ) {
	const fileReader = new FileReader();
	const isImg = isImageFilePath( fileInputItem.name );

	return new Promise( ( resolve, reject ) => {
		fileReader.onload = readerEvent => {
			if ( isImg ) {
				const arrayBuffer = readerEvent.target.result;
				const blobURL = blobURLFromArrayBuffer( arrayBuffer, fileInputItem.type );

				const glitchFile = new GlitchFile( {
					fileName: getFileName( fileInputItem.name ),
					srcFilePath: fileInputItem.name,
					srcBlobURL: blobURL,
					srcFileType: fileInputItem.type
				} );

				resolve( glitchFile );
			} else {
				const content = readerEvent.target.result;
				
				if ( isGlitchFilePath( fileInputItem.name ) ) {
					const glitchFile = glitchFileFromJSON( content );
					resolve( glitchFile );
				} else {
					reject( new Error( `Can't handle file: ${fileInputItem.name}: Was expecting it to be in JSON format.` ) );
				}
			}
		};

		if ( isImg ) {
			fileReader.readAsArrayBuffer( fileInputItem );
		} else {
			fileReader.readAsText( fileInputItem );
		}
	} );
}

export function glitchFilefromImageBlobURL ( srcBlobURL, srcFilePath = null, srcFileType = null ) {
	const fileName = srcFilePath ? getFileName( srcFilePath ) : null;
	
	return new GlitchFile( {
		fileName,
		srcFilePath,
		srcBlobURL,
		srcFileType
	} );
}

export function glitchFileFromJSON ( json, filePath = null, isOnHardDive = false ) {
	try {
		const fileData = JSON.parse( json );
		const arrayBuffer = toArrayBuffer( fileData.srcBuffer );
		const srcBlobURL = blobURLFromArrayBuffer( arrayBuffer, fileData.srcFileType );

		fileData.srcBlobURL = srcBlobURL;
		fileData.isOnHardDive = isOnHardDive;

		if ( filePath ) {
			fileData.filePath = filePath;
			fileData.fileName = getFileName( filePath );
		}

		const glitchFile = new GlitchFile( fileData );

		console.log( 'GLITCH FILE IMPORT', glitchFile );
		return glitchFile;
	} catch ( err ) {
		console.log( 'FAILED GLITCH FILE', err );
		Promise.reject( err );
	}
}

export function glitchFileToJSON ( glitchFile ) {
	return fetchBlob( glitchFile.srcBlobURL )
		.then( blob => new Response( blob ).arrayBuffer() )
		.then( srcBuffer => {
			const fileContents = {
				// id: glitchFile.id,
				fileName: glitchFile.fileName,
				filePath: glitchFile.filePath,
				srcFilePath: glitchFile.srcFilePath,
				srcFileType: glitchFile.srcFileType,
				srcBuffer: Array.from( new Uint8Array( srcBuffer ) ),
				history: glitchFile.history
			};

			return JSON.stringify( fileContents );
		} );
}
// }