import axios from 'axios';

const forgetPassword = data => {
	return axios.post('/api/v1/forgot/password', data);
};

const verifyOtp = data => {
	return axios.post('api/v1/verify/otp', data);
};

const resetPassword = data => {
	return axios.post('api/v1/reset/password', data);
};

export { forgetPassword, verifyOtp, resetPassword };
