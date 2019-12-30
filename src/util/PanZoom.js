import { getCSSMatrix, cssMatrixToTransformObj } from './css.js';
import { isDescendant } from './dom.js';
import elementResizeEvent from 'element-resize-event';

export class PanZoom {
	constructor ( containerEl, targetEl, opts = { } ) {
		this.containerEl = containerEl;
		this.targetEl = targetEl;

		this.canZoomWithPonter = true
		this.shouldCaptureFn = opts.shouldCaptureFn || function ( el ) { return true; };
		this.limitToContainer = typeof opts.limitToContainer === 'boolean' ? opts.limitToContainer : true;
		this.limitPadding = opts.limitPadding || 50;
		this.matrix = getCSSMatrix( this.targetEl );
		this.transform = cssMatrixToTransformObj( this.matrix );

		this.x = this.transform.translateX || 0;
		this.y = this.transform.translateY || 0;
		this.scale = 1;

		this.active = 0;
		this.lastPoints = [ ];
		this.centerScale = 1;
		
		this.containerBounds = this.containerEl.getBoundingClientRect();
		this.targetBounds = this.targetEl.getBoundingClientRect();

		this.forceCenter = false;

		this.updateAnimationFrameId = NaN;
		this.scaleAnimationFrameId = NaN;
		this.centerAnimationFrameId = NaN;
		this.resizeTimeoutId = NaN;

		this.targetElSize = { width: 100, height: 100 };
		this.containerElSize = { width: 100, height: 100 };
		
		this.isAnimating = false;

		// this.centerQueued = false;
		// this.forceCenter = false;

		// this.pointerPressed = this.pointerPressed.bind( this );
		this.pointerMovedHandler = event => this.pointerMoved( event );
		this.pointerReleasedHandler = event => this.pointerReleased( event );
		// this.pointerReleased = this.pointerReleased.bind( this );
		// this.wheelTurned = this.wheelTurned.bind( this );

		this.containerEl.addEventListener( 'mousedown', event => this.pointerPressed( event ) );
		this.containerEl.addEventListener( 'touchstart', event => this.pointerPressed( event ) );
		this.containerEl.addEventListener( 'wheel', event => this.wheelTurned( event ) );
		this.containerEl.addEventListener( 'dblclick', event => this.animateToCenter( event ) );

		window.addEventListener( 'resize', event => this.resized( event ) );

		this.targetEl.style.WebkitTransformOrigin = targetEl.style.transformOrigin = '0 0';

		elementResizeEvent( this.targetEl, event => this.updateDimensions( event ) );
		elementResizeEvent( this.containerEl, event => this.updateDimensions( event ) );

		this.updateDimensions();
	}

	reset () {
		this.updateValues( this.transform.translateX || 0, this.transform.translateY || 0, 1 );
	}

	updateDimensions () {
		this.containerElSize = {
			width: this.containerEl.clientWidth,
			height: this.containerEl.clientHeight
		};
		
		this.targetElSize = {
			width: this.targetEl.clientWidth,
			height: this.targetEl.clientHeight
		};

		this.containerBounds = this.containerEl.getBoundingClientRect();
		this.targetBounds = this.targetEl.getBoundingClientRect();

		if ( this.forceCenter ) {
			this.setToCenter();
		}

		this.updateValues( this.x, this.y, this.scale );
	}

	updateValues ( newX, newY, newScale ) {
		cancelAnimationFrame( this.updateAnimationFrameId );

		if ( this.limitToContainer && this.targetEl !== this.containerEl && this.containerBounds ) {
			// const targetBounds = this.targetEl.getBoundingClientRect();
			
			// console.log( targetBounds.width, targetBounds.height );
			
			if ( newX !== this.x || newY !== this.y || newScale !== this.scale ) {
				const scaleDelta = 1 / ( this.scale / newScale );

				const inverseScale = 1 / newScale;
				const scaledPadding = this.limitPadding;

				const scaledTargetSize = {
					width: this.targetBounds.width,
					height: this.targetBounds.height
				};

				const scaledContainerSize = {
					width: this.containerBounds.width,
					height: this.containerBounds.height
				};

				if ( newX > scaledContainerSize.width - scaledPadding ) {
					newX = scaledContainerSize.width - scaledPadding;
				}

				if ( newX < 0 - scaledTargetSize.width + scaledPadding ) {
					newX = 0 - scaledTargetSize.width + scaledPadding;
				}

				if ( newY > scaledContainerSize.height - scaledPadding ) {
					newY = scaledContainerSize.height - scaledPadding;
				}

				if ( newY < 0 - scaledTargetSize.height + scaledPadding ) {
					newY = 0 - scaledTargetSize.height + scaledPadding;
				}
			}
		}

		newScale = Math.min( 5, Math.max( 0.01, newScale ) );
		
		if ( this.scale === newScale && newScale === 5 ) {
			return;
		}

		this.x = newX;
		this.y = newY;
		this.scale = newScale;

		this.updateAnimationFrameId = requestAnimationFrame( () => this.update() );
	}

