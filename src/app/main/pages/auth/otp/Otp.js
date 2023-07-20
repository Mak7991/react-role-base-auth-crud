import FuseAnimate from '@fuse/core/FuseAnimate';
import { useForm } from '@fuse/hooks';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import clsx from 'clsx';
import React, { useState, useEffect } from 'react';
import * as Actions from 'app/store/actions';
import './Otp.css';
import { CircularProgress } from '@material-ui/core';
import history from '@history';
import { useDispatch } from 'react-redux';
import CustomButton from 'app/customComponents/CustomButton/CustomButton';
import { forgetPassword, verifyOtp } from '../../../../services/resetPassword/resetPassword';
import secureLocalStorage from 'react-secure-storage';

const useStyles = makeStyles(theme => ({
	root: {
		background: 'url(assets/images/banner/bg.png) no-repeat center',
		color: theme.palette.primary.contrastText
	}
}));
function OtpPage() {
	const dispatch = useDispatch();
	const [username] = useState(history?.location?.state?.username);
	const classes = useStyles();
	const [isRequesting, setIsRequesting] = useState(false);
	const [time, setTime] = useState(secureLocalStorage.getItem('time'));
	const currentTime = new Date().getTime();
	const diff = time - currentTime;
	const [sec, setSec] = useState(diff > 0 ? Math.floor((diff % (1000 * 60)) / 1000) : 0);
	const [min, setMin] = useState(diff > 0 ? Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)) : 0);
	// const [time, setTime] = useState(180);
	const { form, handleChange } = useForm({
		otp1: null,
		otp2: null,
		otp3: null,
		otp4: null
	});
	useEffect(() => {
		const myInterval = setInterval(() => {
			const currentTime = new Date().getTime();
			const diff = time - currentTime;
			if (!(sec || min)) {
			} else if (diff <= 0) {
				setSec(0);
				setMin(0);
			} else {
				setMin(Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)));
				setSec(Math.floor((diff % (1000 * 60)) / 1000));
			}
		}, 1000);
		return () => {
			clearInterval(myInterval);
		};
	}, [sec, min, time]);

	useEffect(() => {
		if (!username) {
			dispatch(
				Actions.showMessage({
					message: 'Please enter Email to recieve OTP.',
					variant: 'error',
					autoHideDuration: 3000
				})
			);
			history.push('/forgot-password');
		}
	}, [dispatch, username]);

	const inputfocus = elmnt => {
		if (elmnt.key === 'Backspace' || elmnt.key === 'ArrowLeft' || elmnt.key === 'ArrowDown') {
			const next = elmnt.target.tabIndex - 2;
			if (next > -1) {
				elmnt.target.form.elements[next].focus();
			}
		} else if (elmnt.key === 'Tab' || elmnt.key === 'Shift') {
			// Do nothing, follow default behaviour
		} else {
			const next = elmnt.target.tabIndex;
			if (next < 4) {
				elmnt.target.form.elements[next].focus();
			}
		}
	};

	function handleSubmit(ev) {
		ev.preventDefault();
		setIsRequesting(true);
		const data = {
			username,
			otp: `${form.otp1}${form.otp2}${form.otp3}${form.otp4}`
		};
		if (Number.isNaN(Number(data.otp)) || data.otp.toString().length !== 4) {
			dispatch(
				Actions.showMessage({
					message:
						form.otp1 && form.otp2 && form.otp3 && form.otp4
							? 'Please enter correct OTP'
							: 'Please enter OTP',
					variant: 'error',
					autoHideDuration: 2000
				})
			);
			setIsRequesting(false);
			return;
		}

		verifyOtp(data)
			.then(response => {
				dispatch(
					Actions.showMessage({
						message: 'OTP verified. Redirecting...',
						variant: 'success',
						autoHideDuration: 2000
					})
				);
				setIsRequesting(false);
				setTimeout(() => {
					history.push({
						pathname: '/reset-password',
						state: {
							username
						}
					});
				}, 2000);
			})
			.catch(err => {
				dispatch(
					Actions.showMessage({
						message: 'Entered OTP is not correct',
						variant: 'error'
					})
				);
			})
			.finally(() => {
				setIsRequesting(false);
			});
	}

	const handleResend = () => {
		setIsRequesting(true);
		forgetPassword({ username })
			.then(response => {
				if (response.status === 200) {
					dispatch(
						Actions.showMessage({
							message: `${response.data.message}.`,
							variant: 'success',
							autoHideDuration: 2000
						})
					);
					const newTime = new Date().getTime() + 180000;
					setTime(newTime);
					setMin(2);
					setSec(59);
					secureLocalStorage.setItem('time', newTime);
				}
			})
			.catch(err => {
				dispatch(
					Actions.showMessage({
						message: `Failed to resend OTP, please try again.`,
						variant: 'error',
						autoHideDuration: 2000
					})
				);
			})
			.finally(() => {
				setIsRequesting(false);
			});
	};
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
								Please Enter OTP
							</Typography>
							<p className="para paraName paraotp">
								We have sent you an <span>OTP</span> on your email address <br />
								{min || sec ? (
									<p style={{ marginTop: 20 }}>
										{min.toLocaleString('en-US', {
											minimumIntegerDigits: 2,
											useGrouping: false
										})}
										:
										{sec.toLocaleString('en-US', {
											minimumIntegerDigits: 2,
											useGrouping: false
										})}
									</p>
								) : (
									''
								)}
							</p>
							<form
								name="recoverForm"
								noValidate
								className="flex flex-col justify-center w-full"
								onSubmit={handleSubmit}
							>
								<div className="otpContainer">
									<input
										type="tel"
										className="otpInput"
										name="otp1"
										autoComplete="off"
										value={form.otp1}
										onChange={e => handleChange(e)}
										tabIndex="1"
										maxLength="1"
										onKeyUp={e => inputfocus(e)}
										required
									/>
									<input
										type="tel"
										className="otpInput"
										name="otp2"
										autoComplete="off"
										value={form.otp2}
										onChange={e => handleChange(e)}
										tabIndex="2"
										maxLength="1"
										onKeyUp={e => inputfocus(e)}
										required
									/>
									<input
										type="tel"
										className="otpInput"
										name="otp3"
										autoComplete="off"
										value={form.otp3}
										onChange={e => handleChange(e)}
										tabIndex="3"
										maxLength="1"
										onKeyUp={e => inputfocus(e)}
										required
									/>
									<input
										type="tel"
										className="otpInput"
										name="otp4"
										autoComplete="off"
										value={form.otp4}
										onChange={e => handleChange(e)}
										tabIndex="4"
										maxLength="1"
										onKeyUp={e => inputfocus(e)}
										required
									/>
								</div>
								<div className="otp-sub">
									{isRequesting ? (
										<div style={{ paddingLeft: '41%' }}>
											<CircularProgress size={35} />
										</div>
									) : (
										<div className="flex items-center">
											{/* If min or sec are not zero button is disabled */}
											{/* <button type="button" disabled={min || sec} onClick={() => handleResend()}>
												Resend OTP
											</button> */}
											<div className="flex justify-center">
												<CustomButton
													onClick={handleResend}
													width={130}
													height={41}
													disabled={min || sec}
												>
													Resend OTP
												</CustomButton>
											</div>

											{/* <input type="submit" value="Verify OTP" className="otpbtn" /> */}
											<div className="flex justify-center">
												<CustomButton width={130} height={41} type="submit">
													Verify OTP
												</CustomButton>
											</div>
										</div>
									)}
								</div>
							</form>
						</CardContent>
					</Card>
				</FuseAnimate>
			</div>
		</div>
	);
}
export default OtpPage;
