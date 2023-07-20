import axios from 'axios';

const getAnnouncementList = (page, room_id = '', start_date = '', end_date = '') => {
	return axios.get(
		`/api/v1/school/teacher/announcement/list?page=${page}&room_id=${room_id}&start_date=${start_date}&end_date=${end_date}`
	);
};

const getAnnouncementTypes = () => {
	return axios.get('/api/v1/school/teacher/announcement/type/list');
};

const postTeacherAnnouncement = data => {
	return axios.post(`/api/v1/school/teacher/announcement/create`, data);
};

export { postTeacherAnnouncement, getAnnouncementTypes, getAnnouncementList };
