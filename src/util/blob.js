// import blobUtil from 'blob-util';

export function revokeObjectURL ( blobURL ) {
	// blobUtil.revokeObjectURL( blobURL );
	URL.revokeObjectURL( blobURL );
}