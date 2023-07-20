import axios from 'axios';

const getAllPermission = id => {
	return axios.get(`/api/v1/school/permissions?for_dropdown=true`);
};
const addSubAdmin = data => {
	return axios.post(`/api/v1/school/sub_admins`, data);
};
const getAllSubAdmins = (search, page, permissions) => {
	return axios.get(`/api/v1/school/sub_admins?search=${search}&page=${page}&permissions=${permissions}`);
};
const getSubAdminById = id => {
	return axios.get(`/api/v1/school/sub_admins/${id}`);
};
const updateSubAdmin = (data, id) => {
	return axios.patch(`/api/v1/school/sub_admins/${id}`, data);
};
export { getAllPermission, addSubAdmin, getAllSubAdmins, getSubAdminById, updateSubAdmin };
