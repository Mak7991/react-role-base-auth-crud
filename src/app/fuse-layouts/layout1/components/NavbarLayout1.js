import FuseScrollbars from '@fuse/core/FuseScrollbars';
import { makeStyles } from '@material-ui/core/styles';
import Navigation from 'app/fuse-layouts/shared-components/Navigation';
import clsx from 'clsx';
import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import './NavbarLayout1.css';
import ViewAs from './ViewAs';

const useStyles = makeStyles({
	content: {
		overflowX: 'hidden',
		overflowY: 'auto',
		'-webkit-overflow-scrolling': 'touch',
		backgroundRepeat: 'no-repeat',
		backgroundSize: '100% 40px, 100% 10px',
		backgroundAttachment: 'local, scroll',
	},
});

function NavbarLayout1(props) {
	const user = useSelector(({ auth }) => auth.user);
	const classes = useStyles();
	const [hours, setHours] = useState(new Date().getHours());
	const [minutes, setMinutes] = useState(new Date().getMinutes());

	useEffect(() => {
		const id = setInterval(() => {
			setHours(new Date().getHours());
			setMinutes(new Date().getMinutes());
		}, 1000);

		return () => {
			clearInterval(id);
		};
	}, [minutes, hours]);

	return (
		<>
			<div
				style={{ backgroundImage: 'url("assets/images/logos/nav-bar.png")' }}
				className={clsx('flex flex-col overflow-hidden h-full', props.className)}
			>
				<FuseScrollbars className={`${clsx(classes.content)} pb-64`} option={{ suppressScrollX: true }}>
					<div
						style={{
							color: 'white',
							marginLeft: '34px',
							fontSize: 16,
							marginTop: '30px',
							marginBottom: '10px',
						}}
					>
						<div className="main-sun">
							<span className="sun-logo">
								{hours >= 6 && hours < 12 ? (
									<img src="assets/images/navbarIcons/Morning.png" alt="time-icon" />
								) : hours >= 12 && hours < 17 ? (
									<img src="assets/images/navbarIcons/Afternoon.png" alt="time-icon" />
								) : (
									<img src="assets/images/navbarIcons/Evening.png" alt="time-icon" />
								)}
							</span>
						</div>
						<div className="sun-time">
							{hours > 12
								? (hours - 12).toLocaleString('en-US', {
										minimumIntegerDigits: 2,
										useGrouping: false,
								  })
								: hours.toLocaleString('en-US', {
										minimumIntegerDigits: 2,
										useGrouping: false,
								  })}
							:
							{minutes.toLocaleString('en-US', {
								minimumIntegerDigits: 2,
								useGrouping: false,
							})}{' '}
							{hours >= 12 ? 'PM' : 'AM'}, <br />
							Good{' '}
							{hours >= 6 && hours < 12 ? 'Morning' : hours >= 12 && hours < 17 ? 'Afternoon' : 'Evening'}
						</div>
						{user.role[0] !== 'super_admin' && (
							<p
								style={{ maxWidth: 169, margin: 0, marginTop: 31, marginBottom: 0 }}
								className="text-white text-transform"
							>
								{user?.school?.name || user.data?.school?.name}
							</p>
						)}
					</div>
					<Navigation layout="vertical" className="bottom-nav" />

					{/* {(user.role.includes('super_admin') || user.role.includes('super_school_admin')) && (
						<div className="mb-16 pb-16">
							<ViewAs />
						</div>
					)} */}
				</FuseScrollbars>
			</div>
		</>
	);
}

export default NavbarLayout1;
