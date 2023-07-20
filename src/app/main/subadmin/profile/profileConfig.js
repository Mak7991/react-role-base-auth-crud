import React from 'react';
import authRoles from '../../../auth/authRoles';
import  adminDetail from 'app/fuse-layouts/shared-components/adminDetail';
import Editprofile from 'app/fuse-layouts/shared-components/Editprofile';


const SubAdminProfileConfig = {
	settings: {
		layout: {
			Config: {}
		}
	},
	routes: [
		{
			path: '/profile-view',
			component: adminDetail
		},
		{
			path: '/profile-edit',
			component: Editprofile
		}
	],
	auth: authRoles.subadmin
};

export default SubAdminProfileConfig;
