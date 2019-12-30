<template>
	<div id="app" :class="appCSSClasses">
		<router-view></router-view>
		<about-page />
	</div>
</template>

<style>
#app {
	height: 100%;
	width: 100%;
	max-height: 100vh;
}
</style>

<script>
import AboutPage from '@/components/AboutPage';

export default {
	name: 'jpg-glitch-electron',
	components: { AboutPage },
	data () {
		return {
			menu: null
		}
	},
	computed: {
		appCSSClasses () {
			return {
				'is-mac': process.platform === 'darwin'
			}
		},
		fileMenuItem () {
			return this.hasMenu ? this.menu.items.filter( item => item.id === 'file' )[0] : null;
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
		},
		hasMenu () {
			return !! this.menu;
		}
	},

	created () {
		if ( process.env.IS_ELECTRON ) {
			import( '@/menu.js' )
				.then( module => {
					this.menu = module.menu;
					module.initMenu();
				} );
		}
	},

	mounted () {
		window.addEventListener( 'beforeunload', event => {
			this.$store.dispatch( 'quit' );
		} );

		// window.onbeforeunload = function (e) { return false }
	},
	watch: {
		// dynamically enable / disable menu items
		isSaveMenuItemEnabled ( enabled ) {
			if ( this.hasMenu ) {
				this.saveMenuItem.enabled = enabled;
			}
		},
		isSaveAsMenuItemEnabled ( enabled ) {
			if ( this.hasMenu ) {
				this.saveAsMenuItem.enabled = enabled;
			}
		},
		isExportMenuItemEnabled ( enabled ) {
			if ( this.hasMenu ) {
				this.exportMenuItem.enabled = enabled;
			}
		},
		hasMenu ( hasMenu ) {
			if ( this.hasMenu ) {
				this.saveMenuItem.enabled = false;
				this.saveAsMenuItem.enabled = false;
				this.exportMenuItem.enabled = false;
			}
		}
	}
}
</script>
