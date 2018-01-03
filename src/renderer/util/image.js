import { loadFile } from '@/util/file.js';
import { toArrayBuffer  } from '@/util/buffer.js';
import { lookup } from 'mime-types';
import blobUtil from 'blob-util';

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

export function blobURLFromImageFile ( imagePath ) {
	return loadFile( imagePath )
		.then( file => {
			return blobUtil
				.arrayBufferToBlob( toArrayBuffer( file.fileContent ), lookup( imagePath ) )
				.then( blob => blobUtil.createObjectURL( blob ) );
		} );
}

export function arrayBufferToBlob ( arrayBuffer ) {
	return blobUtil.arrayBufferToBlob( arrayBuffer );
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
	return blobUtil.dataURLToBlob( dataURL )
		.then( blob => {
			return blobUtil.createObjectURL( blob );	
		} );
}

export function getBlobURL ( blob ) {
	return blobUtil.createObjectURL( blob );
}

export function getImageSize ( img ) {
	return {
		width: img.width || img.naturalWidth,
		height: img.height || img.naturalHeight
	};
}