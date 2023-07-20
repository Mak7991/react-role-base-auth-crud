import Avatar from '@material-ui/core/Avatar';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import { makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import React from 'react';

const useStyles = makeStyles(theme => ({
	contactListItem: {
		borderBottom: `1px solid ${theme.palette.divider}`,
		'&.active': {
			backgroundColor: theme.palette.background.paper
		}
	},
	unreadBadge: {
		background: 'linear-gradient(90deg, rgba(96,120,244,1) 40%, rgba(78,156,237,1) 51%, rgba(57,200,231,1) 76%)',
		color: theme.palette.secondary.contrastText
	}
}));

function ContactListItem(props) {
	const classes = useStyles(props);

	return (
		<ListItem
			button
			className={clsx(classes.contactListItem, 'px-16 min-h-72', {
				active: props.selectedContactId === props.conversation.id
			})}
			onClick={() => props.onContactClick(props.conversation.id)}
		>
			<div className="relative">
				<Avatar src={props.conversation.student.photo} alt={props.conversation.student.first_name}>
					{props.conversation.student.photo || props.conversation.student.first_name[0] || ''}
				</Avatar>
			</div>

			<ListItemText
				classes={{
					root: 'min-w-px px-16',
					primary: 'font-bold',
					secondary: 'truncate'
				}}
				primary={`${props.conversation.student.first_name} ${props.conversation.student.last_name}`}
				secondary={
					props.conversation.last_message.message_type === 'text'
						? props.conversation.last_message.message
						: props.conversation.last_message.message_from_role === 'school'
						? 'Shared an attachment'
						: 'Parent sent an attachment'
				}
			/>
			{props.conversation.messages_unread_count > 0 ? (
				<div className="flex flex-col justify-center items-end">
					<div
						className={clsx(
							classes.unreadBadge,
							'flex items-center justify-center w-20 h-20 rounded-full text-12 text-white text-center font-bold'
						)}
					>
						{props.conversation.messages_unread_count}
					</div>
				</div>
			) : (
				''
			)}
		</ListItem>
	);
}

export default ContactListItem;
