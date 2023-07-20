import React from 'react';
import authRoles from '../../../auth/authRoles';
import Rooms from './Rooms';
import Room from './Room';

const CheckInOutConfig = {
	settings: {
		layout: {
			config: {}
		}
	},
	routes: [
		{
			path: '/checkinout/:id',
			component: Room
		},
		{
			path: '/checkinout',
			component: Rooms
		}
	],
	auth: authRoles.subadmin
};

export default CheckInOutConfig;
