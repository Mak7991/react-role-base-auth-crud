import axios from 'axios';

const getTotalStaffs = page => {
	return axios.get(`/api/v1/company/staff?page=${page}`);
};

const getTotalRooms = page => {
	return axios.get(`/api/v1/company/rooms?page=${page}`);
};

const allStudents = page => {
	return axios.get(`/api/v1/company/all-students?page=${page}`);
};

const getTotalSubAdmin = page => {
	return axios.get(`/api/v1/company/subadmins?page=${page}`);
};

export { getTotalStaffs, getTotalRooms, allStudents, getTotalSubAdmin };
