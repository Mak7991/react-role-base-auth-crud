import axios from 'axios';

const getImmunizations = () => {
	return axios.get('/api/v1/immunizations?code=263');
};

const updateImmunizationList = (id, data) => {
	return axios.post(`/api/v1/admin/students/immunization/edit/${id}`, data);
};

const enableImmunizations = data => {
	return axios.post('/api/v1/admin/students/immunization', data);
};

export { getImmunizations, updateImmunizationList, enableImmunizations };
