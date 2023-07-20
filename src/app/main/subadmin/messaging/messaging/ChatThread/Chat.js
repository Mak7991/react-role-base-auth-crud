/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
import FuseScrollbars from '@fuse/core/FuseScrollbars';
import Avatar from '@material-ui/core/Avatar';
import Icon from '@material-ui/core/Icon';
import IconButton from '@material-ui/core/IconButton';
import Paper from '@material-ui/core/Paper';
import { makeStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import clsx from 'clsx';
import moment from 'moment/moment';
import React, { useEffect, useRef, useState } from 'react';
import SendIcon from '@material-ui/icons/Send';
import { useDispatch, useSelector } from 'react-redux';
import CircularProgress from '@material-ui/core/CircularProgress';
import InfiniteScroll from 'react-infinite-scroll-component';
import { app } from 'utils/utils';
import { getMessaging, onMessage } from 'firebase/messaging';
import axios from 'axios';
import { uploadFile } from 'app/services/imageUpload/imageUpload';
import * as DialogActions from 'app/store/actions/fuse/dialog.actions';
import * as MessageActions from 'app/store/actions/fuse/message.actions';
import * as Actions from './store/actions';
import './chat.css';
import { getImageUrl } from 'utils/utils';

const useStyles = makeStyles(theme => ({
	messageRow: {
		'&.contact': {
			'& .bubble': {
				background:
					'transparent linear-gradient(273deg, #3DB1FC 0%, #039DFD 100%) 0% 0% no-repeat padding-box;',
				color: theme.palette.primary.contrastText,
				borderTopLeftRadius: 7,
				borderBottomLeftRadius: 0,
				borderTopRightRadius: 7,
				borderBottomRightRadius: 7,
				maxWidth: 400,
				wordBreak: 'break-word',
				'& .time': {
					marginLeft: 12
				}
			},
			'& .attachment': {
				background: 'none',
				backgroundColor: 'transparent',
				'& .time': {
					marginTop: -19,
					padding: 4,
					borderRadius: '20%',
					cursor: 'pointer'
				}
			},
			'&.first-of-group': {
				'& .bubble': {
					// borderTopLeftRadius: 20
				}
			},
			'&.last-of-group': {
				'& .bubble': {
					// borderBottomLeftRadius: 20
				}
			}
		},
		'&.me': {
			paddingLeft: 40,

			'& .avatar': {
				order: 2
			},
			'& .bubble': {
				marginLeft: 'auto',
				background: theme.palette.grey[200],
				color: theme.palette.getContrastText(theme.palette.grey[300]),
				borderTopLeftRadius: 7,
				borderBottomLeftRadius: 7,
				borderTopRightRadius: 7,
				borderBottomRightRadius: 0,
				maxWidth: 400,
				wordBreak: 'break-word',
				'& .time': {
					right: 0
				}
			},
			'& .attachment': {
				background: 'none',
				backgroundColor: 'transparent',
				'& .time': {
					marginTop: -19,
					marginRight: 0,
					padding: 4,
					borderRadius: '20%'
				}
			},
			'&.first-of-group': {
				'& .bubble': {
					// borderTopRightRadius: 20
				}
			},

			'&.last-of-group': {
				'& .bubble': {
					// borderBottomRightRadius: 20
				}
			}
		},
		'&.first-of-group': {
			'& .bubble': {
				// borderTopLeftRadius: 20,
				paddingTop: 13
			}
		},
		'&.last-of-group': {
			'& .bubble': {
				// borderBottomLeftRadius: 20,
				paddingBottom: 13,
				'& .time': {
					display: 'flex'
				}
			}
		}
	}
}));

const messaging = getMessaging(app);

function Chat(props) {
	const dispatch = useDispatch();
	const contacts = useSelector(({ chatApp }) => chatApp.contacts.entities);
	const selectedContactId = useSelector(({ chatApp }) => chatApp.contacts.selectedContactId);
	const chat = useSelector(({ chatApp }) => chatApp.chat.data);
	const currentChatState = useSelector(({ chatApp }) => chatApp.chat);

	const classes = useStyles(props);
	const chatRef = useRef(null);
	const [messageText, setMessageText] = useState('');
	const [selectedContact, setSelectedContact] = useState(null);
	const [fileSending, setFileSending] = useState(false);
	const ref = useRef(null);

	useEffect(() => {
		setSelectedContact(contacts.filter(contact => contact.id === selectedContactId)[0]);
	}, [selectedContactId, contacts]);

	useEffect(() => {
		if (chat) {
			scrollToBottom();
		}
	}, [chat]);

	function scrollToBottom() {
		if (chatRef?.current) {
			chatRef.current.scrollTop = chatRef.current.scrollHeight;
		}
	}

	function shouldShowContactAvatar(item, i) {
		return (chat[i - 1] && chat[i - 1].message_from_role !== item.message_from_role) || !chat[i - 1];
	}

	function isFirstMessageOfGroup(item, i) {
		return i === 0 || (chat[i - 1] && chat[i - 1].message_from_role !== item.message_from_role);
	}

	function isLastMessageOfGroup(item, i) {
		return i === chat.length - 1 || (chat[i + 1] && chat[i + 1].message_from_role !== item.message_from_role);
	}

	function onInputChange(ev) {
		if (ev.target.value.length <= 1000) {
			setMessageText(ev.target.value);
		}
	}

	function onMessageSubmit(ev) {
		ev.preventDefault();
		if (messageText === '') {
			return;
		}

		dispatch(Actions.sendMessage(messageText, selectedContact.student_id));
		setMessageText('');
	}

	const fetchMore = () => {
		dispatch(Actions.getChatPage(currentChatState));
	};

	const downloadPDF = url => {
		axios.get(url, { responseType: 'blob', headers: { Authorization: '' } }).then(res => {
			const src = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
			const link = document.createElement('a');
			link.setAttribute('target', '_blank');
			link.href = src;
			// link.setAttribute('download', `download.pdf`);
			document.body.appendChild(link);
			link.click();
			// Clean up and remove the link
			link.parentNode.removeChild(link);
		});
	};

	const openImage = url => {
		dispatch(
			DialogActions.openDialog({
				children: (
					<>
						<div className="bg-white">
							<img src={url} alt="" />
						</div>
					</>
				)
			})
		);
	};

	const shouldShowDate = (item, index) => {
		const msgDate = moment(item.created_at);
		const prevDate = moment(chat[index + 1]?.created_at);
		if (index === chat.length - 1) {
			return true;
		}
		if (msgDate.isSame(prevDate, 'day')) {
			return false;
		}
		return true;
	};

	const handleFileInput = e => {
		const file = e.target.files[0];
		if (
			file.name.split('.')[1] === 'pdf' ||
			file.name.split('.')[1] === 'jpg' ||
			file.name.split('.')[1] === 'jpeg' ||
			file.name.split('.')[1] === 'png'
		) {
			if (file.size > 2000000) {
				dispatch(
					MessageActions.showMessage({ message: 'File size must be less than 2 MB.', variant: 'error' })
				);
			} else {
				setFileSending(true);

				const data = {
					type: 'file',
					student_id: [selectedContact.student_id]
				};
				if (file.type === 'image/jpeg' || file.type === 'image/jpg' || file.type === 'image/png') {
					const _URL = window.URL || window.webkitURL;
					const img = new Image();
					const objectUrl = _URL.createObjectURL(file);
					img.onload = () => {
						data.meta = {
							name: file.name,
							height: img.height,
							width: img.width,
							fileExtension: file.name.split('.')[file.name.split('.').length - 1]
						};
						_URL.revokeObjectURL(objectUrl);
					};
					img.src = objectUrl;
				} else {
					data.meta = {
						name: file.name,
						fileExtension: file.name.split('.')[file.name.split('.').length - 1]
					};
				}
				const filename = getImageUrl(file)
				uploadFile(file, filename).then(fileUrl => {
					data.attachment = `${process.env.REACT_APP_S3_BASE_URL}${fileUrl}`;
					const request = axios.post('/api/v1/conversations', data);
					request.then(res => {
						setFileSending(false);
						dispatch(Actions.sendFile(res));
					});
				});
			}
		} else {
			dispatch(MessageActions.showMessage({ message: 'Only image or PDF is allowed.', variant: 'error' }));
		}
	};

	return (
		<div className={clsx('flex flex-col relative ', props.className)}>
			<FuseScrollbars ref={chatRef} className="flex flex-1 flex-col overflow-y-auto bg-white tt">
				{chat && chat.length > 0 && !props.isChatLoading ? (
					<div
						id="chatScrollableDiv"
						style={{
							height: 1000,
							overflow: 'auto',
							display: 'flex',
							flexDirection: 'column-reverse'
						}}
					>
						{fileSending ? (
							<div className="flex justify-end items-end" style={{ paddingRight: 24, gap: 30 }}>
								<div className="relative">
									<CircularProgress className="absolute" style={{ top: 32, left: 19 }} size={30} />
									<img
										src="assets/images/file-icon.png"
										style={{ maxWidth: 66, marginRight: 36 }}
										alt="File Thumbnail"
									/>
								</div>
								<Avatar
									className="avatar"
									src="assets/images/logos/ladybird-single-alphabet-logo.png"
								/>
							</div>
						) : (
							''
						)}
						<InfiniteScroll
							dataLength={chat.length}
							next={fetchMore}
							inverse
							ref={chatRef}
							className="flex flex-col-reverse pt-16 px-16 ltr:pl-56 ltr:pr-56 rtl:pr-56 rtl:pl-56"
							hasMore={currentChatState.current_page < currentChatState.last_page}
							loader={<CircularProgress className="mx-auto" size={30} />}
							scrollableTarget="chatScrollableDiv"
						>
							{chat.map((item, i) => {
								const contact = item.message_from_role === 'school' ? 'school' : 'student';
								return (
									<>
										<div
											key={item.id}
											className={clsx(
												classes.messageRow,
												'flex flex-col z-0 flex-grow-0 flex-shrink-0 items-start justify-end relative px-16 py-8',
												{ me: contact === 'school' },
												{ contact: contact === 'student' },
												{ 'last-of-group': isFirstMessageOfGroup(item, i) },
												{ 'first-of-group': isLastMessageOfGroup(item, i) }
											)}
										>
											{contact === 'student' && (
												<Avatar
													style={{ bottom: 13 }}
													className="avatar z-10 absolute ltr:left-0 rtl:right-0 m-0 -mx-32"
													src={selectedContact?.student.photo}
												/>
											)}
											{item?.message_type !== 'file' ? (
												<div
													className={`bubble flex relative items-end justify-between p-12 max-w-full z-0 														${
														contact === 'student'
															? 'chat-bubble-before'
															: 'chat-bubble-after'
													}`}
												>
													<div className="leading-tight whitespace-pre-wrap flex-grow-1">
														{item.message}
													</div>
													<div className="time flex-shrink-1 text-xxs -mb-8 ltr:left-0 rtl:right-0 bottom-0 whitespace-no-wrap">
														{moment(item.created_at).format('h:mm a')}
													</div>
												</div>
											) : item?.message_type === 'file' && !item?.message ? (
												<div
													style={{ minHeight: 50 }}
													className="bubble attachment flex flex-col relative items-end justify-between p-12 pb-6 max-w-full cursor-pointer"
												>
													{item?.meta?.extension === 'pdf' ||
													item?.meta?.fileExtension === 'pdf' ? (
														<div
															onClick={() => downloadPDF(item.attachment)}
															className="relative inline-block"
														>
															<img
																alt={item?.meta?.name}
																src="assets/images/pdf_thumbnail.png"
																className="block"
																style={{
																	width: '80px',
																	height: '80px',
																	marginRight: 40,
																	marginBottom: 5
																}}
															/>
														</div>
													) : (
														<div
															onClick={() => openImage(item.attachment)}
															className="relative inline-block img-chat-gradient"
														>
															<img
																alt={item?.meta?.name}
																src={item?.attachment}
																className="block"
																style={{ maxWidth: '160px' }}
															/>
														</div>
													)}
													<div
														className={`time ${
															item.meta.fileExtension === 'pdf' ||
															item.meta.extension === 'pdf'
																? 'text-black'
																: 'text-white'
														} flex-shrink-1 text-xxs bottom-0 z-10 whitespace-no-wrap`}
													>
														{moment(item.created_at).format('h:mm a')}
													</div>
												</div>
											) : (
												<div
													className={`bubble flex relative items-end justify-between p-12 max-w-full z-0 ${
														contact === 'student'
															? 'chat-bubble-before'
															: 'chat-bubble-after'
													}`}
												>
													<div
														className="leading-tight whitespace-pre-wrap flex flex-col"
														style={{ gap: 10 }}
													>
														{item?.meta?.extension === 'pdf' ||
														item?.meta?.fileExtension === 'pdf' ? (
															<img
																alt={item?.meta?.name}
																onClick={() => downloadPDF(item.attachment)}
																className="cursor-pointer self-center"
																src="assets/images/pdf_thumbnail.png"
																style={{ width: '80px', height: '80px' }}
															/>
														) : (
															<img
																onClick={() => openImage(item.attachment)}
																className="cursor-pointer self-center"
																alt={item?.meta?.name}
																src={item?.attachment}
																style={{ maxWidth: '160px' }}
															/>
														)}
														<div className="flex justify-between">
															{item.message}
															<div className="time self-end flex-shrink-1 text-xxs -mb-6 ml-12 ltr:left-0 rtl:right-0 bottom-0 whitespace-no-wrap">
																{moment(item.created_at).format('h:mm a')}
															</div>
														</div>
													</div>
												</div>
											)}
											{contact === 'school' && (
												<Avatar
													style={{ bottom: 13 }}
													className="avatar absolute  ltr:right-0 rtl:left-0 m-0 -mx-32"
													src="assets/images/logos/ladybird-single-alphabet-logo.png"
												/>
											)}
										</div>
										{shouldShowDate(item, i) ? (
											<div className="mx-auto my-24">{moment(item.created_at).format('ll')}</div>
										) : (
											''
										)}
									</>
								);
							})}
						</InfiniteScroll>
					</div>
				) : !props.isChatLoading ? (
					<div className="flex flex-col flex-1">
						<div className="flex flex-col flex-1 items-center justify-center">
							<Icon className="text-128" color="disabled">
								chat
							</Icon>
						</div>
						<Typography className="px-16 pb-24 text-center" color="textSecondary">
							Start a conversation by typing your message below.
						</Typography>
					</div>
				) : (
					<div className="flex flex-col flex-1 justify-center items-center">
						<CircularProgress size={30} />
					</div>
				)}
			</FuseScrollbars>
			{chat && (
				<form onSubmit={onMessageSubmit} className="p-8 white-back">
					<div className="flex items-center">
						<div>
							<IconButton type="button" onClick={() => ref.current.click()}>
								<Icon className="text-24 transform rotate-45" color="action" ref={ref}>
									attach_file
								</Icon>
							</IconButton>
							<input
								type="file"
								onChange={handleFileInput}
								hidden
								ref={ref}
								accept=".jpg, .png, .jpeg, .pdf"
							/>
						</div>

						<div className="" style={{ flexGrow: 1 }}>
							<div className="rounded-24 blue-back">
								<TextField
									autoFocus={false}
									id="message-input"
									className="flex-1 w-full"
									InputProps={{
										disableUnderline: true,
										classes: {
											root: 'flex flex-grow flex-shrink-0 mx-16 my-8',
											input: ''
										},
										placeholder: 'Type your message'
									}}
									InputLabelProps={{
										shrink: false,
										className: classes.bootstrapFormLabel
									}}
									onChange={onInputChange}
									value={messageText}
								/>
							</div>
						</div>
						<div>
							<IconButton type="submit">
								<SendIcon className="text-24" htmlColor="#059EFD" />
							</IconButton>
						</div>
					</div>
				</form>
			)}
		</div>
	);
}

export default Chat;
