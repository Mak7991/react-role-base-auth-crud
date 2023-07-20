import axios from 'axios';

const getSchedule = (id, school_id, page) => {
	return axios.get(`api/v1/school/rooms/schedule/list?room_id=${id}&school_id=${school_id}&page=${page}`);
};

const addSchedule = (data) => {
	return axios.post(`api/v1/school/rooms/schedule/add`, data);
};
const deleteSchedule = (id) => {
	return axios.delete(`api/v1/school/rooms/schedule/delete/${id}`);
};
const updateschedule = (data, id) => {
	return axios.put(`/api/v1/school/rooms/schedule/update/${id}`, data);
};

export { getSchedule, addSchedule, deleteSchedule, updateschedule };
