import axios from 'axios';
import { setselectedContactId } from './contacts.actions';
import { closeMobileChatsSidebar } from './sidebars.actions';

export const GET_CHAT = '[CHAT APP] GET CHAT';
export const REMOVE_CHAT = '[CHAT APP] REMOVE CHAT';
export const SEND_MESSAGE = '[CHAT APP] SEND MESSAGE';
export const ADD_CHAT = '[CHAT APP] ADD CHAT';
export const RECEIVE_MESSAGE = '[CHAT APP] RECEIVE MESSAGE';

export function getChat(contactId, setIsChatLoading, studentId) {
	setIsChatLoading(true);
	return dispatch => {
		const request = axios.get(`/api/v1/conversations/${contactId}/messages`);
		const read = axios.get(`api/v1/conversations/read?student_id=${studentId}`);
		return request.then(response => {
			dispatch(closeMobileChatsSidebar());
			setIsChatLoading(false);
			return dispatch({
				type: GET_CHAT,
				data: response.data
			});
		});
	};
}

export function getChatPage(currentChatState) {
	const url = currentChatState.next_page_url;
	const nextPage = url.split(':').join('s:');
	return dispatch => {
		const request = axios.get(nextPage);
		return request.then(response => {
			dispatch(closeMobileChatsSidebar());
			return dispatch({
				type: ADD_CHAT,
				data: response.data
			});
		});
	};
}

export function removeChat() {
	return {
		type: REMOVE_CHAT
	};
}

export function sendMessage(message, studentId) {
	const data = {
		type: 'text',
		message,
		student_id: [studentId]
	};

	const request = axios.post('/api/v1/conversations', data);

	return dispatch =>
		request.then(res => {
			return dispatch({
				type: SEND_MESSAGE,
				data: res.data.data[0]
			});
		});
}

export function sendFile(res) {
	return {
		type: SEND_MESSAGE,
		data: res.data.data[0]
	};
}

export function receiveMessage(message, studentId) {
	return {
		type: RECEIVE_MESSAGE,
		payload: { message, studentId }
	};
}
