import axios from 'axios';

const getCompanySchools = (search, from, to, page, sort, isSchoolAdmin = false) => {
	return axios.get(
		`/api/v1/${
			isSchoolAdmin ? 'admin' : 'company'
		}/school?search=${search}&from=${from}&to=${to}&page=${page}&sort=${sort}`
	);
};

const getCompanySchool = (id) => {
	return axios.get(`/api/v1/company/school/${id}`);
};

const createSchool = (data) => {
	console.log(data, 'data');
	return axios.post(`/api/v1/company/school`, data);
};

const updateSchool = (data, id) => {
	return axios.put(`/api/v1/company/school/${id}`, data);
};

const updateSchoolStatus = (id, data) => {
	return axios.post(`/api/v1/company/school/status/${id}`, data);
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

const getSearchableStateList = (search, page) => {
	return axios.get(`api/v1/countries/USA/states?search=${search}&page=${page}`);
};

const getSearchableCityList = (state_id, search, page) => {
	return axios.get(`api/v1/states/${state_id}/cities?search=${search}&page=${page}`);
};

export {
	getCompanySchool,
	getCompanySchools,
	createSchool,
	updateSchool,
	updateSchoolStatus,
	getCountryList,
	getStateListByCountry,
	getCityList,
	getSearchableStateList,
	getSearchableCityList,
};
