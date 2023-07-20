import React from 'react';
import authRoles from '../../../auth/authRoles';
import adminDetail from 'app/fuse-layouts/shared-components/adminDetail';
import Editprofile from 'app/fuse-layouts/shared-components/Editprofile';


const SuperAdminProfileConfig = {
	settings: {
		layout: {
			Config: {}
		}
	},
	routes: [
		{
			path: '/superadminprofile',
			component: adminDetail
		},
		{
			path: '/Editprofile',
			component: Editprofile
		}
	],
	auth: authRoles.admin
};

export default SuperAdminProfileConfig;
