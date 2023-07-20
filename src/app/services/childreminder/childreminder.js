import axios from 'axios';


const getreminders = page => {
	return axios.get(`/api/v1/school/student/reminders?page=${page}`);
};

export { getreminders };
