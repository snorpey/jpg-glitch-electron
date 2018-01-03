<template>
	<button class="btn file-import-btn" @click="importClicked"><slot /></button>
</template>

<script>
export default {
	methods: {
		importClicked () {
			this.$store.dispatch( 'requestToImportImage' );
		}
	}
}
</script>