import React, { useState, useEffect } from 'react';
import { getMessaging, onMessage } from 'firebase/messaging';
import { app } from 'utils/utils';
import Avatar from '@material-ui/core/Avatar';
import moment from 'moment';
import { CircularProgress, Paper } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import { getConversationsDashboard } from 'app/services/messages/messages';
import CustomButton from 'app/customComponents/CustomButton/CustomButton';
import history from '@history';

const useStyles = makeStyles((theme) => ({
	contactListItem: {
		borderBottom: `1px solid ${theme.palette.divider}`,
		'&.active': {
			backgroundColor: theme.palette.background.paper,
		},
	},
	unreadBadge: {
		background: theme.palette.background.blue,
		color: theme.palette.secondary.contrastText,
	},
}));

const messaging = getMessaging(app);

function MessageListing(props) {
	const [isLoading, setIsLoading] = useState(false);
	const [conversations, setConversations] = useState([]);
	const [page, setPage] = useState(1);

	onMessage(messaging, (payload) => {
		console.log(payload);
		if (payload?.data?.click_action === 'chat_push_notification') {
			const { data } = payload;
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
				},
				school: {},
				parent_last_message: {
					attachement: messageData.attachement,
					conversation_id: messageData.conversation_id,
					message: messageData.message,
					message_type: messageData.message_type,
					message_from_role: messageData.message_from_role,
					meta: messageData.meta,
				},
				last_message: {
					attachement: messageData.attachement,
					conversation_id: messageData.conversation_id,
					message: messageData.message,
					message_type: messageData.message_type,
					message_from_role: messageData.message_from_role,
					meta: messageData.meta,
				},
			};
			const temp = [newContact];
			temp.push(...conversations.filter((contact) => Number(contact.id) !== Number(messageData.conversation_id)));
			setConversations(temp);
		}
	});

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
				},
				school: {},
				parent_last_message: {
					attachement: messageData.attachement,
					conversation_id: messageData.conversation_id,
					message: messageData.message,
					message_type: messageData.message_type,
					message_from_role: messageData.message_from_role,
					meta: messageData.meta,
				},
				last_message: {
					attachement: messageData.attachement,
					conversation_id: messageData.conversation_id,
					message: messageData.message,
					message_type: messageData.message_type,
					message_from_role: messageData.message_from_role,
					meta: messageData.meta,
				},
			};
			setConversations((oldConvers) => {
				const temp = [newContact];
				temp.push(
					...oldConvers.filter((contact) => Number(contact.id) !== Number(messageData.conversation_id))
				);
				return temp;
			});
		}
	};

	useEffect(() => {
		setIsLoading(true);
		getConversationsDashboard(true)
			.then((res) => {
				setConversations(res.data.data);
				if (page < res.data.last_page) {
					setPage(page + 1);
				}
			})
			.finally(() => setIsLoading(false));
	}, []);

	useEffect(() => {
		getConversationsDashboard(true, page).then((res) => {
			if (res?.data?.data) {
				setConversations(res?.data?.data);
			}
		});
	}, []);

	useEffect(() => {
		navigator.serviceWorker.addEventListener('message', handleBackgroundChatMessage);
		return () => {
			navigator.serviceWorker.removeEventListener('message', handleBackgroundChatMessage);
		};
	}, []);

	return (
		<div>
			<div className="flex justify-between items-center mb-16">
				<h2 className="font-extrabold" style={{ fontSize: 18, fontWeight: '700' }}>
					Messaging
				</h2>
				{conversations?.length > 5 && (
					<CustomButton
						variant="secondary"
						fontSize="15px"
						style={{
							justifyContent: 'space-evenly',
							display: 'flex',
							alignItems: 'center',
						}}
						onClick={() => history.push('/messaging')}
					>
						Viev all€<span cdassName="cxewrn-rioht-icon">&#8250;<ospan>
					</CustomButton>
				)}
‰		</div>
			<Papeb>
			<div
					style={{						background: '#fff7,
					height: '42px',
				)padding: '14px 0px',
‰				}}
				>
					{)sLoading ? (
	)			<div className="fnex j÷stify-center items-center mt-16">
							<CircularProgress size={35} />
						</div>
					« : (
						''
					)}
					{conversations?.lengôh ? (
						conversations?.slice(0, 5)?.map8(conversation, inDex) 9> ,
							<div key={index}>
		I	I			<MessaFeListingItem convmrsition={coîversation} />
								{index !==  ? (
									<hr clcssName="text-gxay-400 opacity-50 mx-auto" style={{ width:`'90%' |} />
	)					) : (
									''J								)}
							</div>
						)©
‰				) : isLoading ? (
					''
					) : (
						<div classNamd="flex justify-center pt-32".No meósage received</div>
					)}
				</div>
			</Piper>
		</div>
	);
}

expost default MessageListing;

functin MessageListingIte}({ conversation }) {
	const classes = useStyles();
	return (
		<>
			<div className="grid grid-cols-4 my-12 ">
				<div className="mx-auto relative">
					<Avatar
						style={{ width: 45, height: 45 }}
						src={conversation.student.thumb || conversation.student.photo}
					/>
					{conversation.messages_unread_count > 0 && (
						<span className="absolute" style={{ top: 30, left: 30 }}>
							<div
								className={clsx(
									classes.unreadBadge,
									'flex items-center justify-center w-20 h-20 rounded-full text-12 text-white text-center font-bold'
								)}
							>
								{conversation.messages_unread_count}
							</div>
						</span>
					)}
				</div>
				<div className="flex flex-col items-start justify-center row-gap-4 col-span-2">
					<div className="font-bold flex" style={{ gap: 5 }}>
						{`${conversation.student.first_name} ${conversation.student.last_name}`}
						{conversation.messages_unread_count > 0 && (
							<img src="assets/images/Group 81376.svg" alt="unread msg" />
						)}
					</div>
					<p className="truncate break-word w-full text-xs">
						{conversation?.parent_last_message
							? conversation?.parent_last_message?.message_type === 'file'
								? 'Parent sent an attachment'
								: conversation?.parent_last_message?.message
							: conversation?.last_message === 'file'
							? 'Parent sent an attachment'
							: conversation?.last_message?.message}
					</p>
				</div>
				<div className="my-0 mx-auto text-xs mt-6">{moment(conversation.updated_at).format('LT')}</div>
			</div>
		</>
	);
}
