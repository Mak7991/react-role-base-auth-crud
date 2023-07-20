import React from 'react';
import authRoles from '../../../auth/authRoles';
import CalendarView from './CalendarView';

const CalendarConfig = {
	settings: {
		layout: {
			config: {}
		}
	},
	routes: [
		{
			path: '/calendar',
			component: CalendarView
		}
	],
	auth: authRoles.subadmin
};

export default CalendarConfig;
