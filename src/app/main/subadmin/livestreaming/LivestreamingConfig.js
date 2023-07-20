import React from 'react';
import authRoles from '../../../auth/authRoles';
import Livestreaming from './Livestreaming';
import CameraRegistration from './live/CameraRegistration';

const LivestreamingConfig = {
	settings: {
		layout: {
			config: {}
		}
	},
	routes: [
		{
			path: '/livestreaming',
			component: Livestreaming
		},
		{
			path: '/livestreaming-CameraRegistration',
			component: CameraRegistration
		}
	],
	auth: authRoles.subadmin
};

export default LivestreamingConfig;