	update () {
		this.targetEl.style.WebkitTransform = this.targetEl.style.transform = 'translate3d(' + this.x + 'px, ' + this.y + 'px, 0) scale(' + this.scale + ')';
	}

	wheelTurned ( event ) {
		if ( ! this.shouldCaptureFn( event.target ) ) { return; }
		if ( ! this.canZoomWithPonter ) { return; }

		this.forceCenter = false;
		
		event.preventDefault();

		// const targetBounds = this.targetEl.getBoundingClientRect();

		let delta = event.deltaY;

		if ( event.deltaMode === 1 ) { // 1 is "lines", 0 is "pixels"
			// Firefox uses "lines" when mouse is connected
			delta *= 15;
		}

		// stop mouse wheel producing huge values
		delta = Math.max( Math.min( delta, 60 ), -60 );

		const scaleDiff = ( delta / 300 ) + 1;

		// avoid to-small values
		if ( this.scale * scaleDiff < 0.05 ) { return; }

		this.updateValues(
			this.x - ( event.pageX - this.targetBounds.left ) * ( scaleDiff - 1 ),
			this.y - ( event.pageY - this.targetBounds.top ) * ( scaleDiff - 1 ),
			this.scale * scaleDiff
		);
	}

	firstPointerPressed ( event ) {
		this.lastPoints = getPoints( event );

		document.addEventListener( 'mousemove', this.pointerMovedHandler );
		document.addEventListener( 'mouseup', this.pointerReleasedHandler );
		
		document.addEventListener( 'touchmove', this.pointerMovedHandler );
		document.addEventListener( 'touchend', this.pointerReleasedHandler );
	}

	pointerPressed ( event ) {
		if ( event.type == 'mousedown' && event.which != 1 ) {
			return;
		}
		
		if ( ! this.shouldCaptureFn( event.target ) ) {
			return;
		}

		
		if ( isDescendant( this.containerEl, event.target ) ) {
			
			this.forceCenter = false;
			event.preventDefault();
			
			this.lastPoints = getPoints( event );
			this.active++;
	
			if ( this.active === 1 ) {
				this.firstPointerPressed( event );
			}
		}
	}

	pointerMoved ( event ) {
		if ( event && event.target /*&& isDescendant( this.containerEl, event.target )*/ ) {
			event.preventDefault();
			this.forceCenter = false;

			const points = getPoints( event );
			const averagePoint = points.reduce( getMidpoint );
			const averageLastPoint = this.lastPoints.reduce( getMidpoint );

			const tmpX = this.x + averagePoint.x - averageLastPoint.x;
			const tmpY = this.y + averagePoint.y - averageLastPoint.y;
			
			if ( points[1] ) {
				if ( ! this.canZoomWithPonter ) { return; }
				const scaleDiff = touchDistance( points[0], points[1] ) / touchDistance( this.lastPoints[0], this.lastPoints[1] );
				
				this.updateValues(
					tmpX - ( averagePoint.x - targetBounds.left ) * ( scaleDiff - 1 ),
					tmpY - ( averagePoint.y - targetBounds.top ) * ( scaleDiff - 1 ),
					this.scale * scaleDiff
				);
			} else {
				this.updateValues( tmpX, tmpY, this.scale );
			}

			this.lastPoints = points;
		}
	}

	pointerReleased ( event ) {
		event.preventDefault();
		this.active--;

		this.lastPoints.pop();

		if ( this.active ) {
			this.lastPoints = getPoints( event );
			return;
		} else {
			document.removeEventListener( 'mousemove', this.pointerMovedHandler );
			document.removeEventListener( 'mouseup', this.pointerReleasedHandler );

			document.removeEventListener( 'touchmove', this.pointerMovedHandler );
			document.removeEventListener( 'touchend', this.pointerReleasedHandler );
		}
	}

