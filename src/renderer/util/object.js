export function clone ( obj = null ) {
	return JSON.parse( JSON.stringify( obj ) );
}