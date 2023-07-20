import FuseAnimate from '@fuse/core/FuseAnimate';
import { useForm } from '@fuse/hooks';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import { makeStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import clsx from 'clsx';
import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import './ResetPasswordPage.css';
import IconButton from '@material-ui/core/IconButton';
import InputAdornment from '@material-ui/core/InputAdornment';
import VisibilityIcon from '@material-ui/icons/Visibility';
import VisibilityOffIcon from '@material-ui/icons/VisibilityOff';
import { CircularProgress } from '@material-ui/core';
import history from '@history';
import * as Actions from 'app/store/actions';
import * as authActions from 'app/auth/store/actions';
import JwtService from 'app/services/jwtService';
import CustomButton from 'app/customComponents/CustomButton/CustomButton';
import { resetPassword } from '../../../../services/resetPassword/resetPassword';

const useStyles = makeStyles(theme => ({
	root: {
		background: 'url(assets/images/banner/bg.png) no-repeat center',
		color: theme.palette.primary.contrastText
	}
}));
function ResetPasswordPage() {
	const dispatch = useDispatch();
	const classes = useStyles();
	const [hide1, setHide1] = useState(true);
	const [hide2, setHide2] = useState(true);
	const [isSendingReq, setIsSendingReq] = useState(false);
	const [pswdTxt, setPswdTxt] = useState('');
	const [pswd2Txt, setPswd2Txt] = useState('');
	const [username, setUsername] = useState(history?.location?.state?.username);

	const { form, setForm } = useForm({
		pswd: '',
		cnfrm_pswd: ''
	});

	useEffect(() => {
		if (!username) {
			dispatch(
				Actions.showMessage({
					message: 'Please enter Email/Phone to recieve OTP.',
					variant: 'error',
					autoHideDuration: 3000
				})
			);
			history.push('/forgot-password');
		}
	}, [dispatch, username]);

	const handleChange = e => {
		setForm({
			...form,
			[e.target.name]: e.target.value
		});
		if (e.target.name === 'cnfrm_pswd' && e.target.value === form.pswd) {
			setPswd2Txt('');
		}
		if (e.target.value.length >= 8) {
			setPswdTxt('');
		}
	};

	function handleSubmit(e) {
		e.preventDefault();
		if (form.pswd.length < 8) {
			setPswdTxt('Password Length must be eight or more characters.');
			return;
		}
		if (form.pswd.toUpperCase() === form.pswd) {
			setPswdTxt('Password must contain one lowercase string.');
			return;
		}
		if (form.pswd.toLowerCase() === form.pswd) {
			setPswdTxt('Password must contain one uppercase character.');
			return;
		}
		if (!/\d/.test(form.pswd)) {
			setPswdTxt('Password must contain one number.');
			return;
		}
		if (!/[ `!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?~]/.test(form.pswd)) {
			setPswdTxt('Password must contain one special character.');
			return;
		}
		if (form.pswd !== form.cnfrm_pswd) {
			setPswd2Txt('Password and Confirm Password must be same.');
			return;
		}
		setIsSendingReq(true);
		const data = {
			username,
			password: form.pswd
		};
		resetPassword(data)
			.then(response => {
				JwtService.logout();
				setUsername(null);
				JwtService.setSession(null);
				dispatch(authActions.removeUserData());
				setIsSendingReq(false);
				dispatch(
					Actions.showMessage({
						message: `${response.data.message}. Redirecting...`,
						variant: 'success',
						autoHideDuration: 3000
					})
				);
				history.push('/success');
			})
			.catch(err => {
				setIsSendingReq(false);
			});
	}
	return (
		<div className={clsx(classes.root, 'flex flex-col flex-auto flex-shrink-0 items-center justify-center p-32')}>
			<div className="flex flex-col items-center justify-center w-full">
				<FuseAnimate animation="transition.expandIn">
					<Card className="reset-width">
						<CardContent className="flex flex-col items-center justify-center p-32">
							<img
								width={150}
								className="mb-2 gd text-center logo-img"
								src="assets/images/logos/logo.png"
								alt="logo"
							/>
							<Typography variant="h6" className="mt-16 mb-32 hellloooo">
								Reset Your Password
							</Typography>
							<form
								name="loginForm"
								noValidate
								className="flex flex-col justify-center w-full"
								onSubmit={handleSubmit}
							>
								<div className="insert">
									<TextField
										className="mb-16 w-full"
										type={hide1 ? 'password' : 'text'}
										name="pswd"
										value={form.pswd}
										onChange={handleChange}
										required
										id="pswd"
										label="New Password"
										error={!!pswdTxt.length}
										helperText={pswdTxt}
										InputProps={{
											endAdornment: (
												<InputAdornment>
													<IconButton onClick={() => setHide1(!hide1)}>
														{hide1 ? <VisibilityOffIcon /> : <VisibilityIcon />}
													</IconButton>
												</InputAdornment>
											)
										}}
									/>
								</div>
								<div className="insert">
									<TextField
										className="mb-16 w-full"
										type={hide2 ? 'password' : 'text'}
										name="cnfrm_pswd"
										value={form.cnfrm_pswd}
										onChange={handleChange}
										required
										id="cnfrm_pswd"
										label="Confirm Password"
										fullWidth
										error={!!pswd2Txt.length}
										helperText={pswd2Txt}
										InputProps={{
											endAdornment: (
												<InputAdornment>
													<IconButton onClick={() => setHide2(!hide2)}>
														{hide2 ? <VisibilityOffIcon /> : <VisibilityIcon />}
													</IconButton>
												</InputAdornment>
											)
										}}
									/>
								</div>
								{isSendingReq ? (
									<div style={{ paddingLeft: '41%' }}>
										<CircularProgress size={35} />
									</div>
								) : (
									// <input type="submit" value="Reset Password" className="resetsubmit" />
									<div className="flex justify-center mt-12">
										<CustomButton width={161} height={37} type="submit">
											Reset Password
										</CustomButton>
									</div>
								)}
							</form>
						</CardContent>
					</Card>
				</FuseAnimate>
			</div>
		</div>
	);
}
export default ResetPasswordPage;
