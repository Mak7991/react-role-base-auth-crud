import AppBar from '@material-ui/core/AppBar';
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import Drawer from '@material-ui/core/Drawer';
import Hidden from '@material-ui/core/Hidden';
import Icon from '@material-ui/core/Icon';
import IconButton from '@material-ui/core/IconButton';
import Paper from '@material-ui/core/Paper';
import { makeStyles } from '@material-ui/core/styles';
import { alpha } from '@material-ui/core/styles/colorManipulator';
import Typography from '@material-ui/core/Typography';
import withReducer from 'app/store/withReducer';
import clsx from 'clsx';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { app } from 'utils/utils';
import { getMessaging, onMessage } from 'firebase/messaging';
import Chat from './Chat';
import ChatsSidebar from './ChatsSidebar';
import * as Actions from './store/actions';
import reducer from './store/reducers';
import './chat.css';

const messaging = getMessaging(app);

const drawerWidth = 300;

const useStyles = makeStyles(theme => ({
	contentCardWrapper: {
		position: 'relative',
		padding: 24,
		marginBottom: 30,
		maxWidth: 1400,
		display: 'flex',
		flexDirection: 'column',
		background: 'transparent',
		width: '100%',
		minWidth: '0',
		maxHeight: '75vh',
		minHeight: '75vh',
		margin: '0 auto',
		[theme.breakpoints.down('sm')]: {
			padding: 16
		},
		[theme.breakpoints.down('xs')]: {
			padding: 12
		}
	},
	contentCard: {
		display: 'flex',
		position: 'relative',
		columnGap: 20,
		maxHeight: '70vh',
		minHeight: '70vh',
		background: 'transparent',
		flexDirection: 'row',
		borderRadius: 8,
		overflow: 'hidden'
	},
	drawerPaper: {
		width: drawerWidth,
		maxWidth: '100%',
		overflow: 'hidden',
		height: '100%',
		borderRadius: 8,
		[theme.breakpoints.up('md')]: {
			position: 'relative'
		}
	},
	contentWrapper: {
		display: 'flex',
		flexDirection: 'column',
		flex: '1 1 100%',
		zIndex: 10,
		borderRadius: 8,
		background: `linear-gradient(to bottom, ${alpha(theme.palette.background.paper, 0.8)} 0,${alpha(
			theme.palette.background.paper,
			0.6
		)} 20%,${alpha(theme.palette.background.paper, 0.8)})`
	},
	content: {
		display: 'flex',
		flex: '1 1 100%',
		minHeight: 0
	}
}));

