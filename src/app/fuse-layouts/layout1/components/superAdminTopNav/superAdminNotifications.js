/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React, { useState } from 'react';
import Button from '@material-ui/core/Button';
import Popover from '@material-ui/core/Popover';
import { TableCell, TableRow, CircularProgress, Avatar } from '@material-ui/core';
import {
	deleteAllCompanyAdminNotifications,
	getCompanyAdminReadNotifications,
} from 'app/services/notifications/notifications';
import dayjs from 'dayjs';
import './superAdminNotifications.css';
import { useSelector, useDispatch } from 'react-redux';
import InfiniteScroll from 'react-infinite-scroll-component';
import * as Actions from 'app/store/actions';

const Notifications = ({
	notifications,
	loadingNotifications,
	handleLoadMore,
	hasMore,
	SetunreadCount,
	unreadCount,
	fetchingMore,
	setNotifications,
}) => {
	const dispatch = useDispatch();
	const [userMenu, setUserMenu] = useState(null);
	const user = useSelector(({ auth }) => auth.user);

	const userMenuClick = (event) => {
		setUserMenu(event.currentTarget);
		SetunreadCount(unreadCount - unreadCount);
		getCompanyAdminReadNotifications();
	};

	const userMenuClose = () => {
		setUserMenu(null);
	};

	const readAllNotification = () => {
		deleteAllCompanyAdminNotifications()
			.then(() => {
				setNotifications([]);
				SetunreadCount(unreadCount - unreadCount);
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
				{notifications?.length > 0 ? (
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
						// loader={
						// 	<h4 className="flex justify-center items-center">
						// 		<CircularProgress size={30} />
						// 	</h4>
						// }
					>
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
								return data?.data?.type?.toLowerCase() === 'student_addition' ? (
									<TableRow key={key}>
										<TableCell className="cursor-pointer notification-wrapper">
											<div className="flex" style={{ gap: '5px' }}>
												<div className="">
													<Avatar
														style={{ width: '35px', height: '35px' }}
														src={
															data?.data?.type === 'student_addition'
																? '/assets/images/students.svg'
																: data?.data.thumb
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
														<span>{data?.body}</span>{' '}
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
													<div style={{ marginBottom: '15px' }}>
														<span className="notification-type-icon">
															<Avatar
																style={{ width: '35px', height: '35px' }}
																src={notification?.data?.data?.thumb}
															/>
														</span>
													</div>
												</div>
											</div>
										</TableCell>
									</TableRow>
								) : data?.data?.type?.toLowerCase() === 'roster_addition' ? (
									<TableRow key={key}>
										<TableCell className="cursor-pointer notification-wrapper">
											<div className="flex" style={{ gap: '5px' }}>
												<div className="">
													<Avatar
														style={{ width: '35px', height: '35px' }}
														src={
															data?.data?.type === 'roster_addition'
																? '/assets/images/students.svg'
																: data?.thumb
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
														<span>{data?.body}</span>{' '}
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
													<div style={{ marginBottom: '15px' }}>
														<span className="notification-type-icon">
															<Avatar
																style={{ width: '35px', height: '35px' }}
																src={notification?.data?.data?.thumb}
															/>
														</span>
													</div>
												</div>
											</div>
										</TableCell>
									</TableRow>
								) : data?.data?.type?.toLowerCase() === 'event_addition' ? (
									<TableRow key={key}>
										<TableCell className="cursor-pointer notification-wrapper">
											<div className="flex" style={{ gap: '5px' }}>
												<div className="">
													<Avatar
														style={{ width: '35px', height: '35px' }}
														src={data?.thumb || 'assets/images/events.svg'}
													/>
												</div>
												<div className="flex flex-col" style={{ flexGrow: 1 }}>
													<span
														style={{ fontSize: '14px', marginBottom: '4px' }}
														className="font-bold"
													>
														{data?.title}
													</span>
													<span style={{ fontSize: '12px' }}>
														<span>{data?.body}</span>{' '}
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
								) : data?.data?.type?.toLowerCase() === 'room_addition' ? (
									<TableRow key={key}>
										<TableCell className="cursor-pointer notification-wrapper">
											<div className="flex" style={{ gap: '5px' }}>
												<div className="">
													<Avatar
														style={{ width: '35px', height: '35px' }}
														src={data?.thumb || 'assets/images/rooms.svg'}
													/>
												</div>
												<div className="flex flex-col" style={{ flexGrow: 1 }}>
													<span
														style={{ fontSize: '14px', marginBottom: '4px' }}
														className="font-bold"
													>
														{data?.title}
													</span>
													<span style={{ fontSize: '12px' }}>
														<span>{data?.body}</span>{' '}
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
													<div style={{ marginBottom: '15px' }}>
														<span className="notification-type-icon">
															<Avatar
																style={{ width: '35px', height: '35px' }}
																src={notification?.data?.data?.thumb}
															/>
														</span>
													</div>
												</div>
											</div>
										</TableCell>
									</TableRow>
								) : data?.data?.type?.toLowerCase() === 'staff_addition' ? (
									<TableRow key={key}>
										<TableCell className="cursor-pointer notification-wrapper">
											<div className="flex" style={{ gap: '5px' }}>
												<div className="">
													<Avatar
														style={{ width: '35px', height: '35px' }}
														src={data?.thumb || 'assets/images/staffs.svg'}
													/>
												</div>
												<div className="flex flex-col" style={{ flexGrow: 1 }}>
													<span
														style={{ fontSize: '14px', marginBottom: '4px' }}
														className="font-bold"
													>
														{data?.title}
													</span>
													<span style={{ fontSize: '12px' }}>
														<span>{data?.body}</span>{' '}
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
													<div style={{ marginBottom: '15px' }}>
														<span className="notification-type-icon">
															<Avatar
																style={{ width: '35px', height: '35px' }}
																src={notification?.data?.data?.thumb}
															/>
														</span>
													</div>
												</div>
											</div>
										</TableCell>
									</TableRow>
								) : (
									<TableRow key={key}>
										<TableCell className="cursor-pointer notification-wrapper">
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
													<span style={{ fontSize: '14px' }} className="font-bold">
														{data?.title}
													</span>
													<span style={{ fontSize: '12px' }}>
														<span className="break-word">{data?.body}</span>{' '}
													</span>
												</div>
												<div className="flex flex-col items-end" style={{ flexShrink: 0 }}>
													<span style={{ fontSize: '10px', marginTop: '4px' }}>
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
								<div className="p-16 text-center">No notifications available</div>
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
		</>
	);
};

export default Notifications;
