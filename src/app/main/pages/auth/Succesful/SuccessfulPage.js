import FuseAnimate from '@fuse/core/FuseAnimate';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import clsx from 'clsx';
import React, { useEffect } from 'react';
import './SuccessfulPage.css';
import history from '@history';
import CustomButton from 'app/customComponents/CustomButton/CustomButton';

const useStyles = makeStyles(theme => ({
	root: {
		background: 'url(assets/images/banner/bg.png) no-repeat center',
		color: theme.palette.primary.contrastText
	}
}));
function SuccessfulPage() {
	const classes = useStyles();

	const redirect = () => {
		history.push('/login');
	};

	useEffect(() => {
		const timeout = setTimeout(redirect, 2000);
		return () => clearTimeout(timeout);
	}, []);

	return (
		<div className={clsx(classes.root, 'flex flex-col flex-auto flex-shrink-0 items-center justify-center p-32')}>
			<div className="flex flex-col items-center justify-center w-full">
				<FuseAnimate animation="transition.expandIn">
					<Card className="forget-width">
						<CardContent className="flex flex-col items-center justify-center p-32">
							<img
								width={150}
								className="mb-2 gd text-center logo-img"
								src="assets/images/logos/logo.png"
								alt="logo"
							/>
							<Typography variant="h6" className="mt-16 mb-32 hellloooo">
								<img src="assets/images/banner/successfully-icon.png" alt="check" />
							</Typography>
							<h2 className="hd-succ">Password Successfully Updated</h2>
							<p className="para-succ parasucces">Your have successfully reset your password</p>
							{/* <button id="signin-btn" type="button" onClick={redirect}></button> */}
							<div className="flex justify-center mt-32">
								<CustomButton type="submit" width={145} onClick={redirect}>
									Sign In
								</CustomButton>
							</div>
						</CardContent>
					</Card>
				</FuseAnimate>
			</div>
		</div>
	);
}
export default SuccessfulPage;
