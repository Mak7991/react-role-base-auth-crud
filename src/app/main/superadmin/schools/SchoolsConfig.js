import React from 'react';
import authRoles from 'app/auth/authRoles';
import Schools from './Schools';
import AddSchools from './AddSchools';
import EditSchools from './EditSchools';

const SchoolsConfig = {
	settings: {
		layout: {
			config: {}
		}
	},
	routes: [
		{
			path: '/schools',
			component: Schools // React.lazy(() => import('./SubAdmins'))
		},
		{
			path: '/addschool',
			component: AddSchools
		},
		// {
		// 	path: '/editschool',
		// 	component: React.lazy(() => import('./EditSchools'))
		// },
		{
			path: '/editschool/:id',
			component: EditSchools
		}
	],
	auth: authRoles.admin
};

export default SchoolsConfig;
