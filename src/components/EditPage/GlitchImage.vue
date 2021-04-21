<template>
	<img
		v-if="blobURL"
		:src="blobURL"
		class="glitch-image"
		@load="imageLoaded"
	/>
</template>

<style>
.glitch-image {
	display: block;
}
</style>

<script>
import glitch from 'glitch-canvas-browser/glitch-canvas-browser.es6';
import { getBlobURL } from '@/util/image.js';
import { eventBus } from '@/util/eventBus.js';

export default {
	name: 'GlitchImage',
	props: [ 'fileId' ],
	data () {
		return {
			blobURL: null,
			rafId: null
		}
	},
	computed: {
		file () {
			return this.fileId ? this.$store.getters.fileById( this.fileId ) : null;
		},
		params () {
			return this.file ? this.$store.getters.params( this.fileId ) : null;
		}
	},
	methods: {
		updateImage () {
			if ( this.file ) {
				const img = new Image();

				img.onload = () => {
					glitch( this.params )
						.fromImage( img )
						.toImageData()
						.then( imageData => {
							const canvas = document.createElement( 'canvas' );
							canvas.width = imageData.width;
							canvas.height = imageData.height;
							
							const ctx = canvas.getContext( '2d' );
							ctx.putImageData( imageData, 0, 0 );

							return new Promise( resolve => {
								canvas.toBlob( resolve, 'image/jpeg', 1.0 );
							} );
						} )
						.then( blob => {
							const blobURL = getBlobURL( blob ); 
							this.blobURL = blobURL;

							this.$store.dispatch( 'updateGlitch', {
								fileId: this.fileId,
								blobURL
							} );
						} );
				}

				img.src = this.file.srcBlobURL;
			}
		},
		imageLoaded () {
			eventBus.$emit( 'glitch' );
		}
	},
	mounted () {
		this.updateImage();
	},
	watch: {
		fileId () {
			this.updateImage();
		},
		params () {
			cancelAnimationFrame( this.rafId );

			this.rafId = requestAnimationFrame( () => {
				this.updateImage();
			} );
		},
	}
}
</script>
