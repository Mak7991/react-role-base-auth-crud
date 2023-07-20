import axios from 'axios';

const getEventType = () => {
	return axios.get('/api/v1/school/event/types');
};

// rooms already in listing api
const getEventRooms = page => {
	return axios.get(`/api/v1/school/event/rooms?page=${page}`);
};

const getEventStudent = (page, room) => {
	return axios.get(`api/v1/admin/students?page=${page}&filters[room]=${room}`);
};

const createEvent = data => {
	return axios.post('api/v1/school/event', data);
};

// listing api
const getEventsByDate = (date, page) => {
	return axios.get(`/api/v1/school/event/show?date=${date}&page=${page}`);
};

const getEventsById = id => {
	return axios.get(`/api/v1/admin/event/${id}`);
};

const deleteEvent = id => {
	return axios.delete(`/api/v1/school/event/${id}`);
};

const updateEvent = (data, id) => {
	return axios.patch(`/api/v1/school/event/${id}`, data);
};

const getStudents = name => {
	return axios.get(`/api/v1/school/event/students?filters[name]=${name}`);
};

const getUpcomingEvents = (month, year) => {
	return axios.get(`/api/v1/school/event/show-date?month=${month}&year=${year}`);
};
const getEvents = (from, to, roomId = '') => {
	return axios.get(`/api/v1/school/event/show?date_from=${from}&date_to=${to}${roomId ? `&room_id=${roomId}` : ''}`);
};

export {
	getEvents,
	getEventRooms,
	getEventStudent,
	getEventType,
	createEvent,
	getEventsByDate,
	getEventsById,
	deleteEvent,
	updateEvent,
	getStudents,
	getUpcomingEvents
};
