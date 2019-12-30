<template>
	<div class="page edit-page">
		<tab-bar />
		<controls :fileId="activeFileId" v-if="activeFileId" />
		<workspace v-if="activeFileId" :fileId="activeFileId">
			<glitch-image :fileId="activeFileId" />
			<export-btn v-if="activeFileId" :fileId="activeFileId" slot="workspace-controls">export</export-btn>
			<save-btn v-if="activeFileId" :fileId="activeFileId" slot="workspace-controls">save</save-btn>
			<button v-if="! isElectron" class="btn about-btn" slot="workspace-info" @click="infoClicked" :class="infoBtnCSSClasses">about</button>
		</workspace>
		<div class="welcome-text-container" v-if="!activeFileId">
			<div class="welcome-text">
				<h1 class="headline">Welcome</h1>
				<p>Select a files from your hard drive and start glitching.</p>
				<button v-if="isElectron" class="btn" @click="openClicked">Open Files</button>
				<label v-if="!isElectron" for="file-input" class="btn">Open Files</label>
			</div>
		</div>
	</div>
</template>

<script>
import TabBar from '@/components/EditPage/TabBar.vue';
import GlitchImage from '@/components/EditPage/GlitchImage.vue';
import Controls from '@/components/EditPage/Controls.vue';
import Workspace from '@/components/EditPage/Workspace.vue';
import ExportBtn from '@/components/EditPage/ExportBtn.vue';
import SaveBtn from '@/components/EditPage/SaveBtn.vue';

export default {
	name: 'EditPage',
	components: { TabBar, GlitchImage, Controls, Workspace, ExportBtn, SaveBtn },
	computed: {
		activeFileId () {
			return this.$store.getters.activeFileId;
		},
		infoBtnCSSClasses () {
			return  {
				'is-active': this.$store.getters.isShowingAbout
			}
		},
		isElectron () {
			return process.env.IS_ELECTRON;
		}
	},
	methods: {
		openClicked () {
			this.$store.dispatch( 'requestToOpenFiles' );
		},
		infoClicked () {
			this.$store.dispatch( 'toggleAbout' );
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

.edit-page .about-btn {
	background-color: var(--white);
}

</style>