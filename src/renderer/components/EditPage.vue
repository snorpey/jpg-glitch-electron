<template>
	<div class="page edit-page">
		<tab-bar />
		<controls :fileId="activeFileId" v-if="activeFileId" />
		<workspace v-if="activeFileId" :fileId="activeFileId">
			<glitch-image :fileId="activeFileId" />
			<export-btn v-if="activeFileId" :fileId="activeFileId" slot="workspace-controls">export</export-btn>
			<save-btn v-if="activeFileId" :fileId="activeFileId" slot="workspace-controls">save</save-btn>
		</workspace>
		<div class="welcome-text-container" v-if="!activeFileId">
			<div class="welcome-text">
				<h1 class="headline">Welcome</h1>
				<p>Select a files from your hard drive and start glitching.</p>
				<button class="btn" @click="openClicked">Open Files</button>
			</div>
		</div>
	</div>
</template>

<script>
import TabBar from './EditPage/TabBar';
import GlitchImage from './EditPage/GlitchImage';
import Controls from './EditPage/Controls';
import Workspace from './EditPage/Workspace';
import ExportBtn from './EditPage/ExportBtn';
import SaveBtn from './EditPage/SaveBtn';

export default {
	name: 'EditPage',
	components: { TabBar, GlitchImage, Controls, Workspace, ExportBtn, SaveBtn },
	computed: {
		activeFileId () {
			return this.$store.getters.activeFileId;
		}
	},
	methods: {
		openClicked () {
			this.$store.dispatch( 'requestToImportImage' );
		}
	}
}
</script>

<style>
.edit-page {
	display: flex;
	flex-direction: column;
}

.welcome-text-container {
	height: 100%;
	width: 100%;
	display: flex;
	justify-content: center;
	align-items: center;
}

.welcome-text {
	max-width: 220px;
}

.welcome-text .btn {
	margin-top: 3em;
}


</style>