function ChatApp(props) {
	const dispatch = useDispatch();
	const chat = useSelector(({ chatApp }) => chatApp.chat.data);
	const contacts = useSelector(({ chatApp }) => chatApp.contacts.entities);
	const selectedContactId = useSelector(({ chatApp }) => chatApp.contacts.selectedContactId);
	const mobileChatsSidebarOpen = useSelector(({ chatApp }) => chatApp.sidebars.mobileChatsSidebarOpen);

	const [isContactsLoading, setIsContactsLoading] = useState(false);
	const [isChatLoading, setIsChatLoading] = useState(false);
	const [refresh, setRefresh] = useState(false);

	const handleBackgroundChatMessage = payload => {
		if (document.visibilityState === 'hidden' && payload.data.click_action === 'chat_push_notification') {
			// setRefresh(new Date().getMilliseconds());
			// dispatch(Actions.setselectedContactId(null));
			// dispatch(Actions.removeChat());
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
					student_id: Number(data.student_id)
				},
				school: {},
				last_message: {
					attachement: messageData.attachement,
					conversation_id: messageData.conversation_id,
					message: messageData.message,
					message_type: messageData.message_type,
					message_from_role: messageData.message_from_role,
					meta: messageData.meta
				}
			};
			dispatch(Actions.insertContact(newContact));
			dispatch(Actions.receiveMessage(JSON.parse(data.message_data), data.student_id));
		}
	};

	useEffect(() => {
		navigator.serviceWorker.addEventListener('message', handleBackgroundChatMessage);
		return () => {
			navigator.serviceWorker.removeEventListener('message', handleBackgroundChatMessage);
		};
	}, []);

	onMessage(messaging, payload => {
		if (payload?.data?.click_action === 'chat_push_notification') handleChatMessage(payload);
	});

	const handleChatMessage = payload => {
		const { data } = payload;
		dispatch(Actions.receiveMessage(JSON.parse(data.message_data), data.student_id));
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
				student_id: Number(data.student_id)
			},
			school: {},
			last_message: {
				attachement: messageData.attachement,
				conversation_id: messageData.conversation_id,
				message: messageData.message,
				message_type: messageData.message_type,
				message_from_role: messageData.message_from_role,
				meta: messageData.meta
			}
		};
		if (data.conversation_id == selectedContactId) {
			newContact.messages_unread_count = 0;
		}
		const temp = [newContact];
		temp.push(...contacts.filter(contact => contact.id != messageData.conversation_id));
		dispatch(Actions.updateContacts(temp));
	};

	const classes = useStyles(props);
	const selectedContact = contacts.find(_contact => _contact.id === selectedContactId);

	useEffect(() => {
		// dispatch(Actions.getUserData());
		if (contacts.length === 0) {
			dispatch(Actions.getContacts(setIsContactsLoading));
		}
	}, [dispatch, refresh]);

	return (
		<div className={clsx(classes.contentCardWrapper, 'container')}>
			<div className={classes.contentCard}>
				<Hidden mdUp>
					<Drawer
						className="h-full absolute z-20"
						variant="temporary"
						anchor="left"
						open={mobileChatsSidebarOpen}
						onClose={() => dispatch(Actions.closeMobileChatsSidebar())}
						classes={{
							paper: clsx(classes.drawerPaper, 'absolute ltr:left-0 rtl:right-0')
						}}
						style={{ position: 'absolute' }}
						ModalProps={{
							keepMounted: true,
							disablePortal: true,
							BackdropProps: {
								classes: {
									root: 'absolute'
								}
							}
						}}
					>
						<ChatsSidebar
							isContactsLoading={isContactsLoading}
							setIsContactsLoading={setIsContactsLoading}
							setIsChatLoading={setIsChatLoading}
						/>
					</Drawer>
				</Hidden>
				<Hidden smDown>
					<Drawer
						className="h-full z-20"
						variant="permanent"
						open
						classes={{
							paper: classes.drawerPaper
						}}
					>
						<ChatsSidebar
							isContactsLoading={isContactsLoading}
							setIsContactsLoading={setIsContactsLoading}
							setIsChatLoading={setIsChatLoading}
						/>
					</Drawer>
				</Hidden>
				<main className={clsx(classes.contentWrapper, 'z-10')}>
					{!chat && !isChatLoading ? (
						<div className="flex flex-col flex-1 items-center justify-center p-24">
							<Paper className="rounded-full p-48">
								<Icon className="block text-64" color="secondary">
									chat
								</Icon>
							</Paper>
							<Typography variant="h6" className="my-24">
								Chat App
							</Typography>
							<Typography className="hidden md:flex px-16 pb-24 mt-24 text-center" color="textSecondary">
								Select a chat to start a conversation!..
							</Typography>
							<Button
								variant="outlined"
								color="primary"
								className="flex md:hidden normal-case"
								onClick={() => dispatch(Actions.openMobileChatsSidebar())}
							>
								Select a contact to start a conversation!..
							</Button>
						</div>
					) : (
						<>
							<div className="py-12 bg-white opacity-">
								<IconButton
									color="inherit"
									aria-label="Open drawer"
									onClick={() => dispatch(Actions.openMobileChatsSidebar())}
									className="flex md:hidden"
								>
									<Icon>chat</Icon>
								</IconButton>
								<div className="flex items-center ">
									<div className="relative mx-8 ">
										{selectedContact ? (
											<Avatar
												src={selectedContact?.student.photo}
												alt={selectedContact?.student.first_name}
											>
												{!selectedContact?.student.photo ||
												selectedContact?.student.photo === ''
													? selectedContact?.student.first_name[0]
													: ''}
											</Avatar>
										) : (
											''
										)}
									</div>
									<Typography color="inherit" className="text-14 font-700 px-4">
										{selectedContact
											? `${selectedContact?.student.first_name} ${selectedContact?.student.last_name}`
											: ''}
									</Typography>
								</div>
							</div>
							<hr className="mx-auto opacity-50" style={{ width: '91%', color: 'lightgrey' }} />
							<div className={classes.content}>
								<Chat className="flex flex-1 z-10" isChatLoading={isChatLoading} />
							</div>
						</>
					)}
				</main>
			</div>
		</div>
	);
}

export default withReducer('chatApp', reducer)(ChatApp);
