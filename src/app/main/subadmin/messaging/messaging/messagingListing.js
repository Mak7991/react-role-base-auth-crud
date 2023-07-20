/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
import React, { useState, useEffect } from 'react';
import {
	makeStyles,
	IconButton,
	MenuItem,
	FormControl,
	InputLabel,
	Select,
	TextField,
	InputAdornment,
	TableContainer,
	Paper,
	Table,
	TableHead,
	TableBody,
	TableRow,
	TableCell,
	Avatar,
	CircularProgress,
} from '@material-ui/core';
import { getConversations } from 'app/services/messages/messages';
import { getAllRooms } from 'app/services/rooms/rooms';
import { Close } from '@material-ui/icons';
import moment from 'moment';
import CustomButton from 'app/customComponents/CustomButton/CustomButton';
import history from '@history';
import { useDispatch, useSelector } from 'react-redux';
import * as Actions from 'app/store/actions';
import { getMessaging, onMessage } from 'firebase/messaging';
import withReducer from 'app/store/withReducer';
import InfiniteScroll from 'react-infinite-scroll-component';
import PhotoIcon from '@material-ui/icons/Photo';
import { generateAgeString, app } from 'utils/utils';
import * as ChatActions from './ChatThread/store/actions';
import reducer from './ChatThread/store/reducers';
import DeleteChatConfirm from './DeleteChatConfirm';
import clsx from 'clsx';

const useStyles = makeStyles((theme) => ({
	select: {
		'&:before': {
			borderBottom: 'none',
		},
		'&:after': {
			borderBottom: 'none',
		},
		'&:not(.Mui-disabled):hover::before': {
			borderBottom: 'none',
		},
		'& .MuiSelect-select:focus': {
			backgroundColor: 'inherit',
		},
		'& .MuiSvgIcon-root': {
			color: 'inherit',
		},
		color: 'inherit',
		'&:hover': {
			color: 'inherit',
		},
	},
	unreadBadge: {
		background: theme.palette.background.blue,
		color: theme.palette.secondary.contrastText,
	},
}));

