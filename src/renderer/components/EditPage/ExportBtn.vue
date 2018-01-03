<template>
	<button
		class="btn file-import-btn"
		@click="exportClicked"
	><slot /></button>
</template>

<script>
export default {
	props: [ 'fileId' ],
	methods: {
		exportClicked () {
			this.$store.dispatch( 'requestToExportImage', this.fileId );
		}
	}
}
</script>