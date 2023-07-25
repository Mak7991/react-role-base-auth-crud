import React from 'react';
import { Redirect } from 'react-router-dom';
import FuseUtils from '@fuse/utils';
import SuperAdminConfig from 'app/main/superadmin/superAdminConfig';
import pagesConfigs from 'app/main/pages/pagesConfigs';
import subAdminConfig from 'app/main/subadmin/subAdminConfig';
// import UserMenuConfig from 'app/fuse-layouts/shared-components/UserMenuConfig';
import secureLocalStorage from 'react-secure-storage';

const routeConfigs = [...pagesConfigs, ...subAdminConfig, ...SuperAdminConfig];

const routes = [
	...FuseUtils.generateRoutesFromConfigs(routeConfigs),
	{
		path: '/',
		exact: true,
		component: () => {
			if (JSON.parse(secureLocalStorage.getItem('user'))?.role[0] === 'super_admin') {
				return <Redirect to="/fileUpload" />;
			}
			if (
				JSON.parse(secureLocalStorage.getItem('user'))?.role[0] === 'super_school_admin' ||
				JSON.parse(secureLocalStorage.getItem('user'))?.role[0] === 'school_admin' ||
				JSON.parse(secureLocalStorage.getItem('user'))?.role[0] === 'sub_admin'
			) {
				return <Redirect to="/home" />;
			}
			return <Redirect to="/login" />;
		}
	},
	{
		path: '/*',
		component: () => <Redirect to="/404" />
	}
];

export default routes;
