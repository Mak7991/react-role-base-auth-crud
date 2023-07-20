import axios from 'axios';

const addSchedule = (schedule) => {
	return axios.post('api/v1/school/teacher/schedule/add', schedule);
};

const updateSchedule = (id, updatedSchedule) => {
	return axios.put(`api/v1/school/teacher/schedule/update/${id}`, updatedSchedule);
};

const schedulesList = (startDate, endDate, page, room) => {
	return axios.get(
		`api/v1/school/teacher/schedule/calendar?start_date=${startDate}&end_date=${endDate}&page=${page}${
			room ? `&room=${room}` : ''
		}`
	);
};
const deleteEvent = (id) => {
	return axios.delete(`api/v1/school/teacher/schedule/delete/${id}`);
};

const addWorkshift = (payload) => {
	return axios.post('api/v1/school/teacher/schedule/add-workshift', payload);
};
const updateWorkshift = (id, payload) => {
	return axios.put(`api/v1/school/teacher/schedule/update-workshift/${id}`, payload);
};
export { addSchedule, schedulesList, updateSchedule, deleteEvent, addWorkshift, updateWorkshift };
