import axios from 'axios';

const getUpcomingBirthday = page => {
	return axios.get(`/api/v1/admin/birthdays?page=${page}`);
};

const getLoggedActivities = (page = 1) => {
	return axios.get(`/api/v1/dashboard/room-activities?page=${page}`);
};

const remindStaff = roomId => {
	return axios.get(`api/v1/dashboard/teacher-reminder?room_id=${roomId}`);
};

export { getUpcomingBirthday, getLoggedActivities, remindStaff };
