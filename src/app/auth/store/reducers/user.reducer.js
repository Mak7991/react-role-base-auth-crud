import * as Actions from '../actions';
import secureLocalStorage from 'react-secure-storage';

let localUser = secureLocalStorage.getItem('user');
localUser = JSON.parse(localUser);
const initialState = {
	role: localUser?.role || [], // guest
	data: {
		displayName: localUser?.data?.displayName || '',
		photoURL: localUser?.data?.photoURL || '',
		email: localUser?.data?.email || '',
		...localUser?.data
	}
};

const user = (state = initialState, action) => {
	switch (action.type) {
		case Actions.SET_USER_DATA: {
			return {
				...initialState,
				...action.payload
			};
		}
		case Actions.REMOVE_USER_DATA: {
			return {
				...initialState
			};
		}
		case Actions.USER_LOGGED_OUT: {
			return initialState;
		}
		default: {
			return state;
		}
	}
};

export default user;
