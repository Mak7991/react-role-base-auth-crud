import axios from 'axios';

export const GET_CONTACTS = '[CHAT APP] GET CONTACTS';
export const ADD_CONTACTS = '[CHAT APP] ADD CONTACTS';
export const SET_SELECTED_CONTACT_ID = '[CHAT APP] SET SELECTED CONTACT ID';
export const REMOVE_SELECTED_CONTACT_ID = '[CHAT APP] REMOVE SELECTED CONTACT ID';
export const UPDATE_CONTACTS = '[CHAT APP] UPDATE CONTACTS';
export const INSERT_CONTACT = '[CHAT APP] INSERT CONTACT';

export function getContacts(setIsLoading, searchText) {
	setIsLoading(true);
	const request = searchText
		? axios.get(`api/v1/conversations?student_name=${searchText}`)
		: axios.get('/api/v1/conversations');
	return dispatch =>
		request.then(response => {
			setIsLoading(false);
			return dispatch({
				type: GET_CONTACTS,
				payload: response.data
			});
		});
}

export function getContactsPage(url) {
	const nextPage = url.split(':').join('s:');
	const request = axios.get(nextPage);
	return dispatch =>
		request.then(response => {
			return dispatch({
				type: ADD_CONTACTS,
				payload: response.data
			});
		});
}

export function updateContacts(contacts) {
	return {
		type: UPDATE_CONTACTS,
		payload: contacts
	};
}

export function setContacts(payload) {
	return {
		type: GET_CONTACTS,
		payload
	};
}

export function insertContact(contact) {
	return {
		type: INSERT_CONTACT,
		payload: contact
	};
}

export function setselectedContactId(contactId) {
	return {
		type: SET_SELECTED_CONTACT_ID,
		payload: contactId
	};
}

export function removeSelectedContactId() {
	return {
		type: REMOVE_SELECTED_CONTACT_ID
	};
}
