import FuseUtils from '@fuse/utils';
import AppContext from 'app/AppContext';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { matchRoutes } from 'react-router-config';
import { withRouter } from 'react-router-dom';

class FuseAuthorization extends Component {
	constructor(props, context) {
		super(props);
		const { routes } = context;
		this.state = {
			accessGranted: true,
			routes
		};
	}

	componentDidMount() {
		if (!this.state.accessGranted) {
			this.redirectRoute();
		}
		// console.log(this.state.routes, 'matched');
		// console.log(this.props.userPermission, 'userPermission');
	}

	shouldComponentUpdate(nextProps, nextState) {
		return nextState.accessGranted !== this.state.accessGranted;
	}
	restrictRoutes() {
		const { location, userRole, history } = this.props;
		const { pathname, state } = location;
		// history.goBack();
		history.push({
			pathname: '/calendar'
		});
	}
	componentDidUpdate() {
		if (!this.state.accessGranted) {
			this.redirectRoute();
		}
	}

	static getDerivedStateFromProps(props, state) {
		// console.log(props, 'props');
		const { location, userRole ,userPermission} = props;
		const { pathname } = location;
		// const abc = ['/login', '/register', '/forgot-password', '/reset-password'];
		const perm = [
			"/students",
			"/staff",
			"/rooms",
			"/calendar",
			"/staff-schedule",
			"/messaging",
			"/livestreaming",
			"/reports",
			"/subadmin"
		]
		const filterUser = userPermission?.map(data => data?.split("_").join('').toLowerCase());
		const filterPerm = userRole[0] == 'sub_admin' ? perm?.filter(data => !filterUser?.includes(data)) : [];
		// console.log(filterPerm, 'filterUser');
		// const permissionss = [];
		const paths = state.routes.filter(data => !filterPerm?.includes(data.path.split("-")[0]));
		const matched = matchRoutes(paths, pathname)[0];
		// console.log(matched, 'matchedmatchedmatched');

		return {
			accessGranted: matched.route.path !== '/*' ? FuseUtils.hasPermission(matched.route.auth, userRole) : false
		};
	}

	redirectRoute() {
		const { location, userRole, history,userPermission } = this.props;
		const { pathname, state } = location;
		const redirectUrl = state && state.redirectUrl ? state.redirectUrl : '/';
		// const permissionss = ['/rooms', '/staff', '/students'];
		// const permissionss = [];
		const perm = [
			"/students",
			"/staff",
			"/rooms",
			"/calendar",
			"/staff-schedule",
			"/messaging",
			"/livestreaming",
			"/reports",
			"/subadmin"
		]
		const filterUser = userPermission?.map(data => data?.split("_").join('').toLowerCase());
		const filterPerm = userRole[0] == 'sub_admin' ? perm?.filter(data => !filterUser?.includes(data)) : [];
		const paths = this.state.routes.filter(data => !filterPerm?.includes(data.path.split("-")[0]));
		// console.log(this.state.routes, 'this.state.routes');
		// console.log(paths, 'pathspathspaths');
		const matched = matchRoutes(paths, pathname)[0];
		/*
        User is guest
        Redirect to Login Page
        */
		if (!userRole || userRole.length === 0) {
			history.push({
				pathname: '/login',
				state: { redirectUrl: pathname }
			});
		} else {
			/*
        User is member
        User must be on unAuthorized page or just logged in
        Redirect to dashboard or redirectUrl
        */
			// history.push({
			// 	pathname: redirectUrl
			// });
		}
		if (matched.route.path === '/*') {
			history.push({
				pathname: '/home'
			});
		}
	}

	render() {
		// console.info('Fuse Authorization rendered', accessGranted);
		return this.state.accessGranted ? <>{this.props.children}</> : null;
	}
}

function mapStateToProps({ auth }) {
	return {
		userRole: auth.user.role,
		userPermission: auth.user.permissions
	};
}

FuseAuthorization.contextType = AppContext;

export default withRouter(connect(mapStateToProps)(FuseAuthorization));
