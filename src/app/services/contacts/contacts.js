import axios from 'axios';

const createContact = data => {
	return axios.post('api/v1/admin/students/contact', data);
};

const updateContact = (id, data) => {
	return axios.put(`api/v1/admin/students/contact/${id}`, data);
};

export { createContact, updateContact };
