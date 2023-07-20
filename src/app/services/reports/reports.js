import axios from 'axios';
import dayjs from 'dayjs';

const getReports = (export_id, timezone_offset, student_status, student_id, fromDate, toDate, roomId, page) => {
	return axios.get(
		`/api/v1/reports/check-in-out?export=${export_id}&timezone_offset=${timezone_offset}&status=${student_status}&student_id=${student_id}&start_date=${fromDate}&end_date=${toDate}&room_id=${roomId}&page=${page}`
	);
};

const getAttendanceReport = (
	export_id,
	default_user,
	room_id,
	student_id,
	student_status,
	start_date,
	end_date,
	page
) => {
	return axios.get(
		`/api/v1/reports/attendance/summary?export=${export_id}&default=${default_user}&room_id=${room_id}&student_id=${student_id}&student_status=${student_status}&start_date=${start_date}&end_date=${end_date}&page=${page}`
	);
};

const getStudents = (searchQuery = '', page) => {
	return axios.get(`/api/v1/admin/students?filters[name]=${searchQuery}&page=${page}`);
};

const getActivities = (filters, page) => {
	return axios.get(
		`/api/v1/reports/activity?status=${filters.student_status}&room_id=${
			filters.room === 'All' ? '' : filters.room
		}&date=${filters.date}&timezone_offset=${filters.timezone_offset}&page=${page}`
	);
};

const getSchools = () => {
	return axios.get(`/api/v1/company/school`);
};

const getStaffs = (filters, page, searchQuery = '', isExport = 0, isEmail, email) => {
	return axios.get(
		`${process.env.REACT_APP_API_REPORTS_ENDPOINT}api/v1/staff?name=${searchQuery}&school_id=${
			filters?.school_id == 'All' ? '' : filters?.school_id
		}&position_type=${filters?.role}&date_from=${filters?.fromDate}&date_to=${
			filters?.toDate
		}&page=${page}&export=${isExport}&is_email=${isEmail}&email=${email}`
	);
};

const getAllergies = (filters, page, searchQuery = '', export_id = 0, isEmail, email) => {
	return axios.get(
		`${process.env.REACT_APP_API_REPORTS_ENDPOINT}api/v1/allergy?name=${searchQuery}&school_id=${
			filters?.school_id == 'All' ? '' : filters?.school_id
		}&room_id=${filters?.room_id == 'All' ? '' : filters?.room_id}&status=${
			filters?.status
		}&page=${page}&export=${export_id}&for_school_admin=1&is_email=${isEmail}&email=${email}`
	);
};

const getEmergencyContacts = (filters, page, searchQuery = '', export_id = 0) => {
	return axios.get(
		`${process.env.REACT_APP_API_REPORTS_ENDPOINT}api/v1/emergency-contact?name=${searchQuery}&school_id=${
			filters?.school_id == 'All' ? '' : filters?.school_id
		}&room_id=${filters?.room_id == 'All' ? '' : filters?.room_id}&status=${filters?.status}&contact_type=${
			filters?.contact_type
		}&page=${page}&export=${export_id}`
	);
};
const getMedications = (filters, page, searchQuery = '', export_id = 0, isEmail, email) => {
	return axios.get(
		`${process.env.REACT_APP_API_REPORTS_ENDPOINT}api/v1/medications?name=${searchQuery}&school_id=${
			filters?.school_id == 'All' ? '' : filters?.school_id
		}&room_id=${filters?.room_id == 'All' ? '' : filters?.room_id}&status=${filters?.status}&date_from=${
			filters?.fromDate
		}&date_to=${filters?.toDate}&page=${page}&export=${export_id}&is_email=${isEmail}&email=${email}`
	);
};
const getContacts = (filters, page, searchQuery = '', export_id = 0, isEmail, email) => {
	return axios.get(
		`${process.env.REACT_APP_API_REPORTS_ENDPOINT}api/v1/contacts?name=${searchQuery}
		&school_id=${filters?.school_id == 'All' ? '' : filters?.school_id}&room_id=${
			filters?.room_id == 'All' ? '' : filters?.room_id
		}&status=${filters?.status}&contact_type=${filters?.contact_type ||
			''}&page=${page}&export=${export_id}&is_email=${isEmail}&email=${email}`
	);
};
const getRooms = (search, page) => {
	return axios.get(`/api/v1/school/rooms?search=${search}&page=${page}&for=web&isLocation=0`);
};

const getEnrolledStudents = (export_id, name, school_id, room_id, status, date_from, date_to, page, isEmail, email) => {
	return axios.get(
		`${process.env.REACT_APP_API_REPORTS_ENDPOINT}api/v1/enrolled-students?export=${export_id}&name=${name}&school_id=${school_id}&room_id=${room_id}&status=${status}&date_from=${date_from}&date_to=${date_to}&page=${page}&is_email=${isEmail}&email=${email}`
	);
};

