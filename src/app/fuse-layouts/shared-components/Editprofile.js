/* eslint-disable consistent-return */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React, { useState, useEffect, useRef } from 'react';
import { TextField, Avatar, CircularProgress, IconButton } from '@material-ui/core';
import './adminDetail.css';
import CustomButton from 'app/customComponents/CustomButton/CustomButton';
import history from '@history';
import { updateProfile } from 'app/services/Superadminprodile/Superadminprodile';
import { uploadFile } from 'app/services/imageUpload/imageUpload';
import { useDispatch, useSelector } from 'react-redux';
import * as Actions from 'app/store/actions';
import * as UserActions from 'app/auth/store/actions/user.actions';
import jwtService from 'app/services/jwtService';
import { getImageUrl } from 'utils/utils';

function Editprofile() {
	const inputRef = useRef(null);
	const [preview, setPreview] = useState(modifieduser?.photo);
	const [selectedFile, setSelectedFile] = useState();
	const [errTxts, setErrTxts] = useState({});
	const [isSaving, setIsSaving] = useState(false);
	const dispatch = useDispatch();
	const { role: userRole, data, school } = useSelector(({ auth }) => auth.user);
	const isSuperSchoolAdmin = userRole[0] === 'super_school_admin';
	// modified data js

	const [modifieduser, setModifieduser] = useState({
		// photo:'',
		// first_name:'',
		// last_name:'',
		// phone:'',
		// email:''
	});
	const [isLoading, setIsLoading] = useState(true);
	const handleChange = (e) => {
		const { name, value } = e.target;
		setErrTxts({ ...errTxts, [name]: '' });
		setModifieduser({ ...modifieduser, [name]: value });
	};

	useEffect(() => {
		jwtService
			.getProfile(isSuperSchoolAdmin)
			.then((res) => {
				setIsLoading(false);
				setModifieduser(res.data);
			})
			.catch((error) => {
				setIsLoading(false);
				console.error('data is invalid', error);
			});
	}, []);

	useEffect(() => {
		if (!selectedFile) {
			setPreview(modifieduser?.photo);
			return;
		}

		const objectUrl = URL.createObjectURL(selectedFile);
		setPreview(objectUrl);

		return () => URL.revokeObjectURL(objectUrl);
	}, [selectedFile, modifieduser?.photo]);

	const onSelectFile = (e) => {
		if (!e.target.files || e.target.files.length === 0) {
			setSelectedFile(null);
			return;
		}

		setSelectedFile(e.target.files[0]);
	};
	// end image js

	// update data
	const handleSubmit = () => {
		if (!modifieduser.first_name) {
			setErrTxts({ ...errTxts, first_name: 'This field is required' });
			return;
		}
		if (modifieduser.first_name && /[^a-zA-Z]/.test(modifieduser.first_name)) {
			setErrTxts({ ...errTxts, first_name: 'Please enter a valid name.' });
			return;
		}
		if (!modifieduser.last_name) {
			setErrTxts({ ...errTxts, last_name: 'This field is required' });
			return;
		}
		if (modifieduser.last_name && /[^a-zA-Z]/.test(modifieduser.last_name)) {
			setErrTxts({ ...errTxts, last_name: 'Please enter a valid name.' });
			return;
		}

		if (modifieduser.phone) {
			if (
				!Number.isFinite(
					Number(
						modifieduser.phone
							.split(' ')
							.join('')
							.split('-')
							.join('')
							.split('(')
							.join('')
							.split(')')
							.join('')
					)
				)
			) {
				setErrTxts({ ...errTxts, phone: 'Please enter valid phone number' });
				return;
			}
		}

		if (!modifieduser.email) {
			setErrTxts({ ...errTxts, email: 'This field is required' });
			return;
		}
		if (!/^\S+@\S+\.\S+$/.test(modifieduser.email)) {
			setErrTxts({ ...errTxts, email: 'Please enter valid email' });
			return;
		}

		// if (modifieduser.email.toLowerCase() === data.email.toLowerCase()) {
		// 	delete modifieduser.email;
		// }

		if (selectedFile) {
			const filename = getImageUrl(selectedFile);
			setIsSaving(true);
			uploadFile(selectedFile, filename).then((response) => {
				modifieduser.image = `${process.env.REACT_APP_S3_BASE_URL}${response}`;
				updateProfile(modifieduser, isSuperSchoolAdmin)
					.then((_resp) => {
						jwtService.getProfile(isSuperSchoolAdmin).then((res) => {
							const user = {
								data: {
									email: res.data.email,
									displayName: `${res.data.first_name} ${res.data.last_name}`,
									photoURL: res.data.photo,
									...res.data,
								},
								school: isSuperSchoolAdmin ? school : {},
								doNotRedirect: 1,
								role: [isSuperSchoolAdmin ? 'super_school_admin' : res.data.role],
							};
							dispatch(UserActions.setUserData(user));
						});
						dispatch(
							Actions.showMessage({
								message: 'Profile updated Successfully',
								autoHideDuration: 1500,
								variant: 'success',
							})
						);
						history.goBack();
					})
					.catch((err) => {
						if (err.response?.data?.errors) {
							setErrTxts(err.response.data.errors);
						} else {
							dispatch(
								Actions.showMessage({
									message: 'Failed to edit modifieduser information.',
									autoHideDuration: 1500,
									variant: 'error',
								})
							);
						}
					})
					.finally(() => setIsSaving(false));
			});
		} else {
			setIsSaving(true);
			updateProfile(modifieduser, isSuperSchoolAdmin)
				.then((resp) => {
					jwtService
						.getProfile(isSuperSchoolAdmin)
						.then((res) => {
							const user = {
								data: {
									email: res.data.email,
									displayName: `${res.data.first_name} ${res.data.last_name}`,
									photoURL: res.data.photo,
									...res.data,
								},
								school: isSuperSchoolAdmin ? school : {},
								doNotRedirect: 1,
								role: [isSuperSchoolAdmin ? 'super_school_admin' : res.data.role],
							};
							dispatch(UserActions.setUserData(user));
						})
						.catch((err) => {
							console.log({ ...err });
						});
					dispatch(
						Actions.showMessage({
							message: resp.data.message,
							autoHideDuration: 1500,
							variant: 'success',
						})
					);
					history.goBack();
				})
				.catch((err) => {
					console.log({ ...err });
					// if (err.response?.data?.errors) {
					// 	setErrTxts(err.response.data.errors);
					// } else {
					// 	dispatch(
					// 		Actions.showMessage({
					// 			message: err.response.message,
					// 			autoHideDuration: 1500,
					// 			variant: 'error'
					// 		})
					// 	);
					// }
				})
				.finally(() => setIsSaving(false));
		}
	};

	return (
		<>
			<div className="profile-cont mx-auto">
				<div className="profileinfo flex items-center flex-nowrap justify-between mx-auto">
					{/* <span className="personal-hdd text-2xl self-end font-extrabold ">
					<h1>Edit Profile</h1>
				    </span> */}
					<span className="totalRooms-heading" style={{ fontSize: '20px', fontWeight: '700' }}>
						<span className="">
							<IconButton
								onClick={() => {
									history.goBack();
								}}
							>
								<img
									src="assets/images/arrow-long.png"
									alt="filter"
									width="24px"
									className="backBtn-img"
								/>
							</IconButton>
						</span>
						Edit Profile
					</span>
				</div>
				<div className="bg-white rounded   mx-auto profile-bgg">
					<div className="flex">
						<div className="flex justify-between">
							<div
								className="relative pic-upload-overlay cursor-pointer mx-40 flex-grow "
								onClick={() => inputRef.current.click()}
							>
								<Avatar
									style={{ height: '140px', width: '140px' }}
									src={preview}
									className="imageupload"
								/>
								<div className="ppinputoverlayy personaleditt">
									<i className="fa fa-2x fa-camera" />
								</div>
								<input
									onChange={onSelectFile}
									type="file"
									name="image"
									id="image"
									className="hidden"
									ref={inputRef}
								/>
							</div>
							{isLoading ? (
								<div className="flex justify-center" style={{ marginLeft: '240px' }}>
									<CircularProgress className="m-auto justtify-center items-center" />
								</div>
							) : (
								<div className="grid grid-cols-2 flex-grow pl-20">
									<div className="margin-33 field-marginn">
										<TextField
											helperText={errTxts.first_name}
											error={errTxts.first_name}
											onChange={handleChange}
											value={modifieduser.first_name}
											name="first_name"
											label="First Name"
										/>
									</div>
									<div className="margin0-33 field-marginn">
										<TextField
											helperText={errTxts.last_name}
											error={errTxts.last_name}
											onChange={handleChange}
											value={modifieduser.last_name}
											name="last_name"
											label="Last Name"
										/>
									</div>
									<div className="margin0-33 field-marginn">
										<TextField
											onChange={handleChange}
											value={modifieduser.phone}
											name="phone"
											label="Contact Number"
											helperText={errTxts.phone}
											error={errTxts.phone}
										/>
									</div>

									<div className="margin0-33 field-marginn">
										<TextField
											onChange={handleChange}
											value={modifieduser.email}
											name="email"
											label="Email Address"
											helperText={errTxts.email}
											error={errTxts.email}
											className="capitalize-text"
											disabled={modifieduser.role !== 'super_admin'}
										/>
									</div>
								</div>
							)}
						</div>
					</div>
					<div className="btnedit">
						{!isSaving ? (
							<div className=" center-btn">
								<CustomButton
									variant="secondary"
									width={140}
									onClick={() => {
										history.goBack();
									}}
								>
									Cancel
								</CustomButton>

								<CustomButton variant="primary" width={140} onClick={handleSubmit}>
									Update
								</CustomButton>
							</div>
						) : (
							<div className="flex justify-center">
								<CircularProgress className="mx-auto" />
							</div>
						)}
					</div>
				</div>
			</div>
		</>
	);
}

export default Editprofile;
