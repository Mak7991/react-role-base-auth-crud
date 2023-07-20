/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React, { useState } from 'react';
import Button from '@material-ui/core/Button';
import Popover from '@material-ui/core/Popover';
import AvatarGroup from '@material-ui/lab/AvatarGroup';
import { TableCell, TableRow, CircularProgress, Avatar } from '@material-ui/core';
import { deleteAllNotification, readNotification } from 'app/services/notifications/notifications';
import dayjs from 'dayjs';
import './notifications.css';
import { useSelector, useDispatch } from 'react-redux';
import History from '@history';
import InfiniteScroll from 'react-infinite-scroll-component';
import * as Actions from 'app/store/actions';

function Notifications({
	notifications,
	loadingNotifications,
	handleLoadMore,
	hasMore,
	setUnreadCount,
	unreadCount,
	setNotifications,
	unreadMessagesCount,
	setUnreadMessagesCount,
	fetchingMore,
}) {
	const dispatch = useDispatch();
	const [userMenu, setUserMenu] = useState(null);
	const [page, setPage] = useState(1);
	const user = useSelector(({ auth }) => auth.user);

	const userMenuClick = (event) => {
		setUserMenu(event.currentTarget);
	};

	const userMenuClose = () => {
		setUserMenu(null);
	};

	const handleNotificationRead = (notification) => {
		const time = new Date().getTime();
		const temp = notifications.map((n) => (n.id === notification.id ? { ...n, read_at: time } : n));
		if (!notification.read_at) {
			setNotifications(temp);
			setUnreadCount(unreadCount - 1);
			readNotification(notification.id);
		}
		if (notification?.data?.data?.type === 'checkin_code_request') {
			const id = Object.keys(notification.data.data.childs)[0];
			History.push({ pathname: `/students-student/${id}` });
		}
	};

	const readAllNotification = () => {
		deleteAllNotification()
			.then(() => {
				setNotifications([]);
				setUnreadCount(0);
				setUnreadMessagesCount(0);
			})
			.catch((resp) => {
				dispatch(
					Actions.showMessage({
						message: resp.data.message,
						autoHideDuration: 1500,
						variant: 'success',
					})
				);
			});
	};

	return (
		<>
			<Button onClick={userMenuClick}>
				<div className="noti-wrapper">
					<div className="noti-icon-wrapper">
						<img src="assets/images/schoolAdminTopNav/noti-icon.svg" alt="notification" />
					</div>
					<div className="noti-text">Notifications</div>
				</div>
			</Button>
			{user.role[0] !== 'super_admin' && (
				<Popover
					open={Boolean(userMenu)}
					anchorEl={userMenu}
					className="mt-6"
					onClose={userMenuClose}
					anchorOrigin={{
						vertical: 'bottom',
						horizontal: 'left',
					}}
					transformOrigin={{
						vertical: 'top',
						horizontal: 'left',
					}}
				>
					{notifications?.length > 0 || unreadMessagesCount > 0 ? (
						<div className="flex justify-between">
							<div></div>
							<div className="cursor-pointer delete-notification" onClick={() => readAllNotification()}>
								Clear all
							</div>
						</div>
					) : null}

					<div id="scrollableDiv" style={{ height: 450, width: '460px', overflow: 'auto' }}>
						<InfiniteScroll
							dataLength={notifications.length}
							next={handleLoadMore}
							hasMore={hasMore}
							scrollableTarget="scrollableDiv"
						>
							{unreadMessagesCount > 0 ? (
								<TableRow>
									<TableCell
										className="cursor-pointer notification-wrapper"
										style={{ backgroundColor: `#F0F9FE`, width: 448 }}
										onClick={() => {
											History.push('/messaging');
											setUnreadMessagesCount(0);
											setUserMenu(null);
										}}
									>
										<div className="flex" style={{ gap: '5px' }}>
											<div className="">
												<Avatar
													style={{ width: '35px', height: '35px' }}
													src="assets/images/schoolAdminTopNav/noti-icon.svg"
												/>
											</div>
											<div className="flex flex-col">
												<span
													style={{ fontSize: '14px', marginBottom: '4px' }}
													className="font-bold"
												>
													New message received
												</span>
												<span style={{ fontSize: '12px' }}>
													<span className="font-bold">
														You have {unreadMessagesCount} new message
														{unreadMessagesCount > 1 ? 's' : ''}
													</span>
												</span>
											</div>
										</div>
									</TableCell>
								</TableRow>
							) : (
								''
							)}
							{loadingNotifications ? (
								<div
									style={{ height: '450px' }}
									className="text-center flex flex-col justify-center items-center"
								>
									<CircularProgress size={30} />
								</div>
							) : notifications?.length ? (
								notifications?.map((notification, key) => {
									const { data } = notification;
									return data?.data?.type?.toLowerCase() === 'checkin_code_request' ? (
										<TableRow key={key}>
											<TableCell
												className="cursor-pointer notification-wrapper"
												style={{ backgroundColor: `${notification.read_at ? '' : '#F0F9FE'}` }}
												onClick={() => handleNotificationRead(notification)}
											>
												<div className="flex" style={{ gap: '5px' }}>
													<div className="">
														<Avatar
															style={{ width: '35px', height: '35px' }}
															src={
																data?.data?.type === 'checkin_code_request'
																	? '/assets/images/checkin-code-request-icon.png'
																	: notification?.room?.thumb
															}
														/>
													</div>
													<div className="flex flex-col">
														<span
															style={{ fontSize: '14px', marginBottom: '4px' }}
															className="font-bold"
														>
															{data?.title}
														</span>
														<span style={{ fontSize: '12px' }}>
															<span className="font-bold">
																{data?.body.split(' ').slice(0, 2).join(' ')}
															</span>{' '}
															<span>{data?.body.split(' ').slice(2).join(' ')}</span>
														</span>
													</div>
													<div
														className="flex flex-col items-end justify-between"
														style={{ flexShrink: 0 }}
													>
														<span style={{ fontSize: '11px', marginTop: '4px' }}>
															{dayjs(`${notification.created_at}z`).format(
																'MMMM[ ] D[,] YYYY[,] hh[:]mm[ ]A'
															)}
														</span>
														<span className="mt-6 flex" style={{ gap: '8px' }}>
															<AvatarGroup className="avatar-default-text" max={2}>
																{Object.values(data?.data?.childs).map((child, k) => {
																	return <Avatar src={child} key={k} />;
																})}
															</AvatarGroup>
														</span>
													</div>
												</div>
											</TableCell>
										</TableRow>
									) : data?.click_action?.toLowerCase() === 'staff_attendance_push_notification' ? (
										<TableRow key={key}>
											<TableCell
												className="cursor-pointer notification-wrapper"
												style={{
													backgroundColor: `${notification.read_at ? '' : '#F0F9FE'}`,
													width: '450px',
												}}
												onClick={() => handleNotificationRead(notification)}
											>
												<div className="flex" style={{ gap: '5px' }}>
													<div className="">
														<Avatar
															style={{ width: '35px', height: '35px' }}
															src={
																data?.room?.thumb ||
																'assets/images/schoolAdminTopNav/noti-icon.svg'
															}
														/>
													</div>
													<div className="flex flex-col" style={{ flexGrow: 1 }}>
														<span
															style={{ fontSize: '14px', marginBottom: '4px' }}
															className="font-bold"
														>
															{data?.room?.name}
														</span>
														<span style={{ fontSize: '12px' }}>
															<span className="font-bold">
																{data?.message.split(' ').slice(0, 2).join(' ')}
															</span>{' '}
															<span>
																{`${data?.message
																	.split(' ')
																	.slice(2)
																	.join(' ')} ${dayjs(
																	`${notification.created_at}z`
																).format('MM-DD-YYYY hh[:]mm[ ]A')}`}
															</span>
														</span>
													</div>
													<div className="flex flex-col items-end" style={{ flexShrink: 0 }}>
														<span style={{ fontSize: '11px', marginTop: '4px' }}>
															{dayjs(`${notification.created_at}z`).format(
																'MMMM[ ] D[,] YYYY[,] hh[:]mm[ ]A'
															)}
														</span>
														<span>
															<Avatar src={data?.staff_image} />
														</span>
													</div>
												</div>
											</TableCell>
										</TableRow>
									) : data?.data?.type?.toLowerCase() === 'teacher_announcement' ? (
										<TableRow key={key}>
											<TableCell
												className="cursor-pointer notification-wrapper"
												style={{
													backgroundColor: `${notification.read_at ? '' : '#F0F9FE'}`,
													width: '450px',
												}}
												onClick={() => handleNotificationRead(notification)}
											>
												<div className="flex" style={{ gap: '5px' }}>
													<div className="">
														<Avatar
															style={{ width: '35px', height: '35px' }}
															src={
																data?.data?.room?.thumb ||
																'assets/images/schoolAdminTopNav/noti-icon.svg'
															}
														/>
													</div>
													<div className="flex flex-col" style={{ flexGrow: 1 }}>
														<span
															style={{ fontSize: '14px', marginBottom: '4px' }}
															className="font-bold"
														>
															{data?.data?.room?.name}
														</span>
														<span style={{ fontSize: '12px' }}>
															<span className="font-bold">
																{data?.body.split(' ').slice(0, 1).join(' ')}
															</span>{' '}
															<span>{data?.body.split(' ').slice(1).join(' ')}</span>
														</span>
													</div>
													<div className="flex flex-col items-end" style={{ flexShrink: 0 }}>
														<span style={{ fontSize: '11px', marginTop: '4px' }}>
															{dayjs(`${notification.created_at}z`).format(
																'MMMM[ ] D[,] YYYY[,] hh[:]mm[ ]A'
															)}
														</span>
													</div>
												</div>
											</TableCell>
										</TableRow>
									) : (
										<TableRow key={key}>
											<TableCell
												className="cursor-pointer notification-wrapper"
												style={{ backgroundColor: `${notification.read_at ? '' : '#F0F9FE'}` }}
												onClick={() => handleNotificationRead(notification)}
											>
												<div className="flex" style={{ gap: '5px' }}>
													<div className="">
														<Avatar
															style={{ width: '35px', height: '35px' }}
															src={
																notification?.room?.thumb ||
																'assets/images/schoolAdminTopNav/noti-icon.svg'
															}
														/>
													</div>
													<div className="flex flex-col">
														<span
															style={{ fontSize: '14px', marginBottom: '4px' }}
															className="font-bold"
														>
															{data?.title}
														</span>
														<span style={{ fontSize: '12px' }}>
															<span className="font-bold">
																{data?.body.split(' ').slice(0, 2).join(' ')}
															</span>{' '}
															<span>{data?.body.split(' ').slice(2).join(' ')}</span>
														</span>
													</div>
													<div className="flex flex-col items-end" style={{ flexShrink: 0 }}>
														<span style={{ fontSize: '11px', marginTop: '4px' }}>
															{dayjs(`${notification.created_at}z`).format(
																'MMMM[ ] D[,] YYYY[,] hh[:]mm[ ]A'
															)}
														</span>
													</div>
												</div>
											</TableCell>
										</TableRow>
									);
								})
							) : (
								<>
									{unreadMessagesCount === 0 && (
										<div className="p-16 text-center">No notifications available</div>
									)}
								</>
							)}
							{fetchingMore && (
								<TableRow>
									<TableCell>
										<div className="flex justify-center">
											<CircularProgress size={35} />
										</div>
									</TableCell>
								</TableRow>
							)}
						</InfiniteScroll>
					</div>
				</Popover>
			)}
		</>
	);
}

export default Notifications;
