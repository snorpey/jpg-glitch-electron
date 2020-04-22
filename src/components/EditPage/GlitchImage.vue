<template>
	<!-- <div class="glitch-image-container"> -->
		<img
			v-if="dataURL"
			:src="dataURL"
			class="glitch-image"
			@load="imageLoaded"
		/>
	<!-- </div> -->
</template>

<style>
.glitch-image {
	display: block;
}
</style>

<script>
import glitch from 'glitch-canvas-browser/glitch-canvas-browser.es6';
import { eventBus } from '@/util/eventBus.js';

export default {
	name: 'GlitchImage',
	props: [ 'fileId' ],
	data () {
		return {
			dataURL: null,
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
						.toDataURL()
						.then( dataURL => {
							this.dataURL = dataURL;

							this.$store.dispatch( 'updateGlitch', {
								fileId: this.fileId,
								dataURL
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
