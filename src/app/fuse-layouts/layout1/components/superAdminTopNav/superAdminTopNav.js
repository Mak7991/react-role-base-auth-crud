import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import * as PusherPushNotifications from '@pusher/push-notifications-web';
import { useSelector, useDispatch } from 'react-redux';
import {
	getCompanyAdminNotifications,
	getCompanyAdminUnreadNotifications,
} from 'app/services/notifications/notifications';
// import JwtService from 'app/services/jwtService';
import Calendar from './superAdminCalendar';
import Notifications from './superAdminNotifications';
import './superAdminTopNav.css';
import * as Actions from 'app/store/actions';
import * as userActions from 'app/auth/store/actions';
import Pusher from 'pusher-js';
import history from '@history';

const useStyles = makeStyles((_) => ({
	separator: {
		marginTop: 15,
		width: 1,
		height: 60,
		backgroundColor: 'rgba(0, 0, 0, 0.12)',
	},
}));

function SuperAdminTopNav() {
	const dispatch = useDispatch();
	const classes = useStyles();
	const [notifications, setNotifications] = useState([]);
	const [loadingNotifications, setLoadingNotifications] = useState(false);
	const [unreadCount, SetunreadCount] = useState(0);
	const [hasMore, setHasMore] = useState(false);
	const [page, setPage] = useState(1);
	const [fetchingMore, setFetchingMore] = useState(false);
	const user = useSelector(({ auth }) => auth.user);
	const [refresh, setRefresh] = useState(false);
	let pusher;
	let channel;

	useEffect(() => {
		let beamsClient;
		console.log(user.data.id);

		setTimeout(() => {
			window.navigator.serviceWorker.ready.then((serviceWorkerRegistration) => {
				beamsClient = new PusherPushNotifications.Client({
					instanceId: process.env.REACT_APP_BEAMS_INSTANCE_ID,
					serviceWorkerRegistration,
				});
				beamsClient
					.getRegistrationState()
					.then((state) => {
						const states = PusherPushNotifications.RegistrationState;
						switch (state) {
							case states.PERMISSION_DENIED: {
								// Notifications are blocked
								// Show message saying user should unblock notifications in their browser
								break;
							}
							case states.PERMISSION_GRANTED_REGISTERED_WITH_BEAMS: {
								beamsClient
									.addDeviceInterest(`App.Models.User.${user.data.id}`)
									.then(() => beamsClient.getDeviceInterests())
									.then((interests) => console.log('Current interests:', interests))
									.catch(console.error);
								break;
							}
							case states.PERMISSION_GRANTED_NOT_REGISTERED_WITH_BEAMS:
							case states.PERMISSION_PROMPT_REQUIRED: {
								beamsClient
									.start()
									.then((client) => client.getDeviceId())
									.then((deviceId) =>
										console.log('Successfully registered with Beams. Device ID:', deviceId)
									)
									.then(() => beamsClient.addDeviceInterest(`App.Models.User.${user.data.id}`))
									.then(() => beamsClient.getDeviceInterests())
									.then((interests) => console.log('Current interests:', interests))
									.catch(console.error);
								break;
							}
							default: {
								throw new Error(`Unexpected Pusher SDK state: ${state}`);
							}
						}
					})
					.catch((e) => console.error('Could not get registration state', e));
				getCompanyAdminUnreadNotifications().then((res) => SetunreadCount(res.data.count));
				getCompanyAdminNotifications(1)
					.then((res) => {
						setNotifications([...notifications, ...res.data.data]);
						if (res.data.last_page > res.data.current_page) {
							setHasMore(true);
							setPage(page + 1);
						} else {
							setHasMore(false);
						}
					})
					.catch((err) => console.log(err))
					.finally(() => setLoadingNotifications(false));
			});
		}, 5000);
		setLoadingNotifications(true);

		const handleNotificationCount = (e) => {
			SetunreadCount(e.data.data.unread_notification_count);
			getCompanyAdminNotifications(1)
				.then((res) => {
					setNotifications([...res.data.data, ...notifications]);
					if (res.data.last_page > res.data.current_page) {
						setHasMore(true);
						setPage(page + 1);
					} else {
						setHasMore(false);
					}
				})
				.catch((err) => console.log(err))
				.finally(() => setLoadingNotifications(false));
		};
		navigator.serviceWorker.addEventListener('message', handleNotificationCount);

		return () => {
			window.navigator.serviceWorker.ready.then((serviceWorkerRegistration) => {
				// eslint-disable-next-line no-unused-expressions
				beamsClient?.clearDeviceInterests();
			});
			navigator.serviceWorker.removeEventListener('message', handleNotificationCount);
			setRefresh(false);
		};
	}, []);

	useEffect(() => {
		console.log(user.data.id);
		pusher = new Pusher(process.env.REACT_APP_PUSHER_CHANNEL_ID, {
			cluster: process.env.REACT_APP_PUSHER_CLUSTER_ID ,
		});
		channel = pusher.subscribe(`company_app_${user.data.school.id}`);
		channel.bind('company_disabled', realtimeLogout);
		return () => {
			pusher.disconnect();
		};
	}, []);

	const realtimeLogout = (e) => {
		console.log(e);

		dispatch(userActions.logoutUser());
		dispatch(
			Actions.showMessage({
				message: 'Something went wrong please contact with your administrator',
				variant: 'error',
				autoHideDuration: 3000,
			})
		);
		pusher.disconnect();
		history.push('/login');
	};

	const handleLoadMore = () => {
		setFetchingMore(true);
		getCompanyAdminNotifications(page)
			.then((res) => {
				setNotifications([...notifications, ...res.data.data]);
				if (res.data.last_page > res.data.current_page) {
					setHasMore(true);
					setPage(page + 1);
				} else {
					setHasMore(false);
				}
			})
			.catch((err) => console.log({ ...err }))
			.finally(() => setFetchingMore(false));
	};

	return (
		<div className="flex justify-between items-center">
			<div>
				<Calendar />
			</div>
			<div className={classes.separator} />
			<div className="icons-wrapper flex">
				<div className="icon-wrapper">
					<Notifications
						hasMore={hasMore}
						notifications={notifications}
						handleLoadMore={handleLoadMore}
						fetchingMore={fetchingMore}
						setLoadingNotifications={setLoadingNotifications}
						loadingNotifications={loadingNotifications}
						SetunreadCount={SetunreadCount}
						unreadCount={unreadCount}
						setRefresh={setRefresh}
						refresh={refresh}
						setNotifications={setNotifications}
					/>
					{unreadCount ? <span className="notification-count">{unreadCount}</span> : ''}
				</div>
			</div>
		</div>
	);
}

export default SuperAdminTopNav;
