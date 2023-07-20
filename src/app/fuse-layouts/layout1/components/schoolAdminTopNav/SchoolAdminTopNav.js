/* eslint-disable no-shadow */
import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import history from '@history';
import * as PusherPushNotifications from '@pusher/push-notifications-web';
import { useSelector, useDispatch } from 'react-redux';
import { getNotifications, getUnreadNotifications } from 'app/services/notifications/notifications';
import Pusher from 'pusher-js';
import * as Actions from 'app/store/actions';
import * as userActions from 'app/auth/store/actions';
import Calendar from './Calendar';
import Notifications from './Notifications';
import StudentCheckIn from './StudentCheckIn';
import Events from './Events';
import './schoolAdminTopNav.css';

let isLastVisitedURLMessaging = false;

const useStyles = makeStyles((_) => ({
	separator: {
		marginTop: 15,
		width: 1,
		height: 60,
		backgroundColor: 'rgba(0, 0, 0, 0.12)',
	},
}));

function SchoolAdminTopNav({ setUnreadCount, unreadCount }) {
	const dispatch = useDispatch();
	const [notifications, setNotifications] = useState([]);
	const [loadingNotifications, setLoadingNotifications] = useState(false);
	// const [unreadCount, setUnreadCount] = useState(0);
	const [hasMore, setHasMore] = useState(false);
	const [page, setPage] = useState(1);
	const [fetchingMore, setFetchingMore] = useState(false);
	const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);
	const user = useSelector(({ auth }) => auth.user);
	let beamsClient;
	let id;
	let pusher;
	let channel;
	if (user.role[0] === 'super_admin' || user.role[0] === 'school_admin' || user.role[0] === 'sub_admin') {
		id = user.data.id;
	} else {
		id = user?.school?.admins ? user.school.admins[0].id : user?.school?.pivot?.user_id;
	}
	useEffect(() => {
		if (history.location.pathname === '/messaging' || history.location.pathname === '/messaging-chat') {
			isLastVisitedURLMessaging = true;
			setUnreadMessagesCount(0);
			return;
		}
		if (
			history.location.pathname !== '/messaging' &&
			history.location.pathname !== '/messaging-chat' &&
			isLastVisitedURLMessaging
		) {
			isLastVisitedURLMessaging = false;
			getUnreadNotifications().then((res) => {
				setUnreadCount(res.data.count);
				setUnreadMessagesCount(res.data.school_conversation_count);
			});
		}
	}, [history.location.pathname, unreadMessagesCount]);

	useEffect(() => {
		getUnreadNotifications().then((res) => {
			setUnreadCount(res.data.count);
			setUnreadMessagesCount(res.data.school_conversation_count);
		});
		pusher = new Pusher(process.env.REACT_APP_PUSHER_CHANNEL_ID, {
			cluster: process.env.REACT_APP_PUSHER_CLUSTER_ID,
		});
		setLoadingNotifications(true);
		const timeout = setTimeout(() => {
			startBeamsClient(id);
			getNotificationsPage1();
		}, 5000);

		if (user.role[0] === 'sub_admin') {
			channel = pusher.subscribe(`ld-channel-${id}`);
			channel.bind('ld-subadmin-disabled', realtimeLogout);
		}

		if (user.role[0] !== 'super_school_admin') {
			channel = pusher.subscribe(`school_app_${user.data.school.id}`);
			channel.bind('school_disabled', realtimeLogout);
		}

		if (user.role[0] === 'school_admin' || user.role[0] === 'sub_admin') {
			channel = pusher.subscribe(`school_app_for_company${user.data.school.company_id}`);
			channel.bind('company_disabled', realtimeLogout);
		}

		navigator.serviceWorker.addEventListener('message', handleReceiveNotification);

		return () => {
			stopBeamsClient();
			pusher.disconnect();
			clearTimeout(timeout);
			navigator.serviceWorker.removeEventListener('message', handleReceiveNotification);
		};
	}, [user]);

	const classes = useStyles();

	const getNotificationsPage1 = () => {
		getNotifications(1)
			.then((res) => {
				setNotifications(res.data.data);
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

	const realtimeLogout = (e) => {
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
	const handleReceiveNotification = (e) => {
		console.log(e);
		if (e.data.data.type === 'checkin_code_request' && e.data.isBg) {
			setUnreadCount(e.data.data.unread_notification_count);
			const { data } = e.data;
			const temp = {
				data: {
					title: e.data.notification.title,
					body: e.data.notification.body,
					type: e.data.data.type,
					data,
				},
				created_at: new Date().toISOString().slice(0, new Date().toISOString().length - 1),
				read_at: null,
				id: e.data?.data?.notification_id || new Date().getMilliseconds(),
			};
			setNotifications((prevState) => [temp, ...prevState]);
			return;
		}
		if (e.data.data.click_action === 'chat_silent_notification') {
			return;
		}
		if (e.data.data.click_action === 'chat_push_notification') {
			getUnreadNotifications().then((res) => {
				let src = 'assets/sounds/message-sound.mp3';
				let audio = new Audio(src);
				audio.play();
				setUnreadCount(res.data.count);
				setUnreadMessagesCount(res.data.school_conversation_count);
			});
			return;
		}
		if (e.data.data.click_action === 'staff_attendance_push_notification') {
			if (e.data.data.school_admin_id == id) {
				setUnreadCount(e.data.data.unread_notification_count);
				const { data } = e.data;
				const temp = {
					data: {
						...data,
						room: JSON.parse(data.room),
					},
					created_at: new Date().toISOString().slice(0, new Date().toISOString().length - 1),
					read_at: null,
					id: e.data?.data?.notification_id || new Date().getMilliseconds(),
				};
				setNotifications((prevState) => [temp, ...prevState]);
				return;
			}
		}
		if (e.data.data.type === 'teacher_announcement') {
			if (e.data.isBg && document.visibilityState === 'visible') {
				return;
			}
			if (!e.data.isBg && document.visibilityState === 'hidden') {
				return;
			}
			setUnreadCount(e.data.data.unread_notification_count);
			const temp = {
				created_at: new Date().toISOString().slice(0, new Date().toISOString().length - 1),
				read_at: null,
				data: {
					data: {
						...e.data.data,
					},
					...e.data.data,
				},
				id: e.data?.data?.notification_id || new Date().getMilliseconds(),
			};
			setNotifications((prevState) => [temp, ...prevState]);
		}
	};

	const stopBeamsClient = () => {
		window.navigator.serviceWorker.ready.then((serviceWorkerRegistration) => beamsClient?.clearDeviceInterests());
	};

	const startBeamsClient = (userId) => {
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
								.addDeviceInterest(`App.Models.User.${id}`)
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
								.then(() => beamsClient.addDeviceInterest(`App.Models.User.${id}`))
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
		});
	};

	const handleGoToCalendar = () => {
		history.push('/calendar');
	};
	const handleLoadMore = () => {
		setFetchingMore(true);
		getNotifications(page)
			.then((res) => {
				setNotifications([...notifications, ...res.data.data]);
				if (res.data.last_page > res.data.current_page) {
					setHasMore(true);
					setPage(page + 1);
				} else {
					setHasMore(false);
				}
			})
			.catch((err) => {
				console.log({ ...err });
				setHasMore(false);
			})
			.finally(() => setFetchingMore(false));
	};
	return (
		<div className="flex justify-between items-center">
			{/* <div className="icon-wrapper">
				<topbar />
			</div> */}
			<div>
				<Calendar onClick={handleGoToCalendar} />
			</div>
			<div className={classes.separator} />
			<div className="icons-wrapper flex">
				<div className="icon-wrapper">
					<Notifications
						hasMore={hasMore}
						unreadMessagesCount={unreadMessagesCount}
						notifications={notifications}
						handleLoadMore={handleLoadMore}
						fetchingMore={fetchingMore}
						loadingNotifications={loadingNotifications}
						setUnreadCount={setUnreadCount}
						unreadCount={unreadCount}
						setNotifications={setNotifications}
						setUnreadMessagesCount={setUnreadMessagesCount}
					/>
					{unreadCount > 0 && unreadMessagesCount > 0 ? (
						<span className="notification-count">{Number(unreadCount) + Number(unreadMessagesCount)}</span>
					) : unreadCount > 0 ? (
						<span className="notification-count">{Number(unreadCount)}</span>
					) : unreadMessagesCount > 0 ? (
						<span className="notification-count">{Number(unreadMessagesCount)}</span>
					) : (
						''
					)}
				</div>

				<div className="icon-wrapper">
					<StudentCheckIn />
				</div>

				<div className="icon-wrapper">
					<Events />
				</div>
			</div>
		</div>
	);
}

export default SchoolAdminTopNav;
