import Login from './LoginPage';

const LoginPageConfig = {
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
			path: '/login',
			component: Login // React.lazy(() => import('./LoginPage'))
		}
	]
};

export default LoginPageConfig;
