import React from 'react';
import OtpPage from './Otp';

const OtpCOnfig = {
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
			path: '/otp',
			component: OtpPage
		}
	]
};

export default OtpCOnfig;

