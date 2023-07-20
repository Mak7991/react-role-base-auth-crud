/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import './Topbar.css';
import { gettopbar } from 'app/services/notificationtopbar/notificationtopbar';
import { readNotification } from 'app/services/notifications/notifications';
import { KeyboardArrowDown, KeyboardArrowUp } from '@material-ui/icons';
import { IconButton } from '@material-ui/core';
import { getDay_time } from 'utils/utils';

function Topbar({ style, display, setUnreadCount, unreadCount }) {
	const user = useSelector(({ auth }) => auth.user);
	const [data, setData] = useState({ notifications: [], activeIndex: 0 });
	const [visibility, setVisibility] = useState(false);
	let interval;
	let id;
	if (user.role[0] === 'super_admin' || user.role[0] === 'school_admin' || user.role[0] === 'sub_admin') {
		id = user.data.id;
	} else {
		id = user?.school?.admins ? user.school.admins[0].id : user?.school?.pivot?.user_id;
	}

	useEffect(() => {
		navigator.serviceWorker.addEventListener('message', handleReceiveNotification);
		const timeout = setTimeout(() => {
			gettopbar().then((res) => {
				const notifi = res.data.data.filter(
					(notification) =>
						!notification.read_at &&
						new Date().toISOString().split('T')[0] === notification.created_at.split(' ')[0]
				);
				setData({
					activeIndex: 0,
					notifications: notifi,
				});
				if (notifi.length) {
					interval = setInterval(() => {
						setData((prevState) => {
							const n = prevState.notifications.filter(
								(notification) =>
									new Date().toISOString().split('T')[0] === notification.created_at.split(' ')[0]
							);
							return {
								notifications: n,
								activeIndex: (prevState.activeIndex + 1) % (n.length > 25 ? 25 : n.length || 1),
							};
						});
					}, 5000);
				}
			});
		}, 500);
		return () => {
			clearInterval(interval);
			clearTimeout(timeout);
			// setData({ notifications: [], activeIndex: 0 });
			navigator.serviceWorker.removeEventListener('message', handleReceiveNotification);
		};
	}, [user]);

	const handleReceiveNotification = (e) => {
		if (e.data.data.type === 'teacher_announcement') {
			if (e.data.isBg && document.visibilityState === 'visible') {
				return;
			}
			if (!e.data.isBg && document.visibilityState === 'hidden') {
				return;
			}
			let src = 'assets/sounds/mayday-notification-sound.mp3';
			let audio = new Audio(src);
			audio.play();
			setData((prevData) => ({
				...prevData,
				notifications: [
					{
						data: { data: e.data.data },
						id: e.data?.data?.notification_id || new Date().getMilliseconds(),
						created_at: new Date().toISOString(),
					},
					...prevData.notifications,
				],
			}));
		}
		if (e.data.data.click_action === 'notification_removal_notification') {
			const notifIds = JSON.parse(e.data.data.removal_items);
			console.log('notifIds__', notifIds);
			let deleteCount = 0;
			setData((prevState) => {
				const newNotifs = prevState.notifications.filter((notif) => !notifIds.includes(notif.id));
				deleteCount = prevState.notifications.length - newNotifs.length;
				return {
					activeIndex: prevState?.activeIndex % (newNotifs.length ? newNotifs.length : 1),
					notifications: newNotifs,
				};
			});
			setUnreadCount((prevCount) => prevCount - deleteCount);
		}
		if (!interval) {
			interval = setInterval(() => {
				setData((prevState) => {
					const n = prevState.notifications.filter(
						(notification) =>
							new Date().toISOString().split('T')[0] === notification.created_at.split(' ')[0]
					);
					return {
						notifications: n,
						activeIndex: (prevState.activeIndex + 1) % (n.length > 25 ? 25 : n.length ? n.length : 1),
					};
				});
			}, 5000);
		}
	};

	const handleNotificationRead = (notification) => {
		console.log('notification_____', notification);
		if (!notification.read_at) {
			setUnreadCount(unreadCount - 1);
			readNotification(notification.id);
			const notifications = data.notifications.filter((n) => n.id !== notification.id);
			if (notifications.length === 0) {
				setVisibility(false);
			}
			setData((prevState) => {
				return {
					activeIndex: prevState.activeIndex % (notifications.length ? notifications.length : 1),
					notifications: notifications,
				};
			});
		}
	};

	return (
		<div className="relative topbar-wrapper flex">
			{data.notifications?.length > 0 ? (
				<>
					<div className="top-barr items-center flex-grow" style={{ ...style, display }}>
						{data.notifications[data.activeIndex]?.data.click_action ===
						'staff_attendance_push_notification' ? (
							<>
								<div className="flex img-topbarr">
									<img src={data.notifications[data.activeIndex]?.data.room_image} alt="" />
									<div className="flex items-center">
										<div className="top-barr-text">
											{`${data.notifications[data.activeIndex]?.data.room.name} :
								${data.notifications[data.activeIndex]?.data.raw_message}
					            `}
										</div>
									</div>
								</div>

								<div
									className="cross-img cursor-pointer"
									onClick={() => handleNotificationRead(data.notifications[data.activeIndex])}
								>
									<img src="assets/images/cross-icon.svg" className="cursor-pointer" alt="" />
								</div>
							</>
						) : (
							<>
								<div className="flex img-topbarr">
									<img src={data.notifications[data.activeIndex]?.data?.data?.room.photo} alt="" />
									<div className="flex items-center">
										<div className="break-top-barr-text">
											{`${data.notifications[data.activeIndex]?.data?.data?.room.name} :
									${data.notifications[data.activeIndex]?.data?.data?.body} `}
										</div>
										{/* <div className="ml-4">{`${data.activeIndex + 1} `}</div> */}
									</div>
								</div>

								<div
									className="cross-img flex cursor-pointer"
									onClick={() => handleNotificationRead(data.notifications[data.activeIndex])}
								>
									<div className="break-top-barr-text mr-10">
										{getDay_time(data.notifications[data.activeIndex]?.created_at)}
									</div>
									<img src="assets/images/cross-icon.svg" alt="" />
								</div>
							</>
						)}
					</div>
					<IconButton
						onClick={() => {
							setVisibility(!visibility);
						}}
					>
						{visibility ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
					</IconButton>
				</>
			) : (
				''
			)}

			{visibility && data.notifications.length > 0 ? (
				<div
					style={{
						maxHeight: visibility ? '300px' : 0,
						padding: visibility ? '2rem' : 0,
						overflow: 'auto',
					}}
					className="topbar-dropdown bg-white rounded-lg"
				>
					{data.notifications.map((notification, ind, arr) => {
						return (
							<>
								<div
									className={`top-barr-dd items-center flex-grow py-12 ${
										ind === arr.length - 1 ? 'pb-0' : 'border-b'
									} ${ind === 0 && 'pt-0'}`}
									style={{ ...style, display }}
								>
									<div className="flex img-topbarr">
										<img src={notification?.data?.data?.room.photo} alt="" />
										<div className="flex items-center">
											<div className="break-top-barr-text">
												{`${notification?.data?.data?.room.name} :
							${notification?.data?.data?.body}
							`}
											</div>
										</div>
									</div>

									<div
										className="cross-img cursor-pointer flex"
										onClick={() => handleNotificationRead(notification)}
									>
										<div className="break-top-barr-text mr-10">
											{getDay_time(notification?.created_at)}
										</div>
										<img src="assets/images/cross-icon.svg" className="cursor-pointer" alt="" />
									</div>
								</div>
							</>
						);
					})}
				</div>
			) : (
				''
			)}
		</div>
	);
}

export default Topbar;
