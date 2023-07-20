import React from 'react';
import SuccessfulPage from './SuccessfulPage';

const SuccessfulPageConfig = {
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
			path: '/success',
			component: SuccessfulPage
		}
	]
};

export default SuccessfulPageConfig;