function MessagingListing({ setActiveTab }) {
	const dispatch = useDispatch();
	const conversations = useSelector(({ chatApp }) => chatApp.contacts.entities);
	const contacts = useSelector(({ chatApp }) => chatApp.contacts.entities);
	const selectedContactId = useSelector(({ chatApp }) => chatApp.contacts.selectedContactId);
	const [rooms, setRooms] = useState([]);
	const classes = useStyles();
	const [filters, setFilters] = useState({ student_name: '', student_status: '', room_id: '' });
	const [isLoading, setIsLoading] = useState(false);
	const [firstLoad, setFirstLoad] = useState(true);
	const [refresh, setRefresh] = useState(false);
	const [fetchingMore, setFetchingMore] = useState(false);
	const [hasMore, setHasMore] = useState(false);
	const [page, setPage] = useState(1);
	const [selectedContact, setSelectedContact] = useState(null);

	const handleFilters = (ev) => {
		const { name, value } = ev.target;
		setFilters({ ...filters, [name]: value });
	};

	useEffect(() => {
		setSelectedContact(contacts?.filter((contact) => contact.id === selectedContactId)[0]);
	}, [selectedContactId, contacts]);

	const openChat = (id) => {
		dispatch(ChatActions.setselectedContactId(id));
		const selectedConversation = conversations.filter((contact) => contact.id === id)[0];
		const temp = conversations.map((conversation) => {
			if (conversation.id === selectedConversation.id) {
				conversation.messages_unread_count = 0;
			}
			return conversation;
		});
		dispatch(ChatActions.updateContacts(temp));
		history.push({
			pathname: '/messaging-chat',
		});
	};

	const messaging = getMessaging(app);

	const handleBackgroundChatMessage = (payload) => {
		if (document.visibilityState === 'hidden' && payload.data.click_action === 'chat_push_notification') {
			const { data } = payload.data;
			let { message_data: messageData } = data;
			messageData = JSON.parse(messageData);
			const newContact = {
				created_at: messageData.created_at,
				id: messageData.conversation_id,
				messages_unread_count: data.unread_count,
				meta: messageData.meta,
				student_id: Number(data.student_id),
				student: {
					photo: data.student_photo,
					first_name: data.student_name?.split(' ')[0],
					last_name: data.student_name?.split(' ')[1],
					student_id: Number(data.student_id),
					age: data.student_age,
					date_of_birth: data.student_dob,
				},
				school: {},
				last_message: {
					attachement: messageData?.attachement,
					conversation_id: messageData?.conversation_id,
					message: messageData?.message,
					message_type: messageData?.message_type,
					message_from_role: messageData?.message_from_role,
					meta: messageData?.meta,
				},
			};
			dispatch(ChatActions.insertContact(newContact));
		}
	};

	useEffect(() => {
		navigator.serviceWorker.addEventListener('message', handleBackgroundChatMessage);
		return () => {
			navigator.serviceWorker.removeEventListener('message', handleBackgroundChatMessage);
		};
	}, []);

	onMessage(messaging, (payload) => {
		if (payload?.data?.click_action === 'chat_push_notification') {
			const { data } = payload;
			if (data.conversation_id == selectedContactId) {
				dispatch(ChatActions.receiveMessage(JSON.parse(data.message_data), data.student_id));
			}
			let { message_data: messageData } = data;
			messageData = JSON.parse(messageData);
			const newContact = {
				created_at: messageData.created_at,
				id: messageData.conversation_id,
				messages_unread_count: data.unread_count,
				student_id: Number(data.student_id),
				meta: messageData.meta,
				student: {
					age: data.student_age,
					photo: data.student_photo,
					first_name: data.student_name?.split(' ')[0],
					last_name: data.student_name?.split(' ')[1],
					student_id: Number(data.student_id),
					date_of_birth: data.student_dob,
				},
				school: {},
				last_message: {
					attachement: messageData.attachment,
					conversation_id: messageData.conversation_id,
					message: messageData.message,
					message_type: messageData.message_type,
					message_from_role: messageData.message_from_role,
					meta: messageData.meta,
				},
			};
			const temp = [newContact];
			temp.push(...contacts.filter((contact) => contact.id !== messageData.conversation_id));
			dispatch(ChatActions.updateContacts(temp));
		}
	});

	useEffect(() => {
		getAllRooms().then((res) => setRooms(res.data));
	}, []);

	useEffect(() => {
		const timeout = setTimeout(
			() => {
				setIsLoading(true);
				getConversations(filters.student_name, filters.student_status, filters.room_id, 1)
					.then((res) => {
						setFirstLoad(false);
						dispatch(ChatActions.setContacts(res.data));
						dispatch(ChatActions.removeChat());
						setHasMore(res.data.to < res.data.total);
						setPage(res.data.current_page + 1);
					})
					.catch((err) => {
						dispatch(
							Actions.showMessage({
								message: 'Failed to fetch data, please refresh',
								variant: 'error',
							})
						);
					})
					.finally(() => {
						setIsLoading(false);
					});
			},
			firstLoad ? 0 : 1000
		);
		return () => {
			clearTimeout(timeout);
		};
		// eslint-disable-next-line
	}, [refresh, filters]);

	const handleLoadMore = () => {
		if (!isLoading) {
			setFetchingMore(true);
			getConversations(filters.student_name, filters.student_status, filters.room_id, page)
				.then((res) => {
					if (res.data.last_page > res.data.current_page) {
						setHasMore(true);
					} else {
						setHasMore(false);
					}
					setPage(res.data.current_page + 1);
					dispatch(ChatActions.updateContacts(conversations.concat(res.data.data)));
					dispatch(ChatActions.removeChat());
					setFetchingMore(false);
				})
				.catch((err) => {
					setFetchingMore(false);
					dispatch(
						Actions.showMessage({
							message: 'Failed to fetch data, please refresh',
							variant: 'error',
						})
					);
				});
		}
	};

	const deleteConversation = (message, key) => {
		dispatch(
			Actions.openDialog({
				children: <DeleteChatConfirm setRefresh={setRefresh} index={key} msgId={message.id} />,
			})
		);
	};

	return (
		<>
			<div className="announcement-container">
				<div>
					<div className="flex justify-end items-end mt-20" style={{ gap: '5px' }}>
						<div>
							<TextField
								name="student_name"
								id="search"
								label="Search By Name"
								value={filters.student_name}
								onChange={handleFilters}
								InputProps={{
									endAdornment: (
										<InputAdornment>
											<IconButton
												onClick={() => {
													document.getElementById('search').focus();
												}}
											>
												<img
													alt="search-icon"
													src="assets/images/search-icon.svg"
													height="80%"
													width="80%"
												/>
											</IconButton>
										</InputAdornment>
									),
								}}
							/>
						</div>
						<div>
							<FormControl>
								<InputLabel id="roomLabel">Select Room</InputLabel>
								<Select
									name="room_id"
									onChange={handleFilters}
									value={filters.room_id}
									labelId="roomLabel"
									id="room_id"
									label="Room"
									style={{ width: 150 }}
									endAdornment={
										filters.room_id ? (
											<IconButton size="small" className="mr-16">
												<Close
													onClick={() =>
														setFilters({
															...filters,
															room_id: '',
														})
													}
													fontSize="small"
												/>
											</IconButton>
										) : (
											''
										)
									}
								>
									<MenuItem className={`${!filters.room_id && 'hidden'}`} value={0}>
										Clear filter
									</MenuItem>
									{rooms.length ? (
										rooms.map((room) => {
											return (
												<MenuItem key={room.id} value={room.id}>
													{room.name}
												</MenuItem>
											);
										})
									) : (
										<MenuItem disabled>Loading...</MenuItem>
									)}
								</Select>
							</FormControl>
						</div>
						<div>
							<FormControl>
								<InputLabel id="roomLabel">Student's Status</InputLabel>
								<Select
									name="student_status"
									labelId="student_status"
									id="student_status"
									label="student_status"
									value={filters.student_status}
									onChange={handleFilters}
									style={{ width: 150 }}
									endAdornment={
										filters.student_status ? (
											<IconButton size="small" className="mr-16">
												<Close
													onClick={() =>
														setFilters({
															...filters,
															student_status: '',
														})
													}
													fontSize="small"
												/>
											</IconButton>
										) : (
											''
										)
									}
								>
									<MenuItem value="1">Active</MenuItem>
									<MenuItem value="0">Inactive</MenuItem>
								</Select>
							</FormControl>
						</div>
						<div
							style={{
								alignSelf: 'center',
								marginTop: 20,
							}}
						>
							<CustomButton variant="primary" height="40" width="165px" fontSize="14px" padding="2px">
								<Select
									className={classes.select}
									inputProps={{
										classes: {
											root: classes.root,
											icon: classes.icon,
										},
									}}
									name="isNew"
									defaultValue="New Message"
									id="isNew"
									onChange={(e) => setActiveTab(e.target.value)}
								>
									<MenuItem className="hidden" value="New Message" disabled>
										New Message
									</MenuItem>
									<MenuItem value={1}>Individual</MenuItem>
									<MenuItem value={2}>Entire Room</MenuItem>
								</Select>
							</CustomButton>
						</div>
					</div>
					<TableContainer
						id="Scrollable-table"
						component={Paper}
						className="parent-announcement-table-cont mt-10"
					>
						<Table stickyHeader style={{ width: '100%' }}>
							<TableHead>
								<TableRow>
									<TableCell
										className="bg-white parent-announcement-table-header"
										style={{ width: '20%' }}
									>
										Student
									</TableCell>
									<TableCell
										className="bg-white parent-announcement-table-header"
										style={{ width: '50%' }}
									>
										Message
									</TableCell>
									<TableCell
										className="bg-white parent-announcement-table-header"
										style={{ width: '15%' }}
									>
										Date
									</TableCell>
									<TableCell
										className="bg-white parent-announcement-table-header"
										style={{ width: '15%' }}
									>
										Actions
									</TableCell>
								</TableRow>
							</TableHead>
							<TableBody>
								{isLoading ? (
									<TableRow>
										<TableCell align="center" colSpan={8}>
											<CircularProgress size={35} />
										</TableCell>
									</TableRow>
								) : !conversations?.length && !firstLoad ? (
									<TableRow>
										<TableCell align="center" colSpan={8}>
											No Messages
										</TableCell>
									</TableRow>
								) : (
									conversations?.map((message, key) => {
										return (
											<TableRow className="cursor-pointer" key={key}>
												<TableCell
													style={{ width: '30%' }}
													onClick={() => openChat(message.id)}
												>
													<div
														className="flex flex-row items-center justify-left"
														style={{ gap: '10px' }}
													>
														<div className='relative'>
															<Avatar
																src={message?.student?.photo}
																alt={
																	message?.student?.first_name +
																	message?.student?.last_name
																}
															/>
															{message?.messages_unread_count > 0 && (
																<span
																	className="absolute"
																	style={{ top: 30, left: 30 }}
																>
																	<div
																		className={clsx(
																			classes.unreadBadge,
																			'flex items-center justify-center w-20 h-20 rounded-full text-12 text-white text-center font-bold'
																		)}
																	>
																		{message?.messages_unread_count}
																	</div>
																</span>
															)}
														</div>
														<div className="flex flex-col">
															<div className="flex">
																<div
																	className="student-name mr-8 truncate"
																	style={{ display: 'contents' }}
																>
																	{`${message?.student?.first_name} ${message?.student?.last_name}`}
																</div>
																{message?.messages_unread_count ? (
																	<img
																		src="assets/images/Group 81376.svg"
																		alt="unread msg"
																		style={{
																			marginLeft: '7px',
																			height: 'auto',
																			borderRadius: '100%',
																			marginTop: '2px',
																		}}
																	/>
																) : (
																	<></>
																)}
															</div>

															<div
																className="student-age-font truncate"
																style={{ fontWeight: '700', width: '90px' }}
															>
																{generateAgeString(message.student?.date_of_birth)}
															</div>
														</div>
													</div>
												</TableCell>
												<TableCell
													onClick={() => openChat(message.id)}
													style={{ width: '50%' }}
													className="last-chat-msg"
												>
													{message?.last_message?.message_type === 'text' ? (
														<div className="truncate">
															{message?.last_message?.message
																? message?.last_message?.message
																: message?.message}
														</div>
													) : message?.last_message?.meta?.extension === 'png' ||
													  message?.last_message?.meta?.extension === 'jpg' ||
													  message?.last_message?.meta?.extension === 'jpeg' ||
													  message?.last_message?.meta?.extension === 'svg' ? (
														<div className="flex items-center">
															<span className="truncate">
																{message.last_message.message ||
																	'Parent sent an attachment'}
															</span>
															<PhotoIcon
																style={{
																	color: '#36cee5',
																	width: '30px',
																	height: '30px',
																	marginLeft: 10,
																}}
															/>
														</div>
													) : message?.last_message?.meta?.fileExtension === 'png' ||
													  message?.last_message?.meta?.fileExtension === 'jpg' ||
													  message?.last_message?.meta?.fileExtension === 'jpeg' ||
													  message?.last_message?.meta?.fileExtension === 'svg' ? (
														<div className="flex items-center">
															<span className="truncate">
																{message.last_message.message ||
																	'Parent sent an attachment'}
															</span>
															<PhotoIcon
																style={{
																	color: '#36cee5',
																	width: '30px',
																	height: '30px',
																	marginLeft: 10,
																}}
															/>
														</div>
													) : message?.last_message?.meta?.extension === 'pdf' ||
													  message?.last_message?.meta?.fileExtension === 'pdf' ? (
														<div className="flex items-center">
															<span className="truncate">
																{message.last_message.message ||
																	'Parent sent an attachment'}
															</span>
															<img
																src="assets/images/pdf_thumbnail.png"
																style={{
																	width: '30px',
																	height: '30px',
																	marginLeft: 10,
																}}
															/>
														</div>
													) : (
														<div className="flex">
															<span className="truncate items-center">
																{message.last_message.message ||
																	'Parent sent an attachment'}
															</span>
															<PhotoIcon
																style={{
																	color: '#36cee5',
																	width: '30px',
																	height: '30px',
																	marginLeft: 10,
																}}
															/>
														</div>
													)}
												</TableCell>

												<TableCell
													onClick={() => openChat(message.id)}
													style={{ width: '15%' }}
												>
													<div style={{ fontSize: '12px', fontWeight: '600', color: '#000' }}>
														{moment.utc(message.updated_at).local().format('L')}
													</div>
													<div className="parent-announcement-age">
														{moment.utc(message.updated_at).local().format('LT')}
													</div>
												</TableCell>
												<TableCell style={{ width: '15%' }}>
													<IconButton
														size="small"
														id={`delete-convo-${message.id}`}
														onClick={() => deleteConversation(message, key)}
													>
														<img src="assets/images/dlt.png" alt="delete" width="25px" />
													</IconButton>
												</TableCell>
											</TableRow>
										);
									})
								)}
								{fetchingMore ? (
									<TableRow>
										<TableCell align="center" colSpan={8}>
											<CircularProgress size={35} />
										</TableCell>
									</TableRow>
								) : (
									<></>
								)}
							</TableBody>
						</Table>
					</TableContainer>
					{hasMore && (
						<InfiniteScroll
							dataLength={conversations?.length}
							next={handleLoadMore}
							hasMore={hasMore}
							scrollableTarget="Scrollable-table"
						/>
					)}
				</div>
			</div>
		</>
	);
}

export default withReducer('chatApp', reducer)(MessagingListing);
