import axios from 'axios';

const getPickups = (id) => {
	return axios.get(`/api/v1/school/approved/pickups/${id}`);
};

const getStudents = (searchQuery = '', status = '', roomId = '', checkIn = '', page, absent = '') => {
	return axios.get(
		`/api/v1/admin/students?filters[name]=${searchQuery}&filters[status]=${status}&filters[room]=${roomId}&filters[check_in]=${checkIn}&page=${page}&filters[absent]=${absent}`
	);
};

const checkIn = (data) => {
	return axios.post('/api/v1/school/checkin', data);
};

const checkOut = (data) => {
	return axios.post('/api/v1/school/checkout', data);
};

const enrollStudent = (data) => {
	return axios.post('/api/v1/admin/students/create', data);
};

const updateStudentStatus = (data) => {
	return axios.post('/api/v1/admin/students/status/change', data);
};
const getStudent = (id) => {
	return axios.get(`/api/v1/admin/students/${id}`);
};

const getRelations = () => {
	return axios.get('/api/v1/school/family/relations');
};

const updateStudent = (id, data) => {
	return axios.put(`/api/v1/admin/students/${id}`, data);
};

const UploadRoster = (data) => {
	return axios.post('/api/v1/school/roster/upload', data);
};

const getExistingParents = (name) => {
	return axios.get(`/api/v1/admin/parents?filters[name]=${name}`);
};

const addMultipleParents = (data) => {
	return axios.post('/api/v1/admin/parents', data);
};

const uploadRosterJSON = (data) => {
	return axios.post('/api/v1/school/roster/upload-data', data);
};

const addAttachments = (data) => {
	return axios.post('/api/v1/school/student/attachment', data);
};

const deleteAttachment = (id) => {
	return axios.delete(`/api/v1/school/student/attachment/${id}`);
};

const addMedications = (data) => {
	return axios.put('/api/v1/school/student/medication/edit', data);
};

const changeCheckInCode = (parentId) => {
	return axios.patch(`/api/v1/admin/parents/${parentId}/checkin-codes/change`);
};

const deleteContacts = (student_id, contact_id) => {
	return axios.delete(`/api/v1/admin/students/${student_id}/contacts/${contact_id}`);
};

export {
	getPickups,
	checkIn,
	checkOut,
	getStudents,
	enrollStudent,
	updateStudentStatus,
	getStudent,
	getRelations,
	updateStudent,
	UploadRoster,
	getExistingParents,
	addMultipleParents,
	uploadRosterJSON,
	addAttachments,
	addMedications,
	changeCheckInCode,
	deleteAttachment,
	deleteContacts,
};
