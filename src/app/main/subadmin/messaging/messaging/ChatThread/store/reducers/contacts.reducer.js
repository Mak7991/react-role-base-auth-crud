import * as Actions from '../actions';

const initialState = {
	selectedContactId: '',
	entities: [],
	user: [
		{
			id: '5725a6802d10e277a0f35724',
			name: 'John Doe',
			avatar: 'assets/images/avatars/profile.jpg'
		}
	]
};

const contactsReducer = (state = initialState, action) => {
	switch (action.type) {
		case Actions.GET_CONTACTS: {
			return {
				...state,
				...action.payload,
				entities: action.payload.data
			};
		}
		case Actions.ADD_CONTACTS: {
			return {
				...state,
				...action.payload,
				entities: [...state.entities, ...action.payload.data]
			};
		}
		case Actions.UPDATE_CONTACTS: {
			return {
				...state,
				entities: action.payload
			};
		}
		case Actions.INSERT_CONTACT: {
			const temp = [action.payload];
			temp.push(...state.entities.filter(contact => contact.id != action.payload.id));
			return {
				...state,
				entities: temp
			};
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
		case Actions.SEND_MESSAGE: {
			const temp = state.entities.filter(conversation => conversation.id === state.selectedContactId);
			temp.push(...state.entities.filter(conversation => conversation.id !== state.selectedContactId));
			temp[0].last_message = action.data;
			return {
				...state,
				entities: temp
			};
		}
		case Actions.RECEIVE_MESSAGE: {
			if (action.payload.message.conversation_id == state.selectedContactId) {
				const temp = state.entities.filter(conversation => conversation.id === state.selectedContactId);
				temp[0].messages_unread_count = 0;
				temp.push(...state.entities.filter(conversation => conversation.id !== state.selectedContactId));
				return {
					...state,
					entities: temp
				};
			}
			return state;
		}
		default: {
			return state;
		}
	}
};

export default contactsReducer;
