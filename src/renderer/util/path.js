import { basename, extname } from 'path';

export function getFileName( filePath, includeExtension = false ) {
	if ( includeExtension ) {
		return basename( filePath );
	} else {
		return basename( filePath, extname( filePath ) );
	}
}

export function getExtension ( filePath ) {
	let extension = extname( filePath );
	
	if ( extension.indexOf( '.' ) === 0 ) {
		extension = extension.substr( 1 );
	}
	
	return extension.toLowerCase();
}