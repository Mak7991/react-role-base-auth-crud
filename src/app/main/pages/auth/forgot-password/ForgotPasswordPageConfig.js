import React from 'react';
import ForgotPasswordPage from './ForgotPasswordPage';

const ForgotPasswordPageConfig = {
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
			path: '/forgot-password',
			component: ForgotPasswordPage
		}
	]
};

export default ForgotPasswordPageConfig;
