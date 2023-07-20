import React from 'react';
import authRoles from '../../../auth/authRoles';
import Rooms from './Rooms';
import Addschedules from './addschedules';
import addschedules from './addschedules';
import Updateschedulee from './updateschedule';
import roomschedule from './roomschedule';
import Roomsetting from './Roomsetting';
import Room from './Room';
import AddRoom from './AddRoom';
import FeedsTypeDetail from './FeedsTypeDetail';
import AddLocation from './AddLocation';

const StudentInformationConfig = {
	settings: {
		layout: {
			config: {},
		},
	},
	routes: [
		{
			path: '/rooms',
			component: Rooms,
		},
		{
			path: '/rooms-addschedules/:id',
			component: addschedules,
		},
		{
			path: '/rooms-updateschedule/:id',
			component: Updateschedulee,
		},
		{
			path: '/rooms-roomschedule/:id',
			component: roomschedule,
		},
		{
			path: '/rooms-roomsetting',
			component: Roomsetting,
		},
		{
			path: '/rooms-room/:id',
			component: Room,
		},
		{
			path: '/rooms-addroom',
			component: AddRoom,
		},
		{
			path: '/rooms-FeedsType/:id',
			component: FeedsTypeDetail,
		},
		{
			path: '/location-add',
			component: AddLocation,
		},
	],
	auth: authRoles.subadmin,
};

export default StudentInformationConfig;
