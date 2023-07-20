import axios from 'axios';

const updatesettings = (data) => {
	return axios.put(`/api/v1/school/update`, data);
};

const getSchoolProfile = () => {
	return axios.get('api/v1/school/profile');
};

const getStateListByCountry = (country_id) => {
	return axios.get(`api/v1/states/${country_id}`);
};

const getCountryList = () => {
	return axios.get(`api/v1/countries?code=USA`);
};

const getCityList = (state_id) => {
	return axios.get(`/api/v1/cities?state_id=${state_id}`);
};

const getSchoolDetailsByiD = (id) => {
	return axios.get(`/api/v1/admin/school/${id}`);
};

const stripConnect = (id) => {
	return axios.get(`api/v1/admin/stripe/connect/${id}/accounts`);
};

const changeSchoolCode = (data) => {
	return axios.patch('api/v1/admin/school/change-code', data);
};

export {
	updatesettings,
	getSchoolProfile,
	getStateListByCountry,
	getCountryList,
	getCityList,
	getSchoolDetailsByiD,
	stripConnect,
	changeSchoolCode,
};
