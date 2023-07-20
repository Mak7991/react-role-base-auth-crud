import axios from 'axios';

const getEnrolledStudents = (export_id, name, school_id, room_id, status, date_from, date_to, page) => {
	return axios.get(
		`${process.env.REACT_APP_API_REPORTS_ENDPOINT}api/v1/enrolled-students?export=${export_id}&name=${name}&school_id=${school_id}&room_id=${room_id}&status=${status}&date_from=${date_from}&date_to=${date_to}&page=${page}`
	);
};

const getRoomsfilter = (page, school_id = '') => {
	return axios.get(`/api/v1/company/rooms?page=${page}&school_id=${school_id}`);
};
const getRooms = (search, page) => {
	return axios.get(`/api/v1/school/rooms?search=${search}&page=${page}&for=web`);
};

const getAllSchools = (search, from, to, page, sort) => {
	return axios.get(`/api/v1/company/school?search=${search}&from=${from}&to=${to}&page=${page}&sort=${sort}`);
};

const getAllergiesBySchool = (filters, page, searchQuery = '', export_id = 0) => {
	return axios.get(
		`${
			process.env.REACT_APP_API_REPORTS_ENDPOINT
		}api/v1/allergy?export=${export_id}&name=${searchQuery}&school_id=${
			filters?.school_id == 'All' ? '' : filters?.school_id
		}&room_id=${filters?.room_id == 'All' ? '' : filters?.room_id}&status=${filters?.status}&page=${page}`
	);
};

export { getEnrolledStudents, getRooms, getAllSchools, getRoomsfilter, getAllergiesBySchool };
