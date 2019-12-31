import Vue from 'vue';
import Vuex from 'vuex';

import About from './modules/About.js';
import Files from './modules/Files.js';

Vue.use( Vuex );

export default new Vuex.Store( {
	modules: {
		Files,
		About
	},
	strict: true//process.env.NODE_ENV !== 'production'
} );
