import React from 'react';
import authRoles from '../../../auth/authRoles';
import StaffListing from './StaffListing';
import EditStaff from './EditStaff';
import AddStaff from './AddStaff';
import StaffInformation from './StaffInformation';

const StaffConfig = {
	settings: {
		layout: {
			config: {}
		}
	},
	routes: [
		{
			path: '/staff',
			component: StaffListing
		},
		{
			path: '/staff-editstaff/:id',
			component: EditStaff
		},
		{
			path: '/staff-addstaff',
			component: AddStaff
		},
		{
			path: '/staff-StaffInformation',
			component: StaffInformation
		}
	],
	auth: authRoles.subadmin
};

export default StaffConfig;
