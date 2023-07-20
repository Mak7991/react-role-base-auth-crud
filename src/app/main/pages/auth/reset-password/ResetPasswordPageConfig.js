import React from 'react';
import ResetPasswordPage from './ResetPasswordPage';

const ResetPasswordPageConfig = {
	settings: {
		layout: {
			config: {
				navbar: {
					display: false
				},
				toolbar: {
					display: false
				},
				footer: {
					display: false
				}
			}
		}
	},
	routes: [
		{
			path: '/reset-password',
			component: ResetPasswordPage
		}
	]
};

export default ResetPasswordPageConfig;

