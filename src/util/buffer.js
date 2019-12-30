export function toArrayBuffer ( buf ) {
	const ab = new ArrayBuffer( buf.length );
	const view = new Uint8Array( ab );
	
	for ( var i = 0, len = buf.length; i < len; ++i ) {
		view[i] = buf[i];
	}

	return ab;
}