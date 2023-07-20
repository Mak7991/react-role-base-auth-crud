import axios from 'axios';

const sendFCMTokenToBackend = token => {
	return axios.post('api/v1/account/topic/subscribe', { device_token: token });
};

export { sendFCMTokenToBackend };
