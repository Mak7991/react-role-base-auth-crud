import React from 'react';
import authRoles from '../../../auth/authRoles';
import StudentInformation from './StudentInformation';
import EditStudent from './EditStudent';
import AddEditContact from './AddEditContact';
import EditMedications from './EditMedications';

const StudentInformationConfig = {
	settings: {
		layout: {
			config: {
				navbar: {
					display: false
				},
				footer: {
					display: false
				}
			}
		}
	},
	routes: [
		// {
		// 	path: '/student',
		// 	component: React.lazy(() => import('./StudentInformation'))
		// },
		{
			path: '/students-student/:id',
			component: StudentInformation
		},
		{
			path: '/students-editstudent',
			component: EditStudent
		},
		{
			path: '/students-contact',
			component: AddEditContact
		},
		{
			path: '/students-editmedications',
			component: EditMedications
		}
	],
	auth: authRoles.subadmin
};

export default StudentInformationConfig;
