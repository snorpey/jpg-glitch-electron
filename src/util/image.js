import { loadFile } from '@/util/file.js';
import { toArrayBuffer  } from '@/util/buffer.js';
import { lookup as getMimeTypeFromFilePath } from 'mime-types';
import { arrayBufferToBlob, createObjectURL, dataURLToBlob } from 'blob-util';

export function loadLocalImage ( imagePath ) {
	return blobFromImageFile( imagePath )
		.then( loadImage );
}

export function loadLocalImageToImageData ( imagePath ) {
	return blobURLFromImageFile( imagePath )
		.then( loadImage )
		.then( imageToImageData );
}

export function loadImage ( imagePath ) {
	return new Promise( ( resolve, reject ) => {
		const img = new Image ();

		img.onload = () => {
			resolve( img );
		};

		img.onerror = reject;
		img.src = imagePath;
	} );
}

export function blobURLFromImagePath ( imagePath ) {
	return loadFile( imagePath )
		.then( file => {
			const mimeType = getMimeTypeFromFilePath( imagePath );
			const arrayBuffer = toArrayBuffer( file.fileContent );

			return createObjectURL( arrayBufferToBlob( arrayBuffer, mimeType ) )
		} );
}

export function blobURLFromArrayBuffer ( arrayBuffer, mimeType ) {
	return createObjectURL( arrayBufferToBlob( arrayBuffer, mimeType ) )		
}

function imageToImageData ( img ) {
	const { width, height } = getImageSize( img );
	const canvasEl = document.createElement( 'canvas' );
	canvasEl.width = width;
	canvasEl.height = height;
	
	const ctx = canvasEl.getContext( '2d' );

	ctx.drawImage( img, 0, 0, width, height );

	const imageData = ctx.getImageData( 0, 0, width, height );

	if ( imageData.data && imageData.data.length ) {
		if ( typeof imageData.width === 'undefined' ) {
			imageData.width = width;
		}

		if ( typeof imageData.height === 'undefined' ) {
			imageData.height = height;
		}
	}

	return imageData;
}

export function dataURLtoBlobURL ( dataURL ) {
	return createObjectURL( dataURLToBlob( dataURL ) );
}

export function getBlobURL ( blob ) {
	return createObjectURL( blob );
}

export function getImageSize ( img ) {
	return {
		width: img.width || img.naturalWidth,
		height: img.height || img.naturalHeight
	};
}