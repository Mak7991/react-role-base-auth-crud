import axios from 'axios';

const getConversations = (student_name, student_status, room_id, page) => {
	return axios.get(
		`/api/v1/conversations?student_name=${student_name}&student_status=${student_status}&room=${room_id}&page=${page}`
	);
};

const getConversationsDashboard = (isDashboard = false, page = 1) => {
	return isDashboard
		? axios.get(`/api/v1/conversations?list_type=dashboard&page=${page}`)
		: axios.get(`/api/v1/conversations?&page=${page}`);
};

const delConversation = (id) => {
	return axios.delete(`/api/v1/conversations/${id}`);
};

export { getConversations, getConversationsDashboard, delConversation };
