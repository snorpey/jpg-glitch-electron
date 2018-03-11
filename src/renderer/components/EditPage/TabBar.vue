<template>
	<nav class="tab-bar inverse-color" v-if="files.length">
		<ul class="tabs">
			<li v-for="file in files" class="tab" :class="tabCSSClasses( file.id )">
				<span
					v-if="hasUnsavedChanges( file.id )"
					:title="file.name + ' has unsaved changes'"
					class="unsaved-changes-indicator"
				>*</span>
				<button class="tab-name tab-name-btn" v-if="! isFileActive( file.id )" @click="activateFile( file.id )">{{ file.name }}</button>
				<span class="tab-name" v-if="isFileActive( file.id )">{{ file.name }}</span>
				<button class="tab-close-btn" @click="closeFile( file.id )">&times;</button>
			</li>
		</ul>
		<import-btn class="tab-open-btn">+</import-btn>
	</nav>
</template>

<style>
.tab-bar {
	width: 100%;
	display: flex;
	padding: 0.4em 0.8em 0 0.8em;
	background-color: var(--darker-gray);
	flex-shrink: 0;
}

.is-mac .tab-bar {
	padding-top: 23px;
}

.tab-bar .open-btn {
	flex-shrink: 0;
}

.tabs {
	width: calc(100% - 40px);
	margin-right: 0.8em;
	display: flex;
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
}
	.tab-name {
		width: calc(100% - 65px);
		display: block;
		margin: 0 20px;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		text-align: center;
		line-height: 2.5em;
	}

	.tab-close-btn {
		flex-shrink: 0;
		background-color: transparent;
		opacity: 0.8;
		border: none;
		tansition: all 0.2s ease;
		cursor: pointer;
		font-weight: 100;
		outline: none;
		position: absolute;
		right: 10px;
		top: 50%;
		transform: translateY(-50%);
	}

	.tab-close-btn:hover {
		opacity: 1;
	}

	.tab-name-btn {
		background-color: transparent;
		border: none;
		cursor: pointer;
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

.tab.is-active {
	background-color: var(--dark-gray);
}

.tab-open-btn::before {
	display: none;
}
</style>

<script>
import ImportBtn from './ImportBtn';
export default {
	components: { ImportBtn },
	computed: {
		files () {
			return this.$store.getters.files.map( file => {
				return {
					id: file.id,
					name: file.fileName || 'Untitled'
				}
			} );
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
		closeFile ( fileId ) {
			this.$store.dispatch( 'closeFile', fileId );	
		},
		tabCSSClasses( fileId ) {
			return {
				'is-active': this.isFileActive( fileId )
			};
		}
	}
}
</script>