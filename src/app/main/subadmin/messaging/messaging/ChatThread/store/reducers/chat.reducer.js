import axios from 'axios';
import * as Actions from '../actions';

const initialState = {};

const chat = (state = initialState, action) => {
	switch (action.type) {
		case Actions.GET_CHAT: {
			// Get chats
			return {
				...state,
				...action.data
			};
		}
		case Actions.ADD_CHAT: {
			// Pagination
			return {
				...action.data,
				data: [...state.data, ...action.data.data]
			};
		}
		case Actions.REMOVE_CHAT: {
			return {};
		}
		case Actions.SEND_MESSAGE: {
			return {
				...state,
				data: [action.data, ...state.data]
			};
		}
		case Actions.RECEIVE_MESSAGE: {
			if (state.selectedContactId == action.payload.message.conversation_id) {
				const request = axios.get(`api/v1/conversations/read?student_id=${action.payload.studentId}`);
				return {
					...state,
					data: [action.payload.message, ...state.data]
				};
			}
			return state;
		}
		case Actions.SET_SELECTED_CONTACT_ID: {
			return {
				...state,
				selectedContactId: action.payload
			};
		}
		case Actions.REMOVE_SELECTED_CONTACT_ID: {
			return {
				...state,
				selectedContactId: null
			};
		}
		default: {
			return state;
		}
	}
};

export default chat;
