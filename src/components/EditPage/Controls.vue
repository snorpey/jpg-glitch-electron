<template>
	<div class="controls inverse-color" v-if="params">
		<div v-for="(value, key) in params" class="control-item">
			<div class="text-display">
				<label class="text-label" :for="'control-' + key">{{ key }}</label>
				<input
					class="number-display"
					type="number"
					:value="value"
					:id="'control-' + key"
					:data-control-id="key"
					min="1"
					max="100"
					@input="controlChanged"
				>
			</div>
			<input
				class="slider"
				type="range"
				:value="value"
				:data-control-id="key"
				min="1"
				max="100"
				@input="controlChanged"
			>
		</div>
		<div class="control-item">
			<button class="btn" @click="randomClicked()">Random</button>
		</div>
	</div>
</template>

<style>
.controls {
	padding: 0.8em;
	display: flex;
	flex-shrink: 0;
}

.control-item {
	width: 25%;
	height: 50%;
	margin-bottom: 0.4em;
	padding: 0 0.8em;
}

.text-display {
	width: 100%;
	display: flex;
	justify-content: space-between;
	margin-bottom: 2px;
}

.text-label {
	font-weight: 100;
}

.number-display {
	text-align: right;
}

input[type=range] {
	-webkit-appearance: none;
	width: 100%;
}

input[type=range]:focus {
	outline: none;
}

input[type='range'] {
	background-color: transparent;
}

input[type=range]::-webkit-slider-runnable-track {
	height: 100%;
	border: none;
	background-color: transparent;
	position: relative;
	background: linear-gradient(
		to bottom,
		rgba(255,255,255,0) 0%,
		rgba(255,255,255,0) 41.9%,
		rgba(255,255,255,0.2) 42%,
		rgba(255,255,255,0.2) 58%,
		rgba(255,255,255,0) 58.1%,
		rgba(255,255,255,0) 100%
	);
}

/*slider thumb clickable area*/

input[type=range]::-webkit-slider-thumb {
	height: 20px;
	width: 20px;
	border-radius: 45px;
	transition: background-color 0.2s;
	position: relative;
	cursor: pointer;
	appearance: none;
	border: none;
	background: radial-gradient(
		ellipse at center,
		rgba(255,255,255,1) 0%,
		rgba(255,255,255,1) 30%,
		rgba(255,255,255,0) 33%,
		rgba(255,255,255,0) 100%
	);
	-webkit-appearance: none;
	border: 1px transparent solid;
}

input[type=range]:hover::-webkit-slider-thumb,
input[type=range]:active::-webkit-slider-thumb,
input[type=range]:focus::-webkit-slider-thumb {
	background: radial-gradient(
		ellipse at center,
		rgba(255,255,255,1) 0%,
		rgba(255,255,255,1) 30%,
		rgba(255,255,255,0.2) 33%,
		rgba(255,255,255,0.2) 100%
	);

	border: 1px #fff solid;
}

.has-touch input[type=range]::-webkit-slider-thumb {
	height: 40px;
	width: 40px;
	top:  2px;
}

</style>

<script>
export default {
	props: [ 'fileId' ],
	computed: {
		file () {
			return this.fileId ? this.$store.getters.fileById( this.fileId ) : null;
		},
		params () {
			return this.file ? this.$store.getters.params( this.fileId ) : null;
		}
	},
	methods: {
		controlChanged( event ) {
			const key = event.target.getAttribute( 'data-control-id' );
			const value = parseInt( event.target.value, 10 );

			this.$store.dispatch( 'updateControl', {
				fileId: this.fileId,
				key,
				value
			} );
		},

		randomClicked () {
			this.$store.dispatch( 'randomControlValues', {
				fileId: this.fileId
			} );
		}
	}
}
</script>