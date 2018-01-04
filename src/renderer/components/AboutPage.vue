<template>
	<div class="about-page-wrapper">
		<transition name="about">
			<div class="about-page-background" v-if="isShowing">
				<div class="about-page">
					<div class="about-icon-container">
						<img :src="appIcon" class="about-icon" />
					</div>
					<div class="about-text">
						<h1 class="about-app-name center-text">{{ appName }}</h1>
						<p class="center-text">Version {{ appVersion }}</p>
						<p class="about-small center-text">Copyright &copy; 2018 Georg Fischer</p>
						<p class="about-small center-text about-margin"><a href="http://snorpey.github.io/jpg-glitch-electron" @click="linkClicked">Website</a> <a href="https://github.com/snorpey/jpg-glitch-electron" @click="linkClicked">Report a bug</a></p>
						<p class="about-small center-text about-margin">Thank you for using this software.<br /> Have a great day!</p>
					</div>
					<button class="about-page-close" @click="closeClicked">&times;</button>
				</div>
			</div>
		</transition>
	</div>
</template>

<style>
.about-page-wrapper {
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
}

.about-page-background {
	background-color: rgba(0, 0, 0, 0.3);
	width: 100%;
	height: 100vh;
	position: relative;
}

.about-page {
	width: 400px;
	max-width: 90%;
	padding: 40px;
	border-radius: 3px;
	background-color: #fff;
	position: absolute;
	left: 50%;
	top: 50%;
	transform: translateX(-50%) translateY(-50%);
}

.about-icon-container {
	display: flex;
	justify-content: center;
	padding: 40px;
}

.about-icon {
	width: 128px;
	height: 128px;
}

.about-app-name {
	font-size: 130%;
	font-weight: bold;
}

.about-text {
	line-height: 1.5;
}

.about-small {
	font-size: 80%;
	opacity: 0.7;
}

.about-margin {
	margin-top: 20px;
}

.about-page-close {
	position: absolute;
	border: none;
	background: transparent;
	font-weight: 100;
	top: 2px;
	right: 10px;
	font-size: 30px;
	cursor: pointer;
	opacity: 0.7;
}

.about-page-close:hover {
	opacity: 1;
}

</style>

<script>
import pkg from '../../../package.json';
import { openLink } from '../util/link.js';

export default {
	computed: {
		isShowing () {
			return this.$store.getters.isShowingAbout;
		},
		appIcon () {
			return 'static/512x512.png';
		},
		appName () {
			return pkg.build.productName;
		},
		appVersion () {
			return pkg.version;
		}
	},
	methods: {
		closeClicked () {
			this.$store.dispatch( 'hideAbout' );
		},
		linkClicked ( event ) {
			event.preventDefault();
			
			const url = event.target.href;
			openLink( url );
		}
	}
}
</script>