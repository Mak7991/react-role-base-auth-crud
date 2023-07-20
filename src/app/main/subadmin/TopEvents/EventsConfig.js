import React from 'react';
import authRoles from '../../../auth/authRoles';
import CreateEvents from './CreateEvents';
import UpdateEvents from './UpdateEvent';

const EventsConfig = {
	settings: {
		layout: {
			config: {}
		}
	},
	routes: [
		{
			path: '/calendar-addevent',
			component: CreateEvents
		},
		{
			path: '/calendar-updateevent/:id',
			component: UpdateEvents
		}
	],
	auth: authRoles.subadmin
};

export default EventsConfig;
