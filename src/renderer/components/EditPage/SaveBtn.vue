<template>
	<button class="btn file-import-btn" @click="saveClicked"><slot /></button>
</template>

<script>
export default {
	props: [ 'fileId' ],
	methods: {
		saveClicked () {
			this.$store.dispatch( 'saveFile', this.fileId );
		}
	}
}
</script>