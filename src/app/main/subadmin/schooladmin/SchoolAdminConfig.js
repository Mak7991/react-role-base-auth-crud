import React from 'react';
import authRoles from '../../../auth/authRoles';
import SchoolAdmin from './SchoolAdmin';
import AddSchoolAdmin from './addSchoolAdmin/AddSchoolAdmin';
import ViewSchoolAdmin from './viewSchoolAdmin/ViewSchoolAdmin';
import EditSchoolAdmin from './editSchoolAdmin/EditSchoolAdmin';

const SchoolAdminConfig = {
	settings: {
		layout: {
			config: {}
		}
	},
	routes: [
		{
			path: '/subadmin',
			component: SchoolAdmin
		},
		{
			path: '/subadmin-AddSchoolAdminProfile',
			component: AddSchoolAdmin
		},
		{
			path: '/subadmin-ViewSchoolAdminProfile/:id',
			component: ViewSchoolAdmin
		},
		{
			path: '/subadmin-EditSchoolAdminProfile/:id',
			component: EditSchoolAdmin
		}
	],
	auth: authRoles.subadmin
};

export default SchoolAdminConfig;
