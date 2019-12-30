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
		commit( 'SHOW' );
	},

	hideAbout ( { commit } ) {
		commit( 'HIDE' );
	},

	toggleAbout ( { state, dispatch } ) {
		dispatch( state.show ? 'hideAbout' : 'showAbout' );
	}
};

export default {
	state,
	getters,
	mutations,
	actions
};
