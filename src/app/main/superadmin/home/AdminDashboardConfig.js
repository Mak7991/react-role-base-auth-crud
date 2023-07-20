import React from 'react';
import authRoles from '../../../auth/authRoles';
import AdminDashboard from './AdminDashboard';

const AdminDashboardConfig = {
	settings: {
		layout: {
			config: {}
		}
	},
	routes: [
		{
			path: '/company',
			component: AdminDashboard
		}
	],
	auth: authRoles.admin
};

export default AdminDashboardConfig;
