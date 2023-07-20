import i18next from 'i18next';
import ar from './navigation-i18n/ar';
import en from './navigation-i18n/en';
import tr from './navigation-i18n/tr';
import authRoles from '../auth/authRoles';

i18next.addResourceBundle('en', 'navigation', en);
i18next.addResourceBundle('tr', 'navigation', tr);
i18next.addResourceBundle('ar', 'navigation', ar);

const navigationConfig = [
	{
		id: 'Home',
		title: 'Home',
		translate: 'Home',
		type: 'item',
		isCustomIcon: true,
		icon: 'home.png',
		url: '/company',
		auth: authRoles.admin
	},
	{
		id: 'schools',
		title: 'schools',
		translate: 'schools',
		type: 'item',
		isCustomIcon: true,
		icon: 'school-admin.png',
		url: '/schools',
		auth: authRoles.admin
	},
	{
		id: 'reports',
		title: 'CompanyReports',
		translate: 'reports',
		type: 'item',
		isCustomIcon: true,
		icon: 'report.png',
		url: '/company-reports',
		auth: authRoles.admin
	},
	// {
	// 	id: 'streaming',
	// 	title: 'streaming',
	// 	translate: 'streaming',
	// 	type: 'item',
	// 	icon: 'business',
	// 	url: '/streaming-rnd',
	// 	auth: authRoles.admin
	// },
	{
		id: 'home',
		title: 'Home',
		translate: 'Home',
		type: 'item',
		isCustomIcon: true,
		icon: 'home.png',
		url: '/home',
		auth: authRoles.subadmin
	},
	{
		id: 'calendar',
		title: 'Calendar',
		translate: 'Calendar',
		type: 'item',
		isCustomIcon: true,
		icon: 'calendar.png',
		url: '/calendar',
		auth: authRoles.subadmin
	},
	{
		id: 'students',
		title: 'students',
		translate: 'students',
		type: 'item',
		isCustomIcon: true,
		icon: 'students.png',
		url: '/students',
		auth: authRoles.subadmin
	},
	{
		id: 'staff',
		title: 'staff',
		translate: 'staff',
		type: 'item',
		isCustomIcon: true,
		icon: 'staff.png',
		url: '/staff',
		auth: authRoles.subadmin
	},
	{
		id: 'rooms',
		title: 'rooms',
		translate: 'rooms',
		type: 'item',
		isCustomIcon: true,
		icon: 'rooms.png',
		url: '/rooms',
		auth: authRoles.subadmin
	},
	{
		id: 'staffschedule',
		title: 'staff schedule',
		translate: 'staff schedule',
		type: 'item',
		isCustomIcon: true,
		icon: 'staff-schedules.png',
		url: '/staff-schedule',
		auth: authRoles.subadmin
	},
	{
		id: 'messaging',
		title: 'messaging',
		translate: 'Messaging',
		type: 'item',
		isCustomIcon: true,
		icon: 'message.png',
		url: '/messaging',
		auth: authRoles.subadmin
	},
	{
		id: 'LiveStreaming',
		title: 'Live Streaming',
		translate: 'Live Streaming',
		type: 'item',
		isCustomIcon: true,
		icon: 'live-streaming.png',
		url: '/livestreaming',
		auth: authRoles.subadmin
	},
	{
		id: 'schooladmin',
		title: 'School Admins',
		translate: 'School Admins',
		type: 'item',
		isCustomIcon: true,
		icon: 'school-admin.png',
		url: '/subadmin',
		auth: authRoles.subadmin
	},
	{
		id: 'reports',
		title: 'reports',
		translate: 'Reports',
		type: 'item',
		isCustomIcon: true,
		icon: 'report.png',
		url: '/reports',
		auth: authRoles.subadmin
	},

	{
		id: 'settings',
		title: 'settings',
		translate: 'settings',
		type: 'item',
		isCustomIcon: true,
		icon: 'settings.png',
		url: '/settings',
		auth: authRoles.subadmin
	}
];

export default navigationConfig;
