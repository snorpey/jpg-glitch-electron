export function getCSSMatrix ( el ) {
	const style = getComputedStyle( el );

	return style.getPropertyValue( '-webkit-transform' ) ||
		   style.getPropertyValue( '-moz-transform' ) ||
		   style.getPropertyValue( '-ms-transform' ) ||
		   style.getPropertyValue( '-o-transform' ) ||
		   style.getPropertyValue( 'transform' );
}

export function cssMatrixToTransformObj ( matrix ) {
	// this happens when there was no rotation yet in CSS
	if ( matrix === 'none' ) {
		matrix = 'matrix(0,0,0,0,0)';
	}
	
	const obj = { };
	const values = matrix.match( /([-+]?[\d\.]+)/g );

	obj.rotate = ( Math.round(
		Math.atan2(
			parseFloat( values[1] ), 
			parseFloat( values[0] ) ) * ( 180 / Math.PI )
		) || 0
	).toString() + 'deg';
	
	obj.translateStr = values[5] ? values[4] + 'px, ' + values[5] + 'px' : ( values[4] ? values[4] + 'px' : '' );
	
	obj.translateX = parseFloat( values[4] );
	obj.translateY = values[5] ? parseFloat( values[5] ) : 0;	
	
	return obj;
}
