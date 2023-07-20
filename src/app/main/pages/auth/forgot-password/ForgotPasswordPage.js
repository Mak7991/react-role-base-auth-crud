import FuseAnimate from '@fuse/core/FuseAnimate';
import { useForm } from '@fuse/hooks';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import { makeStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import clsx from 'clsx';
import React, { useState } from 'react';
import './Forgetpage.css';
import { CircularProgress } from '@material-ui/core';
import history from '@history';
import * as Actions from 'app/store/actions';
import { useDispatch, useSelector } from 'react-redux';
import CustomButton from 'app/customComponents/CustomButton/CustomButton';
import { forgetPassword } from '../../../../services/resetPassword/resetPassword';
import secureLocalStorage from 'react-secure-storage';

const useStyles = makeStyles(theme => ({
	root: {
		background: 'url(assets/images/banner/bg.png) no-repeat center',
		color: theme.palette.primary.contrastText
	}
}));

function ForgotPasswordPage() {
	const dispatch = useDispatch();
	const classes = useStyles();
	const [isRequesting, setIsRequesting] = useState(false);
	const [errtxt, setErrtxt] = useState('');
	const { form, setForm } = useForm({
		email: ''
	});
	const user = useSelector(({ auth }) => auth.user);

	const handleChange = e => {
		if (!e.target.value.length) {
			// valune is not equal 0
			setErrtxt('Email is required');
		}
		if (e.target.name === 'email' && e.target.value.length) {
			setErrtxt('');
		}
		setForm({
			...form,
			[e.target.name]: e.target.value
		});
	};

	function handleSubmit(ev) {
		ev.preventDefault(); // refresh ko rokna
		if (/\S+@\S+\.\S+/.test(form.email)) {
			// format check
			setErrtxt('');
		} else {
			setErrtxt('Please provide a valid email.');
			return;
		}
		if (form.email.length === 0) {
			setErrtxt('Email is required');
			return;
		}
		setIsRequesting(true);
		const data = {
			username: Number(form.email) ? `+${form.email}` : form.email
		};
		forgetPassword(data)
			.then(response => {
				if (response.status === 200 && response.data.message === 'OTP has been sent on your email') {
					dispatch(
						Actions.showMessage({
							message: `${response.data.message}. Redirecting...`,
							variant: 'success',
							autoHideDuration: 2000
						})
					);
					setTimeout(() => {
						secureLocalStorage.setItem('time', new Date().getTime() + 180000);
						history.push({
							pathname: '/otp',
							state: {
								username: form.email,
								time: new Date().getTime() + 180000
							}
						});
					}, 2000);
					setIsRequesting(false);
				} else if (response.data.message === 'Invalid email') {
					setErrtxt('Invalid Email format.');
					setIsRequesting(false);
				}
			})
			.catch(err => {
				setIsRequesting(false);
				dispatch(
					Actions.showMessage({
						message: `${err.response.data.message}`,
						variant: 'error',
						autoHideDuration: 2000
					})
				);
			});
	}

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
							<Typography variant="h6" className="mt-16 mb-32 hellloooo hello-forget">
								Forgot your Password?
							</Typography>

							<p className="paraa">
								Resetting password is easy, Just enter the email you <br /> registered with the Perfect
								Day
							</p>
							<form
								name="recoverForm"
								noValidate
								className="flex flex-col justify-center w-full"
								onSubmit={handleSubmit}
							>
								<div className="insert">
									<TextField
										className="mb-16"
										autoFocus
										type="email"
										name="email"
										id="forgot-password-email"
										value={form.email}
										onChange={handleChange}
										label="Email Address"
										required
										fullWidth
										error={!!errtxt.length}
										helperText={errtxt}
									/>
								</div>
								{isRequesting ? (
									<div style={{ paddingLeft: '41%' }}>
										<CircularProgress size={35} />
									</div>
								) : (
									<div className="flex justify-center mt-32">
										<CustomButton type="submit" width={145}>
											Submit
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

export default ForgotPasswordPage;
