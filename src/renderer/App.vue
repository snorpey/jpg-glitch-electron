<template>
	<div id="app" :class="appCSSClasses">
		<router-view></router-view>
		<about-page />
	</div>
</template>

<script>
import css from '../style/index.css';
import { menu } from './menu.js';
import AboutPage from '@/components/AboutPage';

export default {
	name: 'jpg-glitch-electron',
	components: { AboutPage },
	computed: {
		appCSSClasses () {
			return {
				'is-mac': process.platform === 'darwin'
			}
		},
		fileMenuItem () {
			return menu.items.filter( item => item.id === 'file' )[0];
		},
		saveMenuItem () {
			return this.fileMenuItem ? this.fileMenuItem.submenu.items.filter( item => item.id === 'save' )[0] : null;
		},
		saveAsMenuItem () {
			return this.fileMenuItem ? this.fileMenuItem.submenu.items.filter( item => item.id === 'saveas' )[0] : null;
		},
		exportMenuItem () {
			return this.fileMenuItem ? this.fileMenuItem.submenu.items.filter( item => item.id === 'export' )[0] : null;
		},
		hasOpenFiles () {
			return this.$store.getters.files.length;
		},
		activeFile () {
			return this.$store.getters.activeFile;
		},
		isSaveMenuItemEnabled () {
			return !! this.activeFile && !! this.activeFile.filePath;
		},
		isSaveAsMenuItemEnabled () {
			return !! this.activeFile;
		},
		isExportMenuItemEnabled () {
			return !! this.activeFile && !! this.activeFile.glitchBlobURL;
		}
	},
	mounted () {
		window.addEventListener( 'beforeunload', function ( event ) {
			this.$store.dispatch( 'quit' );
		}.bind( this ) );

		this.saveMenuItem.enabled = false;
		this.saveAsMenuItem.enabled = false;
		this.exportMenuItem.enabled = false;

		// window.onbeforeunload = function (e) { return false }
	},
	watch: {
		// dynamically enable / disable menu items
		isSaveMenuItemEnabled ( enabled ) {
			this.saveMenuItem.enabled = enabled;
		},
		isSaveAsMenuItemEnabled ( enabled ) {
			this.saveAsMenuItem.enabled = enabled;
		},
		isExportMenuItemEnabled ( enabled ) {
			this.exportMenuItem.enabled = enabled;
		}
	}
}
</script>

<style>
#app {
	height: 100%;
	width: 100%;
	max-height: 100vh;
}
</style>
