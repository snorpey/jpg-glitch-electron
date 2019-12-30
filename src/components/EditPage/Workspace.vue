<template>
	<div class="workspace">
		<div class="workspace-content">
			<slot />
		</div>
		<div class="workspace-info">
			<slot name="workspace-info" />
		</div>
		<div class="workspace-controls">
			<slot name="workspace-controls" />
		</div>
	</div>
</template>

<style>
.workspace {
	overflow: hidden;
	position: relative;
	width: 100%;
	height: 100%;
}

.workspace-controls {
	position: absolute;
	bottom: 20px;
	right: 20px;
	z-index: 2;
}

.workspace-info {
	position: absolute;
	bottom: 20px;
	left: 20px;
	z-index: 2;
}

.workspace-controls .btn {
	background-color: var(--white);
	height: 32px;
}

.workspace-controls .btn + .btn {
	margin-left: 5px;
}

.workspace-content {
	position: absolute;
	top: 0;
	left: 0;
}
</style>

<script>
import { PanZoom } from '@/util/PanZoom.js';
import { eventBus } from '@/util/eventBus.js';

export default {
	data () {
		return {
			panZoom: null,
			lastZoomId: null
		}
	},
	props: [ 'fileId' ],
	methods: {
		updateWorkspace () {
			if ( this.fileId && this.panZoom && this.lastZoomId !== this.fileId ) {
				this.panZoom.setToCenter();
			}
		}
	},
	mounted () {
		eventBus.$on( 'glitch', this.updateWorkspace.bind( this ) );

		this.panZoom = new PanZoom( this.$el, this.$el.querySelector( '.workspace-content' ) );
	},
	watch: {
		fileId () {
			this.updateWorkspace();
		},

		'$store.getters.activeFile.srcBlobURL' ( blobURL ) {
			this.updateWorkspace();
		}
	}
}
</script>