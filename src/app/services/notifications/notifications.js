import axios from 'axios';

const getNotifications = (page) => {
	return axios.get(`/api/v1/school/notifications?page=${page}`);
};

const readNotification = (id) => {
	return axios.put(`/api/v1/school/notifications/${id}`);
};

const getUnreadNotifications = () => {
	return axios.get('/api/v1/notifications/unread?role=subadmin');
};

const deleteAllNotification = () => {
	return axios.delete(`/api/v1/school/notifications`);
};

// super_admin

const getCompanyAdminNotifications = (page) => {
	return axios.get(`/api/v1/company/notifications?page=${page}`);
};

const getCompanyAdminReadNotifications = () => {
	return axios.patch(`/api/v1/company/notifications/read-all`);
};

const getCompanyAdminUnreadNotifications = () => {
	return axios.get(`/api/v1/company/notifications/unread`);
};

const deleteAllCompanyAdminNotifications = () => {
	return axios.delete(`/api/v1/company/notifications`);
};

export {
	getNotifications,
	readNotification,
	deleteAllNotification,
	getUnreadNotifications,
	getCompanyAdminNotifications,
	getCompanyAdminReadNotifications,
	getCompanyAdminUnreadNotifications,
	deleteAllCompanyAdminNotifications,
};
