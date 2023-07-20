import axios from 'axios';

const getRooms = (search, page) => {
	return axios.get(`/api/v1/school/rooms?search=${search}&page=${page}&for=web&isLocation=1`);
};

const getRoomsEnrollStd = (search, page) => {
	return axios.get(`/api/v1/school/rooms?search=${search}&page=${page}&for=web&isLocation=0`);
};

const getAllRooms = () => {
	return axios.get('/api/v1/school/rooms-all');
};

const getRoom = (search, page, id) => {
	return axios.get(`/api/v1/school/rooms/${id}?search=${search}&page=${page}`);
};
const deleteRoom = id => {
	return axios.delete(`/api/v1/school/rooms/${id}`);
};
const updateRoom = (id, data) => {
	return axios.put(`/api/v1/school/rooms/${id}`, data);
};

const changeHomeRoom = data => {
	return axios.post('/api/v1/admin/students/update/room', data);
};

const createRoom = data => {
	return axios.post('api/v1/school/rooms', data);
};

const getRoomFeeds = ({ id, start_date, end_date, activity_type }) => {
	return axios.get(
		`api/v1/school/rooms/activities/${id}?start_date=${start_date}&end_date=${end_date}&activity_type=${activity_type}`
	);
};

const getFeedsType = ({ id, page, room_id }) => {
	return axios.get(`api/v1/school/rooms/activities/feeds/${id}?page=${page}&room_id=${room_id}&for=web`);
};
const getRoomRatios = page => {
	return axios.get(`/api/v1/admin/rooms?page=${page}&app=1`);
};

const getRosterTypes = () => {
	return axios.get("/api/v1/school/roster-types");
}

export {
	getRooms,
	getRoom,
	createRoom,
	deleteRoom,
	changeHomeRoom,
	updateRoom,
	getRoomFeeds,
	getFeedsType,
	getAllRooms,
	getRoomRatios,
	getRoomsEnrollStd,
	getRosterTypes
};
