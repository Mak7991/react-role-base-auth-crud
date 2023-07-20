import _ from 'lodash';
import * as Actions from '../actions';

const userReducer = (state = null, action) => {
	switch (action.type) {
		case Actions.GET_USER_DATA: {
			return { ...action.payload };
		}
		case Actions.UPDATE_USER_DATA: {
			return { ...action.payload };
		}
		default:
			return state;
	}
};

export default userReducer;