const getStudentsAge = (export_id, name, school_id, room_id, status, date_from, date_to, page, is_email, email) => {
	return axios.get(
		`${process.env.REACT_APP_API_REPORTS_ENDPOINT}api/v1/student-age?export=${export_id}&name=${name}&school_id=${school_id}&room_id=${room_id}&status=${status}&date_from=${date_from}&date_to=${date_to}&page=${page}&is_email=${is_email}&email=${email}`
	);
};

const getImmunizationsReport = (
	export_id = 0,
	name = '',
	school_id = '',
	room_id = '',
	status = '',
	date_from = '',
	date_to = '',
	page = '',
	dueOverDueFormat = '',
	isEmail = '',
	email = ''
) => {
	return axios.get(
		`${process.env.REACT_APP_API_REPORTS_ENDPOINT}api/v1/immunizations?export=${export_id}&name=${name}&school_id=${school_id}&room_id=${room_id}&status=${status}&date_from=${date_from}&date_to=${date_to}&page=${page}&due_overdue_format=${dueOverDueFormat}&is_email=${isEmail}&email=${email}`
	);
};

const getRoomRatios = (export_id, room_id, date, interval, room_name, isEmail, email) => {
	return axios.get(
		`${process.env.REACT_APP_API_REPORTS_ENDPOINT}api/v1/room-ratios?export=${export_id}&room_id=${room_id}&date=${date}&interval=${interval}&room_name=${room_name}&is_email=${isEmail}&email=${email}`
	);
};

const getSchoolRoyalties = (
	filters,
	school_id,
	searchQuery = '',
	page,
	export_id = 0,
	for_school_admin = 0,
	isEmail,
	email
) => {
	return axios.get(
		`${process.env.REACT_APP_API_REPORTS_ENDPOINT}api/v1/school-royalties?name=${searchQuery}&room_id=${
			filters?.room_id == 'All' ? '' : filters?.room_id
		}&school_id=${school_id}&date_from=${filters?.fromDate}&date_to=${filters?.toDate}&package_type=${
			filters?.package_type
		}&page=${page}&export=${export_id}&for_school_admin=${for_school_admin}&is_email=${isEmail}&email=${email}`
	);
};

const getParentsSubscription = (
	export_id,
	name,
	school_id,
	room_id,
	package_type,
	date_from,
	date_to,
	page,
	isEmail,
	email
) => {
	return axios.get(
		`${process.env.REACT_APP_API_REPORTS_ENDPOINT}api/v1/parent-subscription?export=${export_id}&name=${name}&school_id=${school_id}&room_id=${room_id}&package_type=${package_type}&date_from=${date_from}&date_to=${date_to}&page=${page}&is_email=${isEmail}&email=${email}`
	);
};

const getMealReport = (filters, export_id = 0, allFilters, isEmail, email) => {
	return axios.get(
		`${process.env.REACT_APP_API_REPORTS_ENDPOINT}api/v1/meals-report?room_id=[${
			filters?.room_id == 'All' || filters?.room_id == '' ? allFilters : filters?.room_id
		}]&date_from=${filters?.fromDate}&date_to=${filters?.toDate}&export=${export_id}&status=${
			filters?.status
		}&is_email=${isEmail}&email=${email}`
	);
};

const getParentsInformation = (name, room_id, school_id, package_type, date_from, date_to, page, export_id) => {
	return axios.get(
		`${process.env.REACT_APP_API_REPORTS_ENDPOINT}api/v1/parent-subscription?name=${name}&room_id=${room_id}&school_id=${school_id}&package_type=${package_type}&date_from=${date_from}&date_to=${date_to}&page=${page}&export=${export_id}`
	);
};

const getStudentActivityReport = (studentId, date) => {
	return axios.get(
		`api/v1/reports/student-activity?student_id=${studentId}&date=${dayjs(date || new Date()).format('YYYY-MM-DD')}`
	);
};

const getParents = studentId => {
	return axios.get(`api/v1/reports/get-parent/${studentId}`);
};

const sendEmail = (studentId, emails, url) => {
	return axios.post(`api/v1/reports/send-report`, { emails, student_id: studentId, attachement: url });
};

export {
	getReports,
	getAttendanceReport,
	getStudents,
	getActivities,
	getStaffs,
	getSchools,
	getAllergies,
	getEmergencyContacts,
	getRooms,
	getMedications,
	getEnrolledStudents,
	getStudentsAge,
	getRoomRatios,
	getContacts,
	getSchoolRoyalties,
	getParentsSubscription,
	getMealReport,
	getImmunizationsReport,
	getParentsInformation,
	getStudentActivityReport,
	getParents,
	sendEmail
};
