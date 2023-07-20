import { makeStyles } from '@material-ui/core/styles';
// import Typography from '@material-ui/core/Typography';
import clsx from 'clsx';
import React from 'react';

const useStyles = makeStyles(theme => ({
	root: {
		'& .logo-icon': {
			width: 24,
			height: 24,
			transition: theme.transitions.create(['width', 'height'], {
				duration: theme.transitions.duration.shortest,
				easing: theme.transitions.easing.easeInOut
			})
		},
		'& .react-badge, & .logo-text': {
			transition: theme.transitions.create('opacity', {
				duration: theme.transitions.duration.shortest,
				easing: theme.transitions.easing.easeInOut
			})
		}
	},
	reactBadge: {
		backgroundColor: '#1F21212',
		color: '#fff'
	}
}));

function Logo() {
	const classes = useStyles();

	return (
		<div className={clsx(classes.root, 'flex items-center')}>
			{/* <img className="logo-icon" src="assets/images/logos/fuse.svg" alt="logo" /> */}
			{/* <Typography className="text-16 mx-12 font-light logo-text" color="inherit">
				FUSE
			</Typography> */}
			<div style={{marginTop:"40px"}} className={clsx(classes.reactBadge, 'react-badge flex items-center py-4 px-8 rounded')}>
				<img
					className="react-logo"
					src="assets/images/logos/logo.png"
					alt="react"
					width="100%"
				/>
				{/* <span className="react-text text-12 mx-4">React</span> */}
			</div>
		</div>
	);
}

export default Logo;