	resized () {
		cancelAnimationFrame( this.resizeTimeoutId );

		this.resizeTimeoutId = requestAnimationFrame( () => this.setToCenter() );
	}

	setToCenter () {
		this.forceCenter = true;
		this.updateValues( this.centerValues.x, this.centerValues.y, this.centerValues.scale );
	}

	animateToCenter () {
		let deltaX = 0;
		let deltaY = 0;
		let deltaScale = 0;
		
		const easing = 0.1;

		this.centerScale = this.centerValues.scale;

		cancelAnimationFrame( this.scaleAnimationFrameId );
		cancelAnimationFrame( this.centerAnimationFrameId );
			
		function centerAnimationStep () {
			deltaX = this.centerValues.x - this.x;
			deltaY = this.centerValues.y - this.y;
			deltaScale = this.centerValues.scale - this.scale;

			if (
				Math.abs( deltaX ) > 1 ||
				Math.abs( deltaY ) > 1 ||
				Math.abs( deltaScale ) > 0.01
			) {
				this.updateValues( this.x + deltaX * easing, this.y + deltaY * easing, this.scale + deltaScale * easing );

				this.centerAnimationFrameId = requestAnimationFrame( () => centerAnimationStep.bind(this)() );
			} else {
				this.updateValues( this.centerValues.x, this.centerValues.y, this.centerValues.scale );
			}
		}

		this.centerAnimationFrameId = requestAnimationFrame( () => centerAnimationStep.bind(this)() );
	}
	
	setScale ( newScale ) {
		const easing = 0.2;
		
		const targetX = ( this.containerBounds.width - this.targetBounds.width * newScale ) / 2;
		const targetY = ( this.containerBounds.height - this.targetBounds.height * newScale ) / 2;
		
		let deltaX = 0;
		let deltaY = 0;
		let deltaScale = 0;

		cancelAnimationFrame( this.scaleAnimationFrameId );
		cancelAnimationFrame( this.centerAnimationFrameId );
			
		function scaleAnimationStep () {
			deltaX = targetX - this.x;
			deltaY = targetY - this.y;
			deltaScale = newScale - this.scale;

			if (
				Math.abs( deltaX ) > 1 ||
				Math.abs( deltaY ) > 1 ||
				Math.abs( deltaScale ) > 0.01
			) {
				updateValues( this.x + deltaX * easing, this.y + deltaY * easing, this.scale + deltaScale * easing );
										
				this.scaleAnimationFrameId = requestAnimationFrame( scaleAnimationStep );
			} else {
				updateValues( targetX, targetY, newScale );
			}
		}

		scaleAnimationStep();

		return self;
	}

	get centerValues () {
		let targetScale = 1;

		// const targetBounds = this.targetEl.getBoundingClientRect();
		// console.log( 'CENTER', this.targetBounds.width, this.targetBounds.height );
		// const targetBounds = this.targetEl.getBoundingClientRect();

		if ( this.targetElSize.width > this.containerElSize.width || this.targetElSize.height > this.containerElSize.height ) {
			targetScale = Math.min(
				this.containerElSize.width / this.targetElSize.width,
				( this.containerElSize.height - 80 ) / this.targetElSize.height
			);
		}

		return {
			x: ( this.containerElSize.width - this.targetElSize.width * targetScale ) / 2,
			y: ( this.containerElSize.height - this.targetElSize.height * targetScale ) / 2,
			scale: targetScale
		};
	}
}

function getXY ( obj ) {
	return {
		x: obj.pageX,
		y: obj.pageY
	};
}

function touchDistance ( touch1, touch2 ) {
	const x = Math.abs( touch2.x - touch1.x );
	const y = Math.abs( touch2.y - touch1.y );
	return Math.sqrt( x * x + y * y );
}

function getMidpoint ( point1, point2 ) {
	return {
		x: ( point1.x + point2.x ) / 2,
		y: ( point1.y + point2.y ) / 2
	};
}

function getPoints ( event ) {
	if ( event.touches ) {
		return Array.prototype.map.call( event.touches, getXY );
	} else {
		return [ getXY( event ) ];
	}
}
