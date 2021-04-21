<template>
	<nav class="tab-bar inverse-color" v-if="files.length" :class="tabsCssClasses">
		<div class="tabs-wrapper">
			<ul class="tabs">
				<li
					v-for="file in files"
					class="tab"
					:class="tabCSSClasses( file.id )"
					@click="activateFile( file.id )"
				>
					<span
						v-if="hasUnsavedChanges( file.id )"
						:title="file.name + ' has unsaved changes'"
						class="unsaved-changes-indicator"
					>*</span>
					<button class="tab-name tab-name-btn" v-if="! isFileActive( file.id )">{{ file.name }}</button>
					<span class="tab-name" v-if="isFileActive( file.id )">{{ file.name }}</span>
					<button class="tab-close-btn" @click="closeFile( file.id, $event )">&times;</button>
				</li>
			</ul>
		</div>
		<import-btn class="tab-open-btn">+</import-btn>
	</nav>
</template>

<style>
.tab-bar {
	width: 100%;
	display: flex;
	padding: 0.4em 0.8em 0 0.8em;
	background-color: var(--darker-gray) !important;
	flex-shrink: 0;
}

.is-mac .tab-bar {
	padding-top: 35px;
}

.tabs-wrapper {
	overflow: hidden;
	margin-right: 0.8em;
	display: flex;
	align-items: flex-end;
}

.tabs--scrollable .tabs-wrapper {
	overflow: auto;
}

.tabs--scrollable .tabs-wrapper::-webkit-scrollbar {
    height: 2px;
    background: var(--dark-gray);
}

.tabs--scrollable .tabs-wrapper::-webkit-scrollbar-thumb {
    background: var(--dark-gray-light);
    height: 2px;
}

.tab-bar .tab-open-btn {
	flex-shrink: 0;
	margin-bottom: 0.2em;
	width: 30px;
	height: 30px;
}

.tab-open-btn::before {
	display: none;
}

.tabs {
	width: 100%;
	margin-right: 0.8em;
	display: flex;
	position: relative;
}

.tab {
	width: 100%;
	height: 100%;
	display: block;
	/*padding: 0.4em 0;*/
	display: flex;
	position: relative;
	border-top-right-radius: 2px;
	border-top-left-radius: 2px;
	overflow: hidden;
	border-top: 1px var(--dark-gray) solid;
	border-left: 1px var(--dark-gray) solid;
	border-right: 1px var(--dark-gray) solid;
	transition: all 0.2s;
	/* max-width: 35ch; */
	min-width: 10ch;
	cursor: pointer;
}

.tab--noshrink {
	max-width: 10ch;
	flex-shrink: 0;
}

.tab:hover {
	border-top-color: var(--dark-gray-light);
	border-left-color: var(--dark-gray-light);
	border-right-color: var(--dark-gray-light);
}
	.tab-name {
		width: calc(100% - 25px);
		display: block;
		margin: 0 20px;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		text-align: center;
		line-height: 2.5em;
		cursor: pointer;
	}

	.tab-close-btn {
		flex-shrink: 0;
		background-color: transparent;
		opacity: 0.8;
		border: none;
		transition: all 0.2s ease;
		cursor: pointer;
		font-weight: 100;
		outline: none;
		position: absolute;
		right: 10px;
		top: 50%;
		transform: translateY(-50%);
		z-index: 2;
		cursor: pointer;
	}

	.tab-close-btn:hover {
		opacity: 1;
	}

	.tab-name-btn {
		background-color: transparent;
		border: none;
		font-weight: 100;
		outline: none;
	}

	.unsaved-changes-indicator {
		position: absolute;
		display: block;
		left: 10px;
		top: 50%;
		transform: translateY(-50%);
		text-indent: -100px;
		width: 4px;
		height: 4px;
		overflow: hidden;
		border: 1px var(--text-color) solid;
		border-radius: 4px;
	}

	.tab.is-active .unsaved-changes-indicator {
		border-width: 2px;
	}

	.tab + .tab {
		margin-left: 0.5em;
	}

.tab.is-active {
	background-color: var(--dark-gray);
}

</style>

<script>
import ImportBtn from '@/components/EditPage/ImportBtn.vue';
export default {
	components: { ImportBtn },
	data () {
		return {
			windowWidth: window.innerWidth
		}
	},
	computed: {
		files () {
			return this.$store.getters.files.map( file => {
				return {
					id: file.id,
					name: file.fileName || 'Untitled'
				}
			} );
		},
		areTabsScrollable () {
			return this.windowWidth - 60 < ( this.files.length * 80 );
		},
		tabsCssClasses () {
			return {
				'tabs--scrollable' : this.areTabsScrollable
			};
		}
	},
	methods: {
		isFileActive ( fileId ) {
			return this.$store.getters.isFileActive( fileId );
		},
		hasUnsavedChanges ( fileId ) {
			return this.$store.getters.hasFileUnsavedChanges( fileId );
		},
		activateFile ( fileId ) {
			this.$store.dispatch( 'activateFile', fileId );
		},
		closeFile ( fileId, event ) {
			this.$store.dispatch( 'closeFile', fileId );
			event.preventDefault();
		},
		tabCSSClasses ( fileId ) {
			return {
				'is-active': this.isFileActive( fileId )
			};
		},
		onResize() {
			this.windowWidth = window.innerWidth;
		}
	},
	mounted() {
		this.$nextTick( () => {
			window.addEventListener( 'resize', this.onResize );
		} );
	},
	beforeDestroy() { 
		window.removeEventListener( 'resize', this.onResize ); 
	}
}
</script>