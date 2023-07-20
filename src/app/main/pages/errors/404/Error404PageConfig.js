import React from 'react';
import Error404Page from './Error404Page';

const Error404PageConfig = {
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
			path: '/404',
			component: Error404Page
		}
	]
};

export default Error404PageConfig;
