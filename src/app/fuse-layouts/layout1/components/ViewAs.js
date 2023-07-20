/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import * as Actions from 'app/store/actions/';
import * as UserActions from 'app/auth/store/actions/user.actions';
import history from '@history';
import axios from 'axios';
import JwtService from 'app/services/jwtService';
import * as PusherPushNotifications from '@pusher/push-notifications-web';
import SchoolListDialog from './SchoolListDialog';
import secureLocalStorage from 'react-secure-storage';

function ViewAs() {
	const dispatch = useDispatch();
	const user = useSelector(({ auth }) => auth.user);
	const handleSwitchAdmin = () => {
		dispatch(
			Actions.openDialog({
				children: <SchoolListDialog />
			})
		);
	};

	const handleBackToSuperAdmin = () => {
		window.navigator.serviceWorker.ready.then(serviceWorkerRegistration => {
			const beamsClient = new PusherPushNotifications.Client({
				instanceId: process.env.REACT_APP_BEAMS_INSTANCE_ID,
				serviceWorkerRegistration
			});
			beamsClient.clearAllState().then(() => console.log('Cleared all beams state'));
		});
		JwtService.setSession(secureLocalStorage.getItem('superadmin_token'));
		secureLocalStorage.removeItem('superadmin_token');
		const tempUser = JSON.parse(secureLocalStorage.getItem('user'));
		tempUser.role[0] = 'super_admin';
		axios.get('/api/v1/profile').then(res => {
			tempUser.data.displayName = `${res.data.first_name} ${res.data.last_name}`;
			secureLocalStorage.setItem('user', JSON.stringify(tempUser));
			dispatch(UserActions.setUserData(tempUser));
			history.push('/company');
		});
	};

	return (
		<>
			{user.role[0] === 'super_admin' || user.role[0] === 'super_school_admin' ? (
				<div className="text-white ml-44">
					<p className="text-white">View As:</p>
					<button type="button" onClick={handleSwitchAdmin} className="view-as-btn">
						Select School <i className="fas fa-angle-down ml-2" />
					</button>
				</div>
			) : (
				''
			)}
			{user.role[0] === 'super_school_admin' && (
				<p
					style={{ cursor: 'pointer', maxWidth: 150, margin: 'auto', marginTop: 30, marginBottom: 50 }}
					onClick={handleBackToSuperAdmin}
					className="text-white back-sa-btn"
				>
					Back to Company 
				</p>
			)}
		</>
	);
}

export default ViewAs;
