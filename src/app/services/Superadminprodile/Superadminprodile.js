import axios from 'axios';
import secureLocalStorage from 'react-secure-storage';

const updateProfile = (data, isSuperSchoolAdmin) => {
	if (!isSuperSchoolAdmin) {
		return axios.put(`/api/v1/profile`, data);
	}
	return axios.put(`/api/v1/profile`, data, {
		headers: { Authorization: `Bearer ${secureLocalStorage.getItem('superadmin_token')}` }
	});
};
const resetPassword = (data, isSuperSchoolAdmin) => {
	if (!isSuperSchoolAdmin) {
		return axios.post(`/api/v1/admin/reset-password`, data);
	}
	return axios.post(`/api/v1/admin/reset-password`, data, {
		headers: { Authorization: `Bearer ${secureLocalStorage.getItem('superadmin_token')}` }
	});
};

export { updateProfile, resetPassword };
