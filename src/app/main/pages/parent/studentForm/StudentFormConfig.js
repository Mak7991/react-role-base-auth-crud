import React from 'react';
import authRoles from 'app/auth/authRoles';

const StudentFormConfig = {
	settings: {
		layout: {
			config: {
				navbar: {
					display: false
				},
				footer: {
					display: false
				}
			}
		}
	},
	routes: [
		{
			path: '/studentform',
			component: React.lazy(() => import('./StudentForm'))
		},
		{
			path: '/studentformedit',
			component: React.lazy(() => import('./EditStudent'))
		},
		{
			path: '/studentcontact',
			component: React.lazy(() => import('./AddEditContact'))
		},
		{
			path: '/expiredlink',
			component: React.lazy(() => import('./ExpiredLink'))
		},
		{
			path: '/medications',
			component: React.lazy(() => import('./EditMedications'))
		}
	]
};

export default StudentFormConfig;
