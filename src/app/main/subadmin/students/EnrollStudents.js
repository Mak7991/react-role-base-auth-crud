import React, { useEffect, useState, useRef } from 'react';
import {
	TextField,
	InputLabel,
	MenuItem,
	FormControl,
	Select,
	FormHelperText,
	CircularProgress,
	Avatar,
	IconButton,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import CustomButton from 'app/customComponents/CustomButton/CustomButton';
import { getRoomsEnrollStd } from 'app/services/rooms/rooms';
import { enrollStudent, getExistingParents } from 'app/services/students/students';
import { uploadFile } from 'app/services/imageUpload/imageUpload';
import './enrollStudent.css';
import { useDispatch } from 'react-redux';
import * as Actions from 'app/store/actions';
import dayjs from 'dayjs';
import history from '@history';
import CustomDatePicker from 'app/customComponents/CustomDatePicker/CustomDatePicker';
import Autocomplete from '@material-ui/lab/Autocomplete';
import FuseScrollbars from '@fuse/core/FuseScrollbars';
import { scrollIntoView } from 'utils/utils';
import { getImageUrl } from 'utils/utils';

const useStyles = makeStyles({
	select: {
		'&:before': {
			borderBottom: 'none',
		},
		'&:after': {
			borderBottom: 'none',
		},
		'&:not(.Mui-disabled):hover::before': {
			borderBottom: 'none',
		},
		'& .MuiSelect-select:focus': {
			backgroundColor: 'inherit',
		},
		'& .MuiSvgIcon-root': {
			color: 'inherit',
		},
		color: 'inherit',
		'&:hover': {
			color: 'inherit',
		},
	},
	content: {
		position: 'relative',
		display: 'flex',
		overflow: 'auto',
		flex: '1 1 auto',
		flexDirection: 'column',
		width: '100%',
		'-webkit-overflow-scrolling': 'touch',
		zIndex: 2,
	},
});
function EnrollStudents() {
	const classes = useStyles();
	const dispatch = useDispatch();
	const [form, setForm] = useState({});
	const [rooms, setRooms] = useState([]);
	const [page, setPage] = useState(1);
	const [errTxts, setErrTxts] = useState({});
	const [isLoading, setIsLoading] = useState(false);
	const [date, setDate] = useState(null);
	const [existingParents, setExistingParents] = useState([]);
	const [parentEmail, setParentEmail] = useState('');
	const [role, setRole] = useState('parent');
	const [loadingParents, setLoadingParents] = useState(false);
	const [preview, setPreview] = useState();
	const [selectedFile, setSelectedFile] = useState(null);
	const inputRef = useRef(null);

	useEffect(() => {
		const timeout = setTimeout(() => {
			setLoadingParents(true);
			getExistingParents(parentEmail)
				.then((res) => {
					setExistingParents(res.data.data);
					setLoadingParents(false);
				})
				.catch((err) => {
					console.log({ ...err });
					setLoadingParents(false);
				});
		}, 1000);
		return () => {
			clearTimeout(timeout);
		};
	}, [parentEmail]);

	useEffect(() => {
		if (!selectedFile) {
			setPreview(undefined);
			return;
		}

		const objectUrl = URL.createObjectURL(selectedFile);
		setPreview(objectUrl);

		return () => URL.revokeObjectURL(objectUrl);
	}, [selectedFile]);

	const onSelectFile = (e) => {
		if (!e.target.files || e.target.files.length === 0) {
			setSelectedFile(undefined);
			return;
		}

		setSelectedFile(e.target.files[0]);
	};

	const handleSubmit = (ev) => {
		ev.preventDefault();
		setErrTxts({});
		if (!form.first_name) {
			setErrTxts({ ...errTxts, first_name: 'This field is required' });
			scrollIntoView('fname-student');
			return;
		}
		if (form.first_name && /[^a-zA-Z]/.test(form.first_name)) {
			setErrTxts({ ...errTxts, first_name: 'Please enter a valid name.' });
			scrollIntoView('fname-student');
			return;
		}
		if (!form.last_name) {
			setErrTxts({ ...errTxts, last_name: 'This field is required' });
			scrollIntoView('lname-student');
			return;
		}
		if (form.last_name && /[^a-zA-Z]/.test(form.last_name)) {
			setErrTxts({ ...errTxts, last_name: 'Please enter a valid name.' });
			scrollIntoView('lname-student');
			return;
		}
		if (!form.dob) {
			setErrTxts({ ...errTxts, dob: 'This field is required' });
			scrollIntoView('date-of-birth');
			return;
		}
		if (!form.room_id) {
			setErrTxts({ ...errTxts, room_id: 'This field is required' });
			scrollIntoView('homeroom');
			return;
		}
		if (!form.gender) {
			setErrTxts({ ...errTxts, gender: 'This field is required' });
			scrollIntoView('gender');
			return;
		}
		if (!form.isNew) {
			setErrTxts({ ...errTxts, isNew: 'This field is required' });
			scrollIntoView('isNew');
			return;
		}
		if (form.isNew === 1) {
			if (!form.parent_first_name) {
				setErrTxts({ ...errTxts, parent_first_name: 'This field is required' });
				scrollIntoView('parent_first_name');
				return;
			}
			if (form.parent_first_name && /[^a-zA-Z]/.test(form.parent_first_name)) {
				setErrTxts({ ...errTxts, parent_first_name: 'Please enter a valid name.' });
				scrollIntoView('parent_first_name');
				return;
			}
			if (!form.parent_last_name) {
				setErrTxts({ ...errTxts, parent_last_name: 'This field is required' });
				scrollIntoView('parent_last_name');
				return;
			}
			if (form.parent_last_name && /[^a-zA-Z]/.test(form.parent_last_name)) {
				setErrTxts({ ...errTxts, parent_last_name: 'Please enter a valid name.' });
				scrollIntoView('parent_last_name');
				return;
			}
			if (!form.relation_with_child) {
				setErrTxts({ ...errTxts, relation_with_child: 'This field is required' });
				scrollIntoView('relation_with_child');
				return;
			}
			if (!form.parent_phone) {
				setErrTxts({ ...errTxts, parent_phone: 'This field is required' });
				scrollIntoView('parent_phone');
				return;
			}
			if (!form.parent_email) {
				setErrTxts({ ...errTxts, parent_email: 'This field is required' });
				scrollIntoView('parent_email');
				return;
			}
			if (!/^\S+@\S+\.\S+$/.test(form.parent_email)) {
				setErrTxts({ ...errTxts, parent_email: 'Please enter valid email' });
				scrollIntoView('parent_email');
				return;
			}
			if (form.parent_phone) {
				if (
					!Number.isFinite(
						Number(
							form.parent_phone
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
					setErrTxts({ ...errTxts, parent_phone: 'Please enter valid phone number' });
					scrollIntoView('parent_phone');
					return;
				}
			}
		}
		if (form.isNew === 2) {
			if (!form.parent_id) {
				setErrTxts({ ...errTxts, parent_id: 'This field is required' });
				scrollIntoView('parent_id');
				return;
			}
		}
		if (form.isNew === 1) {
			form.emergency_contact = true;
		}
		if (form.isNew === 2) {
			form.emergency_contact = true;
		}
		if (selectedFile) {
			const filename = getImageUrl(selectedFile)
			setIsLoading(true);
			uploadFile(selectedFile, filename).then((response) => {
				form.photo = `${process.env.REACT_APP_S3_BASE_URL}${response}`;
				form.thumb = `${process.env.REACT_APP_S3_BASE_URL}${response}`;
				enrollStudent(form)
					.then((res) => {
						dispatch(
							Actions.showMessage({
								message: 'Student Enrolled Successfully.',
								autoHideDuration: 1500,
								variant: 'success',
							})
						);
						history.push('/students');
					})
					.catch((err) => {
						dispatch(
							Actions.showMessage({
								message: 'Failed to enroll student.',
								autoHideDuration: 1500,
								variant: 'error',
							})
						);
						if (err.response.data.errors) {
							setErrTxts(err.response.data.errors);
						}
					})
					.finally(() => {
						setIsLoading(false);
					});
			});
		} else {
			setIsLoading(true);
			form.photo = `${
				process.env.REACT_APP_S3_BASE_URL
			}${'public/images/front/2021-11-24_08_57_01_personavatar_3x.jpeg'}`;
			form.thumb = `${
				process.env.REACT_APP_S3_BASE_URL
			}${'public/images/front/2021-11-24_08_57_01_personavatar_3x.jpeg'}`;
			enrollStudent(form)
				.then((res) => {
					dispatch(
						Actions.showMessage({
							message: 'Student Enrolled Successfully.',
							autoHideDuration: 1500,
							variant: 'success',
						})
					);
					history.push('/students');
				})
				.catch((err) => {
					dispatch(
						Actions.showMessage({
							message: 'Failed to enroll student.',
							autoHideDuration: 1500,
							variant: 'error',
						})
					);
					if (err.response.data.errors) {
						setErrTxts(err.response.data.errors);
					}
				})
				.finally(() => {
					setIsLoading(false);
				});
		}
	};

	const handleChange = (ev) => {
		const { name, value } = ev.target;
		console.log(name, value);
		setErrTxts({ ...errTxts, [name]: [] });
		setForm({ ...form, [name]: value });
	};

	useEffect(() => {
		getRoomsEnrollStd('', page)
			.then((res) => {
				setRooms([...rooms, ...res.data.data]);
				if (res.data.current_page < res.data.last_page) {
					setPage(page + 1);
				}
			})
			.catch((err) => {
				dispatch(
					Actions.showMessage({
						message: 'Failed to get rooms.',
						autoHideDuration: 1500,
						variant: 'error',
					})
				);
			});
	}, [page, dispatch]);

	useEffect(() => {
		if (date) {
			if (dayjs(date).format('YYYY-MM-DD') === form.dob) {
				return;
			}
			form.dob = dayjs(date).format('YYYY-MM-DD');
		} else {
			form.dob = '';
		}
	}, [date, form.dob]);

	return (
		<FuseScrollbars className={classes.content} scrollToTopOnRouteChange>
			<div className="px-64 py-60">
				<div className="form-heading">
					<span className="">
						<IconButton
							onClick={() => {
								history.goBack();
							}}
						>
							<img src="assets/images/arrow-long.png" alt="filter" width="24px" className="backBtn-img" />
						</IconButton>
					</span>
					Enroll Student
				</div>
				<div className="enroll-form-container px-60 py-64 bg-white">
					<form onSubmit={handleSubmit}>
						<div style={{ display: 'flex' }}>
							<div
								className="relative pic-upload-overlay cursor-pointer flex-grow"
								onClick={() => inputRef.current.click()}
							>
								<Avatar
									style={{ height: '140px', width: '140px' }}
									src={preview}
									className="imageupload"
								/>
								<div className="ppinputoverlay studentAdd">
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
							<fieldset style={{ width: '100%', marginLeft: '20px' }}>
								<h2 className="form-section-heading" style={{ fontSize: '18px' }}>
									Student Information
								</h2>
								<div className="student-field-flex flex justify-between">
									<TextField
										onChange={handleChange}
										name="first_name"
										label="First Name*"
										id="fname-student"
										error={!!errTxts.first_name?.length}
										helperText={errTxts.first_name}
									/>
									<TextField
										onChange={handleChange}
										name="last_name"
										label="Last Name*"
										id="lname-student"
										error={!!errTxts.last_name?.length}
										helperText={errTxts.last_name}
									/>
								</div>
								<div className="student-field-flex flex justify-between">
									<CustomDatePicker
										width="25%"
										errTxts={errTxts.dob}
										name="dob"
										value={date}
										setValue={(d) => {
											setDate(d);
											setErrTxts({ ...errTxts, dob: '' });
										}}
										label="Date of Birth*"
										disableFuture
										id="date-of-birth"
									/>
									<FormControl
										error={!!errTxts.room_id?.length}
										variant="standard"
										className="w-1/4 student-select"
									>
										<InputLabel id="homeroomLabel">Select a Home Room*</InputLabel>
										<Select
											name="room_id"
											onChange={handleChange}
											labelId="homeroomLabel"
											id="homeroom"
											label="Select a Home Room*"
										>
											{rooms.length ? (
												rooms.map((room) => {
													return (
														<MenuItem key={room.id} value={room.id} id={room.name}>
															{room.name}
														</MenuItem>
													);
												})
											) : (
												<MenuItem disabled>Loading...</MenuItem>
											)}
										</Select>
										{errTxts.room_id && <FormHelperText>{errTxts.room_id}</FormHelperText>}
									</FormControl>
								</div>
								<div className="student-field-flex flex justify-between">
									<FormControl
										error={!!errTxts.gender?.length}
										variant="standard"
										className="w-1/4 student-select"
									>
										<InputLabel id="genderLabel">Gender*</InputLabel>
										<Select
											// className={ddnSt.underline}
											name="gender"
											onChange={handleChange}
											labelId="genderLabel"
											id="gender"
											label="Select Gender*"
										>
											<MenuItem value="male">
												<span id="male"> Male</span>
											</MenuItem>
											<MenuItem value="female">
												<span id="female"> Female</span>
											</MenuItem>
										</Select>
										{errTxts.gender && <FormHelperText>{errTxts.gender}</FormHelperText>}
									</FormControl>
									<TextField onChange={handleChange} name="address1" id="address1" label="Address" />
								</div>
								<div className="flex justify-between mb-52">
									<h2 className="form-section-heading" style={{ fontSize: '18px' }}>
										Parent Information
									</h2>
									<FormControl
										error={!!errTxts.isNew?.length}
										variant="standard"
										className="w-1/4 student-select new-existing-parent-select"
									>
										<div className="flex">
											<CustomButton variant="secondary" height="40" width="120px" fontSize="15px">
												<Select
													className={classes.select}
													name="isNew"
													defaultValue={0}
													onChange={handleChange}
													id="isNew"
													value={form.isNew}
												>
													<MenuItem className="hidden" value={0} disabled>
														Select
													</MenuItem>
													<MenuItem value={1}>
														<span id="new"> New </span>
													</MenuItem>
													<MenuItem value={2}>
														<span id="existing"> Existing </span>
													</MenuItem>
												</Select>
											</CustomButton>
										</div>
										{errTxts.isNew && <FormHelperText>{errTxts.isNew}</FormHelperText>}
									</FormControl>
								</div>
								{form.isNew === 1 ? (
									<>
										<fieldset>
											<div className="student-field-flex flex justify-between">
												<TextField
													onChange={handleChange}
													name="parent_first_name"
													label="First Name*"
													id="fname-parent"
													error={!!errTxts.parent_first_name?.length}
													helperText={errTxts.parent_first_name}
												/>
												<TextField
													onChange={handleChange}
													name="parent_last_name"
													label="Last Name*"
													id="lname-parent"
													error={!!errTxts.parent_last_name?.length}
													helperText={errTxts.parent_last_name}
												/>
											</div>
											<div className="student-field-flex custom-enroll-student-field-btm flex justify-between">
												<FormControl variant="standard" className="w-1/4 student-select">
													<InputLabel shrink id="selectLabel">
														Select*
													</InputLabel>
													<Select
														value={role}
														onChange={(e) => setRole(e.target.value)}
														labelId="selectLabel"
														id="Select"
														label="Select*"
													>
														<MenuItem value="parent">
															<span id="parent">Parent</span>
														</MenuItem>
														<MenuItem value="legal-guardian">
															<span id="guardian">Legal Guardian</span>
														</MenuItem>
													</Select>
												</FormControl>
												<FormControl
													error={errTxts.relation_with_child?.length}
													variant="standard"
													className="w-1/4 student-select"
												>
													<InputLabel id="relationLabel">Relation with Child*</InputLabel>
													<Select
														onChange={handleChange}
														labelId="relationLabel"
														id="childRelation"
														label="Relation with Child*"
														name="relation_with_child"
													>
														{role === 'parent' ? (
															// fragment not working so used array
															[
																<MenuItem value="father">
																	<span id="father">Father</span>
																</MenuItem>,
																<MenuItem value="mother">
																	<span id="mother">Mother</span>
																</MenuItem>,
															]
														) : (
															<MenuItem value="Legal Guardian">
																<span id="legal-guardian">Legal Guardian</span>
															</MenuItem>
														)}
													</Select>
													{errTxts.relation_with_child && (
														<FormHelperText>{errTxts.relation_with_child}</FormHelperText>
													)}
												</FormControl>
											</div>
											<div className="student-field-flex flex justify-between">
												<TextField
													onChange={handleChange}
													name="parent_phone"
													label="Contact Number*"
													id="contact-parent"
													error={!!errTxts.parent_phone?.length}
													helperText={errTxts.parent_phone}
												/>
												<TextField
													onChange={handleChange}
													name="parent_email"
													label="Email Address*"
													id="email-parent"
													error={!!errTxts.parent_email?.length}
													helperText={errTxts.parent_email}
												/>
											</div>
										</fieldset>
									</>
								) : form.isNew === 2 ? (
									<fieldset>
										<div className="student-field-flex flex justify-between">
											<FormControl variant="standard" className="w-1/4 student-select">
												<InputLabel shrink id="selectLabel">
													Select*
												</InputLabel>
												<Select
													defaultValue="parent"
													labelId="selectLabel"
													id="Select"
													label="Select*"
												>
													<MenuItem value="parent">
														<span id="parent">Parent</span>
													</MenuItem>
												</Select>
											</FormControl>
											<Autocomplete
												id="parent-autocpmplete"
												options={existingParents}
												renderOption={(option) => (
													<>
														<div
															className="flex"
															id={option.id}
															key={option.id}
															style={{ gap: 10 }}
														>
															<Avatar src={option.photo} />
															<div>
																<div>{option.name}</div>
																<div>{option.email}</div>
															</div>
														</div>
													</>
												)}
												getOptionLabel={(option) => option.name}
												style={{ width: '45%' }}
												loading={loadingParents}
												clearOnBlur={false}
												autoComplete={false}
												loadingText="Loading..."
												onChange={(e, v) => setForm({ ...form, parent_id: v?.id })}
												renderInput={(params) => (
													<TextField
														style={{ width: '90%' }}
														{...params}
														onChange={(e) => setParentEmail(e.target.value)}
														label="Contacts Name"
														helperText={errTxts.parent_id}
														error={!!errTxts.parent_id?.length}
														autoComplete="off"
														id="parent-name"
													/>
												)}
											/>
										</div>
									</fieldset>
								) : (
									''
								)}
							</fieldset>
						</div>
						<div className="flex justify-center" style={{ marginTop: '15px' }}>
							{!isLoading ? (
								<div className=" center-btn">
									<CustomButton
										variant="secondary"
										width="140px"
										onClick={() => {
											history.goBack();
										}}
									>
										Cancel
									</CustomButton>

									<CustomButton
										variant="primary"
										type="submit"
										width="140px"
										fontSize="15px"
										id="submit"
									>
										Submit
									</CustomButton>
								</div>
							) : (
								<div className="flex justify-center">
									<CircularProgress className="mx-auto" />
								</div>
							)}
						</div>
					</form>
				</div>
			</div>
		</FuseScrollbars>
	);
}

export default EnrollStudents;
