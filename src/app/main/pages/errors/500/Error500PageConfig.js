import React from 'react';
import Error500Page from './Error500Page';

const Error500PageConfig = {
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
			path: '/500',
			component: Error500Page
		}
	]
};

export default Error500PageConfig;
