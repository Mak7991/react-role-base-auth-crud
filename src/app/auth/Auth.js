import FuseSplashScreen from '@fuse/core/FuseSplashScreen';
import * as userActions from 'app/auth/store/actions';
import auth0Service from 'app/services/auth0Service';
import firebaseService from 'app/services/firebaseService';
import jwtService from 'app/services/jwtService';
import { sendFCMTokenToBackend } from 'app/services/notifications/fcmServices';
import { app } from 'utils/utils';
import { getMessaging, getToken } from 'firebase/messaging';
import * as Actions from 'app/store/actions';
import axios from 'axios';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import secureLocalStorage from 'react-secure-storage';

const messaging = getMessaging(app);

class Auth extends Component {
	state = {
		waitAuthCheck: true
	};

	componentDidMount() {
		if (!JSON.parse(secureLocalStorage.getItem('user'))) {
			return Promise.all([
				// Comment the lines which you do not use
				// this.firebaseCheck(),
				// this.auth0Check(),
				this.jwtCheck()
			])
				.then(() => {
					this.setState({ waitAuthCheck: false });
					getToken(messaging, {
						vapidKey: process.env.REACT_APP_FIREBASE_VAPID_KEY
					})
						.then(deviceToken => {
							if (deviceToken) {
								sendFCMTokenToBackend(deviceToken);
							} else {
								// Show permission request UI
								console.log('No registration token available. Request permission to generate one.');
								// ...
							}
						})
						.catch(err => {
							console.log('An error occurred while retrieving token. ', err);
							// ...
						});
				})
				.catch(() => {
					this.setState({ waitAuthCheck: false });
				});
		}
		const token = secureLocalStorage.getItem('jwt_access_token');
		if (token.length === 5) {
			axios.defaults.headers.common.Authorization = token;
		} else {
			axios.defaults.headers.common.Authorization = `Bearer ${token}`;
		}
		const currentUser = JSON.parse(secureLocalStorage.getItem('user'));
		if (currentUser.role[0] !== 'super_admin') {
			getToken(messaging, {
				vapidKey: process.env.REACT_APP_FIREBASE_VAPID_KEY
			})
				.then(deviceToken => {
					if (deviceToken) {
						sendFCMTokenToBackend(deviceToken);
						console.log(deviceToken);
					} else {
						// Show permission request UI
						console.log('No registration token available. Request permission to generate one.');
						// ...
					}
				})
				.catch(err => {
					console.log('An error occurred while retrieving token. ', err);
					// ...
				});
		}
		if (currentUser.role[0] === 'super_school_admin') {
			axios
				.get('/api/v1/profile')
				.then(res => {
					const user = {
						...currentUser,
						school: res.data.school,
						doNotRedirect: 1
					};
					this.props.setUserData(user);
					this.setState({ waitAuthCheck: false });
				})
				.catch(() => {
					this.props.logout();
					const user = {
						role: [],
						data: {
							displayName: 'John Doe',
							photoURL: '',
							email: 'johndoe@withinpixels.com',
							shortcuts: ['calendar', 'mail', 'contacts', 'todo']
						}
					};
					this.props.setUserData(user);
					this.setState({ waitAuthCheck: false });
				});
		} else {
			this.props.setUserData({ ...currentUser, doNotRedirect: 1 });
			this.setState({ waitAuthCheck: false });
		}
		return 1;
	}

	jwtCheck = () =>
		new Promise((resolve, reject) => {
			jwtService.on('onAutoLogin', () => {
				// this.props.showMessage({ message: 'Logging in with JWT', autoHideDuration: 1000, variant: 'info' });

				/**
				 * Sign in and retrieve user data from Api
				 */
				jwtService
					.signInWithToken()
					.then(user => {
						this.props.setUserData(user);

						resolve();

						// this.props.showMessage({ message: 'Logged In', autoHideDuration: 1000, variant: 'success' });
					})
					.catch(error => {
						this.props.showMessage({ message: error });

						reject();
					});
			});

			jwtService.on('onAutoLogout', message => {
				if (message) {
					this.props.showMessage({ message });
				}

				this.props.logout();

				reject();
			});

			jwtService.on('onNoAccessToken', () => {
				reject();
			});

			jwtService.init();

			return Promise.resolve();
		});

	auth0Check = () =>
		new Promise(resolve => {
			auth0Service.init(success => {
				if (!success) {
					resolve();
				}
			});

			if (auth0Service.isAuthenticated()) {
				this.props.showMessage({ message: 'Logging in with Auth0' });

				/**
				 * Retrieve user data from Auth0
				 */
				auth0Service.getUserData().then(tokenData => {
					this.props.setUserDataAuth0(tokenData);

					resolve();

					this.props.showMessage({ message: 'Logged in with Auth0' });
				});
			} else {
				resolve();
			}

			return Promise.resolve();
		});

	firebaseCheck = () =>
		new Promise(resolve => {
			firebaseService.init(success => {
				if (!success) {
					resolve();
				}
			});

			firebaseService.onAuthStateChanged(authUser => {
				if (authUser) {
					this.props.showMessage({ message: 'Logging in with Firebase' });

					/**
					 * Retrieve user data from Firebase
					 */
					firebaseService.getUserData(authUser.uid).then(
						user => {
							this.props.setUserDataFirebase(user, authUser);

							resolve();

							this.props.showMessage({ message: 'Logged in with Firebase' });
						},
						error => {
							resolve();
						}
					);
				} else {
					resolve();
				}
			});

			return Promise.resolve();
		});

	render() {
		return this.state.waitAuthCheck ? <FuseSplashScreen /> : <>{this.props.children}</>;
	}
}

function mapDispatchToProps(dispatch) {
	return bindActionCreators(
		{
			logout: userActions.logoutUser,
			setUserData: userActions.setUserData,
			setUserDataAuth0: userActions.setUserDataAuth0,
			setUserDataFirebase: userActions.setUserDataFirebase,
			showMessage: Actions.showMessage,
			hideMessage: Actions.hideMessage
		},
		dispatch
	);
}

export default connect(null, mapDispatchToProps)(Auth);
