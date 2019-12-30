// import { extname } from 'path';

// we need these functions to be platform independent
// so we can't rely on the node implementation
// https://locutus.io/php/filesystem/basename/
export function basename ( filePath, suffix ) {
	let path = filePath;
	const lastChar = path.charAt( path.length - 1 );

	if (
		lastChar === '/' ||
		lastChar === '\\'
	) {
		path = path.slice( 0, -1 );
	}

	path = path.replace( /^.*[/\\]/g, '' );

	if (
		typeof suffix === 'string' &&
		path.substr( path.length - suffix.length ) === suffix
	) {
		path = path.substr( 0, path.length - suffix.length );
	}

	return path;
}

// https://stackoverflow.com/a/190878
export function extname ( filePath ) {
	return filePath.split( '.' ).pop();
}

export function getFileName( filePath, includeExtension = false ) {
	if ( includeExtension ) {
		return basename( filePath );
	} else {
		return basename( filePath, '.' + extname( filePath ) );
	}
}

export function getExtension ( filePath ) {
	let extension = extname( filePath );
	
	if ( extension.indexOf( '.' ) === 0 ) {
		extension = extension.substr( 1 );
	}
	
	return extension.toLowerCase();
}

export function isImageFilePath ( filePath ) {
	return [ 'jpg', 'jpeg', 'png', 'gif', 'svg' ].indexOf( getExtension( filePath ) ) !== -1;
}

export function isGlitchFilePath ( filePath ) {
	return [ 'glitch' ].indexOf( getExtension( filePath ) ) !== -1;
}