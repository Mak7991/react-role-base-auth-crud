import * as ShowMediaModal from 'app/store/actions/fuse';

const initialState = {
	state: false,
	options: {
		children: 'Hi'
	}
};

const mediaDialog = (state = initialState, action) => {
	switch (action.type) {
		case ShowMediaModal.OPEN_MEDIA_DIALOG: {
			return {
				...state,
				state: true,
				options: {
					...state.options,
					...action.options
				}
			};
		}
		case ShowMediaModal.CLOSE_MEDIA_DIALOG: {
			return {
				...state,
				state: false
			};
		}
		default: {
			return state;
		}
	}
};

export default mediaDialog;
