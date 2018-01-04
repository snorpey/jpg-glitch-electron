const state = {
	show: false
};

const getters = {
	isShowingAbout ( state ) {
		return state.show;
	}
};

const mutations = {
	SHOW ( state ) {
		state.show = true;
	},
	HIDE ( state ) {
		state.show = false;
	}
};

const actions = {
	showAbout ( { commit } ) {
		console.log( 'SHOW' );
		commit( 'SHOW' );
	},

	hideAbout ( { commit } ) {
		commit( 'HIDE' )
	},

	toggleAbout ( { state, dispatch } ) {
		console.log( 'TOGGLE' );
		dispatch( state.show ? 'hideAbout' : 'showAbout' )
	}
};

export default {
	state,
	getters,
	mutations,
	actions
};
