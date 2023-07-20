import React from 'react';
import authRoles from '../../../auth/authRoles';
import Editsettings from './Editsettings';
import SettingsTab from './SettingsTab';

const SettingsConfig = {
	settings: {
		layout: {
			config: {}
		}
	},
	routes: [
		{
			path: '/Settings',
			component: SettingsTab
		},
		{
			path: '/Editsettings/:id',
			component: Editsettings
		}
	],
	auth: authRoles.subadmin
};

export default SettingsConfig;
