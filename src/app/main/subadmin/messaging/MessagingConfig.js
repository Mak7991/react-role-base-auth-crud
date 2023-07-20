import React from 'react';
import authRoles from '../../../auth/authRoles';
import Messaging from './Messaging';

import MessagingThread from './messaging/messagingThread';
import  messagingListing from './messaging/messagingListing';


const MessagingConfig = {
	settings: {
		layout: {
			config: {}
		}
	},
	routes: [
		{
			path: '/messaging',
			component: Messaging
		},
		{
			path: '/messagingListing',
			component: messagingListing
		},
		{
			path: '/messaging-chat',
			component: MessagingThread
		}
	],
	auth: authRoles.subadmin
};

export default MessagingConfig;
