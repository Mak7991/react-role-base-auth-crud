/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable consistent-return */
import React, { useState, useEffect, useRef } from 'react';
import history from '@history';
import CustomButton from 'app/customComponents/CustomButton/CustomButton';
import { useDispatch } from 'react-redux';
import {
	CircularProgress,
	Avatar,
	TextField,
	FormControl,
	InputLabel,
	Select,
	MenuItem,
	FormHelperText,
	IconButton,
	Typography,
} from '@material-ui/core';
import FuseAnimate from '@fuse/core/FuseAnimate';
import './staff.css';
import { uploadFile } from 'app/services/imageUpload/imageUpload';
import { addStaff } from 'app/services/staff/staff';
import * as Actions from 'app/store/actions';
import CustomDatePicker from 'app/customComponents/CustomDatePicker/CustomDatePicker';
import dayjs from 'dayjs';
import { getImageUrl } from 'utils/utils';

function AddStaff() {
	const dispatch = useDispatch();
	const [form, setForm] = useState({});
	const [errTxts, setErrTxts] = useState({});
	const [isLoading, setIsLoading] = useState(false);
	const [selectedFile, setSelectedFile] = useState(null);
	const [preview, setPreview] = useState(null);
	const inputRef = useRef(null);
	const [dob_date, setDobDate] = useState(null);
	const [employment_date, setEmploymentDate] = useState(null);
	const [attachFile, setAttachFile] = useState([]);
	const ref = useRef(null);

	useEffect(() => {
		if (dob_date) {
			if (dayjs(dob_date).format('YYYY-MM-DD') === form.date_of_birth) {
				return;
			}
			form.date_of_birth = dayjs(dob_date).format('YYYY-MM-DD');
		} else {
			form.date_of_birth = '';
		}
	}, [dob_date, form.date_of_birth]);

	useEffect(() => {
		if (employment_date) {
			if (dayjs(employment_date).format('YYYY-MM-DD') === form.employment_date) {
				return;
			}
			form.employment_date = dayjs(employment_date).format('YYYY-MM-DD');
		} else {
			form.employment_date = '';
		}
	}, [employment_date, form.employment_date]);

	const handleChange = (ev) => {
		const { name, value } = ev.target;
		setErrTxts({ ...errTxts, [name]: [] });
		setForm({ ...form, [name]: value });
	};

	useEffect(() => {
		if (!selectedFile) {
			setPreview(null);
			return;
		}

		const objectUrl = URL.createObjectURL(selectedFile);
		setPreview(objectUrl);

		return () => URL.revokeObjectURL(objectUrl);
	}, [selectedFile]);

	const onSelectFile = (e) => {
		if (!e.target.files || e.target.files.length === 0) {
			setSelectedFile(null);
			return;
		}

		setSelectedFile(e.target.files[0]);
	};

	const removeItem = (index) => {
		setAttachFile(attachFile.filter((e, i) => i !== index));
	};

	function handleFileUpload(e) {
		const file = e.target.files;
		const file_name = Object.keys(file).map((key) => file[key]);
		if (!file_name) {
			return;
		}
		const validExtensions = ['pdf', 'jpg', 'jpeg', 'png'];
		const fileSize = 0.000001 * file_name.map((s) => s.size);
		if (validExtensions.includes(file_name.map((f) => f.name.split('.')[1]))) {
			dispatch(
				Actions.showMessage({
					message: 'Only images or pdf files are allowed!',
					autoHideDuration: 2500,
					variant: 'error',
				})
			);
			return;
		}
		if (fileSize > 2) {
			dispatch(
				Actions.showMessage({
					message: 'File size cannot exceed 2 MBs',
					autoHideDuration: 2500,
					variant: 'error',
				})
			);
			return;
		}
		setAttachFile([...attachFile, ...file_name]);
	}

	const handleSubmit = async () => {
		setErrTxts({});
		if (!form.first_name) {
			setErrTxts({ ...errTxts, first_name: 'This field is required' });
			return;
		}
		if (form.first_name && /[^a-zA-Z]/.test(form.first_name)) {
			setErrTxts({ ...errTxts, first_name: 'Please enter a valid name.' });
			return;
		}
		if (!form.last_name) {
			setErrTxts({ ...errTxts, last_name: 'This field is required' });
			return;
		}
		if (form.last_name && /[^a-zA-Z\- ]/.test(form.last_name)) {
			setErrTxts({ ...errTxts, last_name: 'Please enter a valid name.' });
			return;
		}
		if (!form.email) {
			setErrTxts({ ...errTxts, email: 'This field is required' });
			return;
		}
		if (!/^\S+@\S+\.\S+$/.test(form.email)) {
			setErrTxts({ ...errTxts, email: 'Please enter valid email' });
			return;
		}
		if (!form.phone) {
			setErrTxts({ ...errTxts, phone: 'This field is required' });
			return;
		}
		if (form.phone) {
			if (
				!Number.isFinite(
					Number(form.phone.split(' ').join('').split('-').join('').split('(').join('').split(')').join(''))
				)
			) {
				setErrTxts({ ...errTxts, phone: 'Please enter valid phone number' });
				return;
			}
		}
		if (form.emergency_name && /[^a-zA-Z ]/.test(form.emergency_name)) {
			setErrTxts({ ...errTxts, emergency_name: 'Please enter a valid name.' });
			return;
		}
		if (
			form.emergency_name &&
			(form.emergency_name.charAt(0) === ' ' ||
				form.emergency_name.charAt(form.emergency_name.length - 1) === ' ')
		) {
			setErrTxts({ ...errTxts, emergency_name: 'Please enter a valid name' });
			return;
		}
		if (!form.emergency_phone) {
			setErrTxts({ ...errTxts, emergency_phone: 'This field is required.' });
			return;
		}
		if (!form.position_type) {
			setErrTxts({ ...errTxts, position_type: 'This field is required.' });
			return;
		}
		if (!form.title) {
			setErrTxts({ ...errTxts, title: 'This field is required.' });
			return;
		}
		if (!form.admin) {
			setErrTxts({ ...errTxts, admin: 'This field is required.' });
			return;
		}
		if (form.emergency_phone) {
			if (
				!Number.isFinite(
					Number(
						form.emergency_phone
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
				setErrTxts({ ...errTxts, emergency_phone: 'Please enter valid phone number' });
				return;
			}
		}
		if (!form.date_of_birth) {
			setErrTxts({ ...errTxts, date_of_birth: 'This field is required.' });
			return;
		}
		if (!form.address) {
			setErrTxts({ ...errTxts, address: 'This field is required.' });
			return;
		}
		if (!form.employment_date) {
			setErrTxts({ ...errTxts, employment_date: 'This field is required.' });
			return;
		}
		if (selectedFile) {
			const filename = getImageUrl(selectedFile);
			setIsLoading(true);
			if (attachFile) {
				const uplaod_file = attachFile.map((e, i) => {
					return uploadFile(e, getImageUrl(e));
				});
				const file_ = await Promise.all(uplaod_file);
				form.document_urls = file_.map((e) => `${process.env.REACT_APP_S3_BASE_URL}${e}`);

				uploadFile(selectedFile, filename).then((response) => {
					form.photo = `${process.env.REACT_APP_S3_BASE_URL}${response}`;
					form.thumb = `${process.env.REACT_APP_S3_BASE_URL}${response}`;
					addStaff(form)
						.then((resp) => {
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
							if (err.response?.data?.errors) {
								setErrTxts(err.response.data.errors);
							} else {
								dispatch(
									Actions.showMessage({
										message: 'Failed to edit student information.',
										autoHideDuration: 1500,
										variant: 'error',
									})
								);
							}
						})
						.finally(() => setIsLoading(false));
				});
			} else if (!attachFile) {
				uploadFile(selectedFile, filename).then((response) => {
					form.photo = `${process.env.REACT_APP_S3_BASE_URL}${response}`;
					form.thumb = `${process.env.REACT_APP_S3_BASE_URL}${response}`;
					addStaff(form)
						.then((resp) => {
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
							if (err.response?.data?.errors) {
								setErrTxts(err.response.data.errors);
							} else {
								dispatch(
									Actions.showMessage({
										message: 'Failed to edit student information.',
										autoHideDuration: 1500,
										variant: 'error',
									})
								);
							}
						})
						.finally(() => setIsLoading(false));
				});
			}
		} else {
			setIsLoading(true);
			const uplaod_file = attachFile.map((e, i) => {
				return uploadFile(e, getImageUrl(e));
			});
			const file_ = await Promise.all(uplaod_file);
			form.document_urls = file_.map((e) => `${process.env.REACT_APP_S3_BASE_URL}${e}`);
			addStaff(form)
				.then((resp) => {
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
					if (err.response?.data?.errors) {
						setErrTxts(err.response.data.errors);
					} else {
						dispatch(
							Actions.showMessage({
								message: 'Failed to edit student information.',
								autoHideDuration: 1500,
								variant: 'error',
							})
						);
					}
				})
				.finally(() => setIsLoading(false));
		}
	};

	return (
		<FuseAnimate animation="transition.slideLeftIn" duration={600}>
			<div className="add_staff_main">
				<div className="edit-staff-cont mx-auto">
					<div className="flex justify-between items-end">
						<span className="text-2xl self-end mr-28" style={{ fontSize: '20px', fontWeight: '700' }}>
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
							Add Staff
						</span>
					</div>
					<div className="bg-white rounded edit-staff-form-cont">
						<div className="edit-staff-form-heading">
							<h1 style={{ fontSize: '18px' }}>Staff Information</h1>
						</div>
						<div className="grid grid-cols-4 mt-32" style={{ gap: 20 }}>
							<div
								onClick={() => inputRef.current.click()}
								id="upload-img"
								className="row-span-2 camera-holder"
								style={{ justifySelf: 'center' }}
							>
								<Avatar src={preview} style={{ width: 120, height: 120 }} />
								<div className="staff-pp-overlay">
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
							<TextField
								error={!!errTxts.first_name?.length}
								helperText={errTxts.first_name}
								name="first_name"
								id="first_name"
								onChange={handleChange}
								className="w-5/6"
								label="First Name"
							/>
							<TextField
								error={errTxts.last_name?.length}
								helperText={errTxts.last_name}
								name="last_name"
								id="last_name"
								onChange={handleChange}
								className="w-5/6"
								label="Last Name"
							/>
							<TextField
								error={!!errTxts.email?.length}
								helperText={errTxts.email}
								name="email"
								id="email"
								onChange={handleChange}
								className="w-5/6"
								label="Email Address"
							/>
							<TextField
								error={!!errTxts.phone?.length}
								helperText={errTxts.phone}
								name="phone"
								id="phone"
								onChange={handleChange}
								className="w-5/6"
								label="Contact Number"
							/>
							<TextField
								error={!!errTxts.emergency_name?.length}
								helperText={errTxts.emergency_name}
								name="emergency_name"
								id="emergency_name"
								onChange={handleChange}
								className="w-5/6"
								label="Emergency Contact Name"
							/>
							<TextField
								error={!!errTxts.emergency_phone?.length}
								helperText={errTxts.emergency_phone}
								name="emergency_phone"
								id="emergency_phone"
								onChange={handleChange}
								className="w-5/6"
								label="Emergency Contact Number"
							/>
							<div />
							<FormControl
								variant="standard"
								className="w-5/6"
								error={errTxts.position_type ? errTxts.position_type[0] : false}
							>
								<InputLabel id="positionLabel">Position Type</InputLabel>
								<Select
									value={form.position_type}
									onChange={handleChange}
									name="position_type"
									id="position_type"
									labelId="positionLabel"
									label="Position Type"
								>
									<MenuItem value="lead">
										<span id="lead"> Lead</span>
									</MenuItem>
									<MenuItem value="assistant">
										<span id="assistant"> Assistant</span>
									</MenuItem>
									<MenuItem value="admin">
										<span id="position-admin"> Admin</span>
									</MenuItem>
									<MenuItem value="cook">
										<span id="cook"> Cook</span>
									</MenuItem>
								</Select>
								{errTxts.position_type ? (
									<FormHelperText style={{ color: '#f44336' }}>
										{errTxts.position_type}
									</FormHelperText>
								) : null}
							</FormControl>
							<FormControl
								variant="standard"
								className="w-5/6"
								error={errTxts.title ? errTxts.title[0] : false}
							>
								<InputLabel id="hoursLabel">Hours</InputLabel>
								<Select
									value={form.title}
									onChange={handleChange}
									name="title"
									id="title"
									labelId="hoursLabel"
									label="Hours"
								>
									<MenuItem value="full-time">
										<span id="full-time">Full-time</span>
									</MenuItem>
									<MenuItem value="part-time">
										<span id="part-time">Part-time</span>
									</MenuItem>
								</Select>
								{errTxts.title ? (
									<FormHelperText style={{ color: '#f44336' }}>{errTxts.title}</FormHelperText>
								) : null}
							</FormControl>
							<FormControl
								variant="standard"
								className="w-5/6"
								error={errTxts.admin ? errTxts.admin[0] : false}
							>
								<InputLabel id="adminLabel">Admin</InputLabel>
								<Select
									value={form.admin}
									onChange={handleChange}
									name="admin"
									id="admin"
									labelId="adminLabel"
									label="Admin"
								>
									<MenuItem value="yes">
										<span id="yes">Yes</span>
									</MenuItem>
									<MenuItem value="no">
										<span id="no">No</span>
									</MenuItem>
								</Select>
								{errTxts.admin ? (
									<FormHelperText style={{ color: '#f44336' }}>{errTxts.admin}</FormHelperText>
								) : null}
							</FormControl>
							<div />
							<div className="w-5/6">
								<CustomDatePicker
									width="100%"
									errTxts={errTxts.date_of_birth}
									name="date_of_birth"
									value={dob_date}
									setValue={(d) => {
										setDobDate(d);
										setErrTxts({ ...errTxts, date_of_birth: '' });
									}}
									label="Date of Birth"
									disableFuture
									id="date-of-birth"
								/>
							</div>
							<TextField
								error={!!errTxts.address?.length}
								helperText={errTxts.address}
								name="address"
								id="address"
								onChange={handleChange}
								className="w-5/6"
								label="Address"
							/>
							<div className="w-5/6">
								<CustomDatePicker
									width="100%"
									errTxts={errTxts.employment_date}
									name="employment_date"
									value={employment_date}
									setValue={(d) => {
										setEmploymentDate(d);
										setErrTxts({ ...errTxts, employment_date: '' });
									}}
									label="Employment Date"
									id="employment_date"
								/>
							</div>
							<div />
							<div className="mt-20" style={{ height: '103px' }}>
								<Typography className="file-upload-label">Upload File</Typography>

								<div className="uplaod_main_div">
									<div className="uplaod_div">
										<img
											src="assets/images/addFile.png"
											alt="Upload file"
											style={{ cursor: 'pointer' }}
											onClick={() => ref.current.click()}
										/>
										<input
											ref={ref}
											style={{ display: 'none' }}
											onChange={handleFileUpload}
											multiple
											type="file"
											name="document_urls"
											accept=".jpg, .png, .jpeg, .pdf"
										/>
									</div>
									<div className="upload_file_div">
										{attachFile?.map((e, i) =>
											e.name.split('.')[e.name.split('.').length - 1] !== 'pdf' ? (
												<div key={i} className="attach_file_div">
													<img
														src={URL.createObjectURL(e)}
														style={{
															width: '87px',
															height: '84px',
															objectFit: 'cover',
														}}
													/>
													<div
														className="file-cross file-cross-img"
														onClick={() => removeItem(i)}
													>
														x
													</div>
												</div>
											) : (
												<div key={i} className="attach_file_div">
													<img
														src="assets/images/pdf_thumbnail.png"
														style={{
															width: '87px',
															height: '84px',
															objectFit: 'cover',
														}}
													/>
													<div
														className="file-cross file-cross-img"
														onClick={() => removeItem(i)}
													>
														x
													</div>
												</div>
											)
										)}
									</div>
								</div>
							</div>
						</div>
						<div className="flex justify-center" style={{ gap: 20, marginTop: 50 }}>
							{isLoading ? (
								<CircularProgress size={35} />
							) : (
								<>
									<CustomButton
										variant="secondary"
										width="140px"
										id="cancel"
										onClick={() => history.goBack()}
									>
										Cancel
									</CustomButton>
									<CustomButton variant="primary" width="140px" id="submit" onClick={handleSubmit}>
										Submit
									</CustomButton>
								</>
							)}
						</div>
					</div>
				</div>
			</div>
		</FuseAnimate>
	);
}

export default AddStaff;
