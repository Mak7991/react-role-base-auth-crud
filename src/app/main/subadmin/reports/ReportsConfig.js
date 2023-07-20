import React from 'react';
import authRoles from '../../../auth/authRoles';
import Reports from './Reports';
import Checkin from './Checkin';
import Attendance from './Attendance';
import Activity from './Activity';
import Staff from './Staff';
import Age from './Age';
import EnrolledStudent from './EnrolledStudent';
import RoomRatio from './RoomRatio';
import Allergy from './Allergy';
import Medication from './Medication';
import Contact from './Contact';
import SubscriptionReport from './SubscriptionReport';
import SchoolRoyalties from './SchoolRoyalties';
import Immunization from './ImmunizationReport';
import DueOverDueReport from './DueOverDueReport';
import Meal from './Meal';
import DownloadReports from './DownloadReports';
import RoomCheck from './RoomCheck';

const ReportsConfig = {
	reports: {
		layout: {
			config: {}
		}
	},
	routes: [
		{
			path: '/reports',
			component: Reports
		},
		{
			path: '/reports-checkin',
			component: Checkin
		},
		{
			path: '/reports-attendance',
			component: Attendance
		},
		{
			path: '/reports-activity',
			component: Activity
		},
		{
			path: '/reports-staff',
			component: Staff
		},
		{
			path: '/reports-age',
			component: Age
		},
		{
			path: '/reports-enrolledStudent',
			component: EnrolledStudent
		},
		{
			path: '/RoomCheck',
			component: RoomCheck
		},
		{
			path: '/reports-roomRatio',
			component: RoomRatio
		},
		{
			path: '/reports-allergy',
			component: Allergy
		},
		{
			path: '/reports-medication',
			component: Medication
		},
		{
			path: '/reports-contact',
			component: Contact
		},
		{
			path: '/reports-subscription',
			component: SubscriptionReport
		},
		{
			path: '/reports-royalties',
			component: SchoolRoyalties
		},
		{
			path: '/reports-meal',
			component: Meal
		},
		{
			path: '/reports-immunization',
			component: Immunization
		},
		{
			path: '/reports-due-overdue',
			component: DueOverDueReport
		},
		{
			path: '/reports-download',
			component: DownloadReports
		}
	],
	auth: authRoles.subadmin
};

export default ReportsConfig;
