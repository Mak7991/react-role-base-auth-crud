import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import * as Actions from 'app/store/actions';
import { CircularProgress } from '@material-ui/core';
import TextField from '@material-ui/core/TextField';
import IconButton from '@material-ui/core/IconButton';
import InputAdornment from '@material-ui/core/InputAdornment';
import VisibilityIcon from '@material-ui/icons/Visibility';
import VisibilityOffIcon from '@material-ui/icons/VisibilityOff';
import { useForm } from '@fuse/hooks';
import { resetPassword } from 'app/services/Superadminprodile/Superadminprodile';
import './adminDetail.css';
import CustomButton from 'app/customComponents/CustomButton/CustomButton';

function ResetDialoguebox({ setRefresh, refresh }) {
	const [isRequesting, setIsRequesting] = useState(false);
	const dispatch = useDispatch();
	const [hide1, setHide1] = useState(true);
	const [hide2, setHide2] = useState(true);
	const [hide3, setHide3] = useState(true);
	const [isSendingReq, setIsSendingReq] = useState(false);
	const [pswdTxt, setPswdTxt] = useState('');
	const [newPswdTxt, setNewPswdTxt] = useState('');
	const [pswd2Txt, setPswd2Txt] = useState('');
	const [errTxts, setErrTxts] = useState({});
	const userRole = useSelector(({ auth }) => auth.user.role);
	const isSuperSchoolAdmin = userRole[0] === 'super_school_admin';

	const handleChange = e => {
		setForm({
			...form,
			[e.target.name]: e.target.value
		});
		if (e.target.name === 'password_confirmation') {
			setPswd2Txt('');
		}
		if (e.target.name === 'old_password') {
			setErrTxts({});
		}
		if (e.target.name === 'password') {
			setNewPswdTxt('');
		}
	};

	const { form, setForm } = useForm({
		old_password: '',
		password: '',
		password_confirmation: ''
	});

	function handleSubmit(e) {
		e.preventDefault();

		if (!form.old_password) {
			setErrTxts({ password: 'This field is required' });
			return;
		}

		if (!form.password.length) {
			setNewPswdTxt('This field is required');
			return;
		}

		if (form.password.length < 8) {
			setNewPswdTxt('Password Length must be eight or more characters.');
			return;
		}
		if (form.password.toUpperCase() === form.password) {
			setNewPswdTxt('Password must contain one lowercase string.');
			return;
		}
		if (form.password.toLowerCase() === form.password) {
			setNewPswdTxt('Password must contain one uppercase character.');
			return;
		}
		if (!/\d/.test(form.password)) {
			setNewPswdTxt('Password must contain one number.');
			return;
		}
		if (!/[ `!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?~]/.test(form.password)) {
			setNewPswdTxt('Password must contain one special character.');
			return;
		}
		if (!form.password_confirmation) {
			setPswd2Txt('This field is required');
			return;
		}

		if (form.password !== form.password_confirmation) {
			setPswd2Txt('Password and Confirm Password must be same.');
			return;
		}

		if (form.old_password === form.password) {
			setNewPswdTxt('New password cannot be the same as old password.');
			return;
		}

		setIsRequesting(true);
		const data = {
			old_password: form.old_password,
			password: form.password,
			password_confirmation: form.password_confirmation
		};
		resetPassword(data, isSuperSchoolAdmin)
			.then(response => {
				// setUsername(null);
				setIsRequesting(false);
				dispatch(
					Actions.showMessage({
						message: `Password updated successfully.`,
						variant: 'success',
						autoHideDuration: 3000
					})
				);
				setRefresh(!refresh);
				dispatch(Actions.closeDialog());
			})
			.catch(err => {
				setIsRequesting(false);
				dispatch(
					Actions.showMessage({
						message: err.response.data.message || 'Failed to update password',
						autoHideDuration: 1500,
						variant: 'error'
					})
				);
				if (err.response.data.errors) {
					setErrTxts(err.response.data.errors);
				}
			});
	}

	return (
		<div className="popupp">
			<div className="top-popup">
				{/* <div className='top-baar flex items-center flex-nowrap justify-between mx-auto'>
					<div className='text-2xl font-extrabold'>
						<h2>Reset Password</h2>
					</div>
					<span className='flex justify-between"' onClick={() => dispatch(Actions.closeDialog())}>x</span>
				</div> */}

				<div className="flex justify-between school-list-headerr">
					<div className="text-2xl font-extrabold ">
						<h1 className="left-hd" style={{ fontSize: '20px', fontWeight: '700' }}>
							Reset Password
						</h1>
					</div>
					<div>
						<i
							style={{ cursor: 'pointer' }}
							className="fas fa-times"
							onClick={() => dispatch(Actions.closeDialog())}
						/>
					</div>
				</div>
				<form>
					<div className="insert">
						<TextField
							className="mb-16 w-full"
							type={hide3 ? 'password' : 'text'}
							name="old_password"
							value={form.old_password}
							onChange={handleChange}
							required
							id="old_password"
							label="Old Password"
							error={!!errTxts.password}
							helperText={errTxts.password}
							InputProps={{
								endAdornment: (
									<InputAdornment>
										<IconButton onClick={() => setHide3(!hide3)}>
											{hide3 ? <VisibilityOffIcon /> : <VisibilityIcon />}
										</IconButton>
									</InputAdornment>
								)
							}}
						/>
					</div>
					<div className="insert">
						<TextField
							className="mb-16 w-full"
							type={hide1 ? 'password' : 'text'}
							name="password"
							value={form.password}
							onChange={handleChange}
							required
							id="password"
							label="New Password"
							error={!!newPswdTxt.length}
							helperText={newPswdTxt}
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
							name="password_confirmation"
							value={form.password_confirmation}
							onChange={handleChange}
							required
							id="password_confirmation"
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
				</form>

				{isRequesting ? (
					<CircularProgress />
				) : (
					<>
						<div className="flex justify-center" style={{ gap: 20 }}>
							<CustomButton
								variant="secondary"

								width="135px"
								height="35px"
								fontSize="15px"
								onClick={() => dispatch(Actions.closeDialog())}
							>
								Cancel
							</CustomButton>
							<CustomButton
								variant="primary"

								width="135px"
								fontSize="15px"
								height="35px"
								type="submit"
								onClick={e => handleSubmit(e)}
							>
								Reset
							</CustomButton>

						</div>
					</>
				)}
			</div>
		</div>
	);
}

export default ResetDialoguebox;
