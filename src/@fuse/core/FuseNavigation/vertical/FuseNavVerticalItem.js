import NavLinkAdapter from '@fuse/core/NavLinkAdapter';
import FuseUtils from '@fuse/utils';
import Icon from '@material-ui/core/Icon';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import { makeStyles } from '@material-ui/core/styles';
import * as Actions from 'app/store/actions';
import clsx from 'clsx';
// import { upperCase } from 'lodash-es';
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { withRouter } from 'react-router-dom';
import FuseNavBadge from '../FuseNavBadge';
import Snackbar from '@material-ui/core/Snackbar';
// import { Alert } from '@material-ui/lab';
import MuiAlert from '@material-ui/lab/Alert';

function Alert(props) {
	return <MuiAlert elevation={6} variant="filled" {...props} style={{ width: '400px' }} />;
}

const useStyles = makeStyles((theme) => ({
	item: (props) => ({
		height: 40,
		paddingRight: 12,
		margin: '20px 0',
		paddingLeft: props.itemPadding > 80 ? 80 : props.itemPadding,
		'&.active': {
			backgroundColor: '#1992F4',
			// color: `white`,
			pointerEvents: 'none',
			transition: 'border-radius .15s cubic-bezier(0.4,0.0,0.2,1)',
			'& .list-item-text-primary': {
				color: 'inherit',
			},
			'& .list-item-icon': {
				color: 'inherit',
			},
			'& .list-subheader-text': {
				fontSize: 15,
			},
		},

		'& .list-item-icon': {
			// marginRight: 15,
			marginLeft: 10,
		},
		'& .list-item-text-primary ': {
			fontSize: 18,
			textTransform: 'capitalize',
			fontWeight: '500',
		},
		color: theme.palette.text.primary,
		cursor: 'pointer',
		textDecoration: 'none!important',
	}),
}));

function FuseNavVerticalItem(props) {
	const dispatch = useDispatch();
	const userRole = useSelector(({ auth }) => auth.user.role);
	const userPermission = useSelector(({ auth }) => auth.user.permissions);
	const [state, setState] = React.useState({
		open: false,
		vertical: 'center',
		horizontal: 'center',
	});
	const { vertical, horizontal, open } = state;
	const { item, nestedLevel } = props;
	const classes = useStyles({
		itemPadding: nestedLevel > 0 ? 40 + nestedLevel * 16 : 24,
	});
	const { t } = useTranslation('navigation');

	if (!FuseUtils.hasPermission(item.auth, userRole)) {
		return null;
	}
	// const permissionss = ['/rooms', '/staff', '/students'];
	const perm = [
		'/students',
		'/staff',
		'/rooms',
		'/calendar',
		'/staff-schedule',
		'/messaging',
		'/livestreaming',
		'/reports',
		'/subadmin',
	];
	const filterUser = userPermission?.map((data) => data?.split('_').join('').toLowerCase());
	const filterPerm = userRole[0] == 'sub_admin' ? perm?.filter((data) => !filterUser?.includes(data)) : [];

	const handleClose = (event, reason) => {
		if (reason === 'clickaway') {
			return;
		}

		setState({ ...state, open: false });
	};
	const msg = `you are not authorized to use ${item.title}`;
	return (
		<>
			<ListItem
				button
				component={NavLinkAdapter}
				to={!filterPerm?.includes(item.url) && item.url}
				// to={item.url}
				activeClassName="active"
				className={clsx(classes.item, 'list-item')}
				onClick={(ev) => {
					if (!filterPerm.includes(item.url)) {
						dispatch(Actions.navbarCloseMobile());
					} else {
						// alert('not allowed');
						// dispatch(
						// 	Actions.showMessage({
						// 		message: `you are not authorized to use  ${item.title}`,
						// 		autoHideDuration: 800,
						// 		variant: 'error'
						// 	})
						// );
						setState({
							open: true,
							vertical: 'center',
							horizontal: 'center',
						});
					}
					// dispatch(Actions.navbarCloseMobile());
				}}
				exact={item.exact}
			>
				{!item.isCustomIcon && item.icon && <Icon className="list-item-icon flex-shrink-0">{item.icon}</Icon>}
				{item.isCustomIcon && item.icon && (
					<div style={{ width: 32, marginRight: 15 }}>
						<img
							className="list-item-icon flex-shrink-0"
							src={`assets/images/navbarIcons/${item.icon}`}
							alt=""
						/>
					</div>
				)}
				<ListItemText
					className="list-item-text"
					primary={item.translate ? t(item.translate) : item.title}
					classes={{ primary: 'text-8 list-item-text-primary' }}
				/>

				{item.badge && <FuseNavBadge badge={item.badge} />}
			</ListItem>
			<Snackbar
				anchorOrigin={{ vertical, horizontal }}
				open={open}
				autoHideDuration={1500}
				onClose={handleClose}
				key={vertical + horizontal}
				style={{ top: '15%' }}
			>
				<Alert onClose={handleClose} severity="error">
					{msg}
				</Alert>
			</Snackbar>
		</>
	);
}

FuseNavVerticalItem.propTypes = {
	item: PropTypes.shape({
		id: PropTypes.string.isRequired,
		title: PropTypes.string,
		icon: PropTypes.string,
		url: PropTypes.string,
	}),
};

FuseNavVerticalItem.defaultProps = {};

const NavVerticalItem = withRouter(React.memo(FuseNavVerticalItem));

export default NavVerticalItem;
