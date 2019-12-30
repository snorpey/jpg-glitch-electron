// const openDialogParams = {
//          properties: [ 'openFile', 'multiSelections' ],
//          filters: [
//             { name: 'Images', extensions: [ 'jpg', 'png' ] }
//          ]
//       };

import { blobURLFromArrayBuffer } from '@/util/image.js';
import { isImageFilePath, getExtension, getFileName } from '@/util/path.js';
import { glitchFilefromFileInput, glitchFileToJSON } from '@/util/GlitchFile.js';
import store from '@/store/index.js';

let inputEl = null;

export function initFileInputField () {
	if ( ! inputEl ) {
		// the input element is added in public/index.html
		// because some browsers won't work with a file
		// input field created in javascript
		inputEl = document.querySelector( '#file-input' );

		inputEl.onchange = event => { 

			const files = event.target.files;
			const filePromises = Array.from( files )
				.map( file => glitchFilefromFileInput( file ) );

			Promise
				.all( filePromises )
				.then( glitchFiles => {
					store.dispatch( 'openFiles', glitchFiles );
				} );
		}
	}
}

export function exportFileAs ( glitchFile ) {
	if ( glitchFile.glitchBlobURL ) {
		const linkEl = document.createElement( 'a' );
		linkEl.style = 'display: none';
		
		document.body.appendChild( linkEl );

		linkEl.download = getFileName( glitchFile.fileName ) + '.png';
		linkEl.href = glitchFile.glitchBlobURL;
		linkEl.click();

		document.body.removeChild( linkEl );
	} else {
		console.log( `ERROR: File doesn't have a glitchBlobURL` );
	}
}

export function saveFileAs ( glitchFile ) {
	return glitchFileToJSON( glitchFile )
		.then( json => {
			const fileBlob = new Blob( [ json ], { type: 'octet/stream' } );
        	const blobURL = URL.createObjectURL( fileBlob );

			const linkEl = document.createElement( 'a' );
			linkEl.style = 'display: none';
			
			document.body.appendChild( linkEl );

			linkEl.download = getFileName( glitchFile.fileName ) + '.glitch';
			linkEl.href = blobURL;
			linkEl.click();

			document.body.removeChild( linkEl );
			URL.revokeObjectURL( blobURL );
		} );
}