import FuseAnimate from '@fuse/core/FuseAnimate';
import { useForm } from '@fuse/hooks';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import { makeStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import clsx from 'clsx';
import React, { useState} from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import * as authActions from 'app/auth/store/actions';
import './Loginpagecss.css';
import IconButton from '@material-ui/core/IconButton';
import InputAdornment from '@material-ui/core/InputAdornment';
import VisibilityIcon from '@material-ui/icons/Visibility';
import VisibilityOffIcon from '@material-ui/icons/VisibilityOff';
import { CircularProgress } from '@material-ui/core';
import CustomButton from 'app/customComponents/CustomButton/CustomButton';

const useStyles = makeStyles(theme => ({
	root: {
		background: 'url(assets/images/banner/bg.png) no-repeat center',
		color: theme.palette.primary.contrastText
	}
}));
function LoginPage() {
	const dispatch = useDispatch();
	const classes = useStyles();
	const [hide, setHide] = useState(true);
	const [isLoggingIn, setIsLoggingIn] = useState(false);
	const [emailTxt, setEmailTxt] = useState('');
	const [pswdTxt, setPswdTxt] = useState('');
	const user = useSelector(({ auth }) => auth.user);

	const { form, setForm } = useForm({
		username: '',
		password: ''
	});

	const handleChange = e => {
		if (e.target.name === 'username' && !e.target.value.length) {
			setEmailTxt('Email is required');
		} else if (e.target.name === 'password' && !e.target.value.length) {
			setPswdTxt('Password is required');
		}
		if (e.target.name === 'username' && e.target.value.length) {
			setEmailTxt('');
		} else if (e.target.name === 'password' && e.target.value.length) {
			setPswdTxt('');
		}
		setForm({
			...form,
			[e.target.name]: e.target.value
		});
	};

	function handleSubmit(e) {
		e.preventDefault();
		if (form.username.length === 0) {
			setEmailTxt('Email is required');
		}
		if (form.password.length === 0) {
			setPswdTxt('Password is required');
		}
		if (form.username.length === 0 || form.password.length === 0) {
			return 0;
		}
		setIsLoggingIn(true);
		let username;
		if (Number.isFinite(Number(form.username))) {
			username = `+${form.username}`;
		} else {
			username = form.username;
		}
		const { password } = form;
		dispatch(authActions.submitLogin({ username, password }, setIsLoggingIn));
		return 1;
	}
	return (
		<div className={clsx(classes.root, 'flex flex-col flex-auto flex-shrink-0 items-center justify-center p-32')}>
			<div className="flex flex-col items-center justify-center w-full">
				<FuseAnimate animation="transition.expandIn">
					<Card className="login-width">
						<CardContent className="flex flex-col items-center justify-center p-32">
							<img
								width={150}
								className="mb-2 gd text-center logo-img"
								src="assets/images/logos/logo.png"
								alt="logo"
							/>
							<Typography variant="h6" className="mt-11 mb-32 hellloooo">
								Welcome to perfect day
							</Typography>
							<form
								name="loginForm"
								noValidate
								className="flex flex-col justify-center w-full"
								onSubmit={handleSubmit}
							>
								<div className="insert">
									<TextField
										className="mb-16"
										autoFocus
										type="email"
										id="email"
										label="Email or Phone number"
										name="username"
										value={form.username}
										onChange={handleChange}
										required
										fullWidth
										error={!!emailTxt.length}
										helperText={emailTxt}
									/>
								</div>
								<div className="insert">
									<TextField
										className="mb-4 "
										type={hide ? 'password' : 'text'}
										name="password"
										value={form.password}
										onChange={handleChange}
										id="password"
										label="Password"
										required
										fullWidth
										error={!!pswdTxt.length}
										helperText={pswdTxt}
										InputProps={{
											endAdornment: (
												<InputAdornment position="end">
													<IconButton onClick={() => setHide(!hide)}>
														{hide ? <VisibilityOffIcon /> : <VisibilityIcon />}
													</IconButton>
												</InputAdornment>
											)
										}}
									/>
								</div>
								<div className="right-forget-login">
									<h4>
										<Link to="/forgot-password">Forgot Password</Link>
									</h4>
								</div>
								{isLoggingIn ? (
									<div style={{ paddingLeft: '45%', paddingTop: '4%' }}>
										<CircularProgress size={35} />
									</div>
								) : (
									<div className="flex justify-center mt-32">
										<CustomButton type="submit" width={145}>
											Login
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
export default LoginPage;
