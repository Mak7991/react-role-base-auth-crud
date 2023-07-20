import React from 'react';
import authRoles from '../../../auth/authRoles';
import SubAdminDashboard from './SubAdminDashboard';
import ShowAllBirthdays from './ShowAllBirthdays';

const SubAdminDashboardConfig = {
	settings: {
		layout: {
			config: {}
		}
	},
	routes: [
		{
			path: '/home',
			component: SubAdminDashboard
		},
		{
			path: '/upcoming-birthdays',
			component: ShowAllBirthdays
		}
	],
	auth: authRoles.subadmin
};

export default SubAdminDashboardConfig;
