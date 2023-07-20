import firebaseService from 'app/services/firebaseService';
import jwtService from 'app/services/jwtService';
import * as Actions from 'app/store/actions';
import { sendFCMTokenToBackend } from 'app/services/notifications/fcmServices';
import { app } from 'utils/utils';
import { getMessaging, getToken } from 'firebase/messaging';
import * as UserActions from './user.actions';

const messaging = getMessaging(app);

export const LOGIN_ERROR = 'LOGIN_ERROR';
export const LOGIN_SUCCESS = 'LOGIN_SUCCESS';

export function submitLogin({ username, password }, setIsLoggingIn) {
	return dispatch =>
		jwtService
			.signInWithEmailAndPassword(username, password)
			.then(user => {
				setIsLoggingIn(false);
				if (user.role[0] !== 'super_admin') {
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
				dispatch(UserActions.setUserData(user));
				return dispatch({
					type: LOGIN_SUCCESS
				});
			})
			.catch(error => {
				setIsLoggingIn(false);
				dispatch(Actions.showMessage({ message: error.response.data.message, variant: 'error' }));
				return dispatch({
					type: LOGIN_ERROR,
					payload: error
				});
			});
}

export function submitLoginWithFireBase({ username, password }) {
	if (!firebaseService.auth) {
		console.warn("Firebase Service didn't initialize, check your configuration");

		return () => false;
	}

	return dispatch =>
		firebaseService.auth
			.signInWithEmailAndPassword(username, password)
			.then(() => {
				return dispatch({
					type: LOGIN_SUCCESS
				});
			})
			.catch(error => {
				console.info('error');
				const usernameErrorCodes = [
					'auth/email-already-in-use',
					'auth/invalid-email',
					'auth/operation-not-allowed',
					'auth/user-not-found',
					'auth/user-disabled'
				];
				const passwordErrorCodes = ['auth/weak-password', 'auth/wrong-password'];

				const response = {
					username: usernameErrorCodes.includes(error.code) ? error.message : null,
					password: passwordErrorCodes.includes(error.code) ? error.message : null
				};

				if (error.code === 'auth/invalid-api-key') {
					dispatch(Actions.showMessage({ message: error.message }));
				}

				return dispatch({
					type: LOGIN_ERROR,
					payload: response
				});
			});
}
