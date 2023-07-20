import React from 'react';
import authRoles from '../../../auth/authRoles';
import StaffScheduleListing from './StaffScheduleListing';
import workshiftSchedules from './workshiftSchedules';
import ptoSchedules from './ptoSchedules';
import sickSchedules from './sickSchedules';
import editWorkShiftSchedule from './editWorkShiftSchedule';
import editPtoSchedule from './editPtoSchedule';
import editSickSchedule from './editSickSchedule';

const StaffConfig = {
	settings: {
		layout: {
			config: {}
		}
	},
	routes: [
		{
			path: '/staff-schedule',
			component: StaffScheduleListing
		},
		{
			path: '/staff-schedule-workshiftschedule',
			component: workshiftSchedules
		},
		{
			path: '/staff-schedule-ptoschedule',
			component: ptoSchedules
		},
		{
			path: '/staff-schedule-sickschedule',
			component: sickSchedules
		},
		{
			path: '/staff-schedule-editwork-shiftschedule',
			component: editWorkShiftSchedule
		},
		{
			path: '/staff-schedule-editptoschedule',
			component: editPtoSchedule
		},
		{
			path: '/staff-schedule-editsickschedule',
			component: editSickSchedule
		}
	],
	auth: authRoles.subadmin
};

export default StaffConfig;
