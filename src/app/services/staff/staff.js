import axios from 'axios';

const getStaff = (search, page) => {
	return axios.get(`/api/v1/school/staff?q=${search}&page=${page}`);
};

const getStaffById = id => {
	return axios.get(`/api/v1/school/staff/${id}`);
};

const addStaff = data => {
	return axios.post('/api/v1/school/staff', data);
};

const updateStaff = (data, id) => {
	return axios.put(`/api/v1/school/staff/${id}`, data);
};

export { getStaff, getStaffById, addStaff, updateStaff };
