import AppBar from '@material-ui/core/AppBar';
import Hidden from '@material-ui/core/Hidden';
import { makeStyles, ThemeProvider } from '@material-ui/core/styles';
import Toolbar from '@material-ui/core/Toolbar';
import NavbarMobileToggleButton from 'app/fuse-layouts/shared-components/NavbarMobileToggleButton';
import UserMenu from 'app/fuse-layouts/shared-components/UserMenu';
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import SchoolAdminTopNav from './schoolAdminTopNav/SchoolAdminTopNav';
import Topbar from './schoolAdminTopNav/Topbar';
import SuperAdminTopNav from './superAdminTopNav/superAdminTopNav';
import history from '@history';

// import QuickPanelToggleButton from 'app/fuse-layouts/shared-components/quickPanel/QuickPanelToggleButton';

const useStyles = makeStyles((theme) => ({
	separator: {
		marginTop: 8,
		width: 1,
		height: 50,
		backgroundColor: theme.palette.divider,
	},
}));

function ToolbarLayout1(props) {
	const location = useLocation();
	const config = useSelector(({ fuse }) => fuse.settings.current.layout.config);
	const toolbarTheme = useSelector(({ fuse }) => fuse.settings.toolbarTheme);
	const user = useSelector(({ auth }) => auth.user);

	const classes = useStyles(props);
	const [unreadCount, setUnreadCount] = useState(0);

	return (
		<ThemeProvider theme={toolbarTheme}>
			<AppBar
				id="fuse-toolbar"
				className="flex fixed z-10"
				color="default"
				style={{ backgroundColor: '#fff', height: 81 }}
			>
				<Toolbar className="p-0">
					{config.navbar.display && config.navbar.position === 'left' && (
						<Hidden lgUp>
							<NavbarMobileToggleButton className="w-64 h-64 p-0" />
							<div className={classes.separator} />
						</Hidden>
					)}

					<div className="flex flex-2 ml-25 items-center" style={{ marginLeft: '35px' }}>
						<img
							className={`${user?.role?.length && 'cursor-pointer'}`}
							src="assets/images/logos/logo.png"
							alt=""
							width={138}
							style={{ height: '100%' }}
							onClick={() => {
								console.log(user?.role?.length);
								if (user.role?.length) {
									if (user.role[0] === 'super_admin') {
										history.push('/company');
									} else {
										history.push('/home');
									}
								}
							}}
						/>
						<div className={classes.separator} style={{ marginLeft: '64px' }} />
					</div>
					<div className="flex flex-1">
						{(user.role[0] === 'school_admin' ||
							user.role[0] === 'super_school_admin' ||
							user.role[0] === 'sub_admin') && (
							<Topbar key={user} setUnreadCount={setUnreadCount} unreadCount={unreadCount} />
						)}
					</div>
					<div className="flex justify-between items-center">
						{user.role[0] === 'super_admin' ? (
							<SuperAdminTopNav />
						) : user.role.length ? (
							<SchoolAdminTopNav setUnreadCount={setUnreadCount} unreadCount={unreadCount} />
						) : (
							''
						)}
						{user.role[0] !== 'super_admin' && <div className={classes.separator} />}
						{user.role.length ? <UserMenu /> : ''}
					</div>
				</Toolbar>
			</AppBar>
		</ThemeProvider>
	);
}

export default ToolbarLayout1;
