import axios from 'axios';

const getList = (roomId = '', fromDate = '', toDate = '', page) => {
	return axios.get(
		`/api/v1/school/parent/announcement?
    ${roomId ? `room_id=${roomId}` : ''}
    ${fromDate ? `&from_date=${fromDate}` : ''}
    ${toDate ? `&to_date=${toDate}` : ''}
    ${page ? `&page=${page}` : ''}`
	);
};
const postParentAnnouncements = data => {
	return axios.post('/api/v1/school/parent/announcement', data);
};

const getParentAnnouncements = () => {
	return axios.get('/api/v1/school/parent/announcement/types');
};

export { postParentAnnouncements, getParentAnnouncements, getList };
