import FuseUtils from '@fuse/utils/FuseUtils';
import * as PusherPushNotifications from '@pusher/push-notifications-web';
import axios from 'axios';
import { stripConnect } from 'app/services/settings/settings';
import history from '@history';
import secureLocalStorage from 'react-secure-storage';

class JwtService extends FuseUtils.EventEmitter {
	init() {
		this.setInterceptors();
		this.handleAuthentication();
	}

	setInterceptors = () => {
		axios.interceptors.response.use(
			(response) => {
				return response;
			},
			(err) => {
				return new Promise((resolve, reject) => {
					if (err.response.status === 401 && err.config && !err.config.__isRetryRequest) {
						// if you ever get an unauthorized response, logout the user
						this.emit('onAutoLogout', err?.response?.data?.message);
						this.setSession(null);
					}
					throw err;
				});
			}
		);
	};

	handleAuthentication = () => {
		const accessToken = this.getAccessToken();

		if (!accessToken) {
			this.emit('onNoAccessToken');

			return;
		}

		if (this.isAuthTokenValid(accessToken)) {
			this.setSession(accessToken);
			this.emit('onAutoLogin', true);
		} else {
			this.setSession(null);
			this.emit('onAutoLogout', 'Session expired. Please Login');
		}
	};

	createUser = (data) => {
		return new Promise((resolve, reject) => {
			axios.post('/api/auth/register', data).then((response) => {
				if (response.data.user) {
					this.setSession(response.data.access_token);
					resolve(response.data.user);
				} else {
					reject(response.data.error);
				}
			});
		});
	};

	signInWithEmailAndPassword = (username, password) => {
		return new Promise((resolve, reject) => {
			axios
				.post('/api/v1/login', {
					username,
					password,
					user_role: 'admin',
					device_name: 'web',
				})
				.then((response) => {
					this.setSession(response.data.access_token);
					if (response.data.access_token) {
						this.getProfile()
							.then((res) => {
								if (
									(res.data.role === 'school_admin' ||
										res.data.role === 'sub_admin' ||
										res.data.role === 'super_admin') &&
									!res.data.verified_at
								) {
									history.push({
										pathname: '/reset-password',
										state: {
											username: res.data.email,
										},
									});
									this.emit('onAutoLogout', 'Please Update your password');
								} else if (
									!res.data.school.account_connected_status &&
									res.data.role === 'school_admin'
								) {
									stripConnect(res.data.school.connect_account_id).then((resp) => {
										this.setSession(null);
										window.open(resp?.data?.url, '_self');
									});
								} else {
									const user = {
										data: {
											email: res.data.email,
											displayName: `${res.data.first_name} ${res.data.last_name}`,
											photoURL: res.data.photo,
											...res.data,
										},
										permissions: response?.data?.user_permission,
										role: response?.data?.user_roles,
									};
									this.setSession(response.data.access_token, user);
									resolve(user);
								}
							})
							.catch((err) => {
								this.emit('onAutoLogout');
								this.setSession(null);
								reject(err);
							});
					}
				})
				.catch((err) => {
					reject(err);
				});
		});
	};

	signInWithToken = () => {
		return new Promise((resolve, reject) => {
			if (this.getAccessToken()) {
				this.setSession(this.getAccessToken());
				this.getProfile()
					.then((res) => {
						if (res.data.role === 'super_admin' || res.data.role === 'school_admin') {
							if (
								(res.data.role === 'school_admin' ||
									res.data.role === 'sub_admin' ||
									res.data.role === 'super_admin') &&
								!res.data.verified_at
							) {
								history.push({
									pathname: '/reset-password',
									state: {
										username: res.data.email,
									},
								});
								this.emit('onAutoLogout', 'Please Update your password');
							} else if (!res.data.school.account_connected_status && res.data.role === 'school_admin') {
								stripConnect(res.data.school.connect_account_id).then((resp) => {
									this.setSession(null);
									window.open(resp?.data?.url, '_self');
								});
							} else {
								const user = {
									data: {
										email: res.data.email,
										displayName: `${res.data.first_name} ${res.data.last_name}`,
										photoURL: res.data.photo,
										...res.data,
									},
									role: [res.data.role],
								};
								this.setSession(this.getAccessToken(), user);
								resolve(user);
							}
						} else {
							this.emit('onAutoLogout');
							this.setSession(null);
						}
					})
					.catch((err) => {
						this.emit('onAutoLogout');
						this.setSession(null);
					});
			} else {
				this.logout();
				Promise.reject(new Error('Failed to login with token.'));
			}
		});
	};

	updateUserData = (user) => {
		return axios.post('/api/auth/user/update', {
			user,
		});
	};

	setSession = (accessToken, user) => {
		if (accessToken) {
			secureLocalStorage.setItem('jwt_access_token', accessToken);
			if (user) {
				secureLocalStorage.setItem('user', JSON.stringify(user));
			}
			axios.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
		} else {
			secureLocalStorage.removeItem('jwt_access_token');
			secureLocalStorage.removeItem('superadmin_token');
			secureLocalStorage.removeItem('user');
			delete axios.defaults.headers.common.Authorization;
		}
	};

	logout = () => {
		if (this.getAccessToken()) {
			axios.post('api/v1/logout');
		}
		this.setSession(null);
		window.navigator.serviceWorker.ready.then((serviceWorkerRegistration) => {
			const beamsClient = new PusherPushNotifications.Client({
				instanceId: process.env.REACT_APP_BEAMS_INSTANCE_ID,
				serviceWorkerRegistration,
			});
			beamsClient.clearAllState().then(() => console.log('Cleared all beams state'));
		});
	};

	isAuthTokenValid = (accessToken) => {
		if (!accessToken) {
			return false;
		}
		// const decoded = jwtDecode(access_token);
		// const currentTime = Date.now() / 1000;
		// if (decoded.exp < currentTime) {
		// 	console.warn('access token expired');
		// 	return false;
		// }

		return true;
	};

	getAccessToken = () => {
		return secureLocalStorage.getItem('jwt_access_token');
	};

	getProfile = (isSuperSchoolAdmin = false) => {
		console.log('isSuperSchoolAdmin', isSuperSchoolAdmin);
		if (isSuperSchoolAdmin) {
			return axios.get('/api/v1/profile', {
				headers: { Authorization: `Bearer ${secureLocalStorage.getItem('superadmin_token')}` },
			});
		}
		return axios.get('api/v1/profile');
	};

	setViewAs = (otp) => {
		if (otp) {
			const tempUser = JSON.parse(secureLocalStorage.getItem('user'));
			tempUser.role[0] = 'super_school_admin';
			secureLocalStorage.setItem('user', JSON.stringify(tempUser));
		} else {
			delete axios.defaults.headers.common.Authorization;
		}
	};
}

const instance = new JwtService();

export default instance;
