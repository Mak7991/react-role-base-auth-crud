import React from 'react';
import authRoles from '../../../auth/authRoles';
import AddParent from './AddParent';
import EnrollStudents from './EnrollStudents';
import Students from './Students';
import SubmitRoster from './SubmitRoster';


const StudentsConfig = {
	settings: {
		layout: {
			config: {}
		}
	},
	routes: [
		{
			path: '/students',
			component: Students
		},
		{
			path: '/students-enroll',
			component: EnrollStudents
		},
		{
			path: '/students-addparent',
			component: AddParent
		},
		{
			path: '/students-submitroster',
			component: SubmitRoster
		}
	],
	auth: authRoles.subadmin
};

export default StudentsConfig;
