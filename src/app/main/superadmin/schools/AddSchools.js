import React, { useState, useEffect, useRef } from 'react';
import './AddSubAdmin.css';
import FuseAnimate from '@fuse/core/FuseAnimate';
import TextField from '@material-ui/core/TextField';
import Select from '@material-ui/core/Select';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import {
	createSchool,
	getCountryList,
	getSearchableStateList,
	getSearchableCityList,
} from 'app/services/schools/schools';
import history from '@history';
import { useDispatch, useSelector } from 'react-redux';
import * as Actions from 'app/store/actions';
import { Avatar, CircularProgress, FormHelperText, IconButton } from '@material-ui/core';
import CustomButton from 'app/customComponents/CustomButton/CustomButton';
import FuseScrollbars from '@fuse/core/FuseScrollbars';
import { makeStyles } from '@material-ui/core/styles';
import { uploadFile } from 'app/services/imageUpload/imageUpload';
import { scrollIntoView } from 'utils/utils';
import Autocomplete from '@material-ui/lab/Autocomplete';
import { getImageUrl } from 'utils/utils';

const useStyles = makeStyles((theme) => ({
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
}));

function AddSchools() {
	const classes = useStyles();
	const dispatch = useDispatch();
	const inputRef = useRef(null);
	const user = useSelector(({ auth }) => auth.user);
	const [countries, setCountries] = useState([]);
	const [states, setStates] = useState([]);
	const [city, setCity] = useState([]);
	const [timeZone, setTimeZone] = useState({ city: '', state: '' });
	const [latLong, setLatLong] = useState({ lat: '', long: '' });
	const [cityTimezone, setCityTimeZone] = useState('');
	const tzlookup = require('tz-lookup');
	const [selectedFile, setSelectedFile] = useState(null);
	const [preview, setPreview] = useState(null);
	const [isStateloading, setIsStateloading] = useState(false);
	const [searchStateQuery, setStateSearchQuery] = useState('');
	const [isCityLoading, setIsCityLoading] = useState(false);
	const [searchCityQuery, setSearchCityQuery] = useState('');

	const [form, setForm] = useState({
		status: 1,
		first_name: '',
		last_name: '',
		phone: '',
		email: '',
		designation: '',
		school_name: '',
		state_id: '',
		timezone: '',
		address: '',
		street: '',
		country_code: '',
		city: '',
		zip_code: '',
	});
	const [admins, setAdmins] = useState([{ first_name: '', last_name: '' }]);
	const [isReq, setIsReq] = useState(false);
	const [errTxts, setErrTxts] = useState({
		first_name: '',
		last_name: '',
		email: '',
		phone: '',
		school_name: '',
		school_phone: '',
		address: '',
		street: '',
		country_code: '',
		state_id: '',
		city: '',
		zip_code: '',
		status: '',
	});

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

	const handleChange = (event, index) => {
		const { name, value } = event.target;
		if (name === 'first_name') {
			setErrTxts({ ...errTxts, first_name: '' });
			setAdmins([...admins.slice(0, index), { ...admins[index], [name]: value }, ...admins.slice(index + 1)]);
			return;
		}
		if (name === 'last_name') {
			setErrTxts({ ...errTxts, last_name: '' });
			setAdmins([...admins.slice(0, index), { ...admins[index], [name]: value }, ...admins.slice(index + 1)]);
			return;
		}
		if (name === 'phone') {
			setErrTxts({ ...errTxts, phone: '' });
			setAdmins([...admins.slice(0, index), { ...admins[index], [name]: value }, ...admins.slice(index + 1)]);
			return;
		}
		if (name === 'email') {
			setErrTxts({ ...errTxts, email: '' });
			setAdmins([...admins.slice(0, index), { ...admins[index], [name]: value }, ...admins.slice(index + 1)]);
			return;
		}
		if (name === 'designation') {
			setErrTxts({ ...errTxts, designation: '' });
			setAdmins([...admins.slice(0, index), { ...admins[index], [name]: value }, ...admins.slice(index + 1)]);
			return;
		}
		if (name === 'school_name') {
			setErrTxts({ ...errTxts, school_name: '' });
		}
		if (name === 'school_phone') {
			setErrTxts({ ...errTxts, school_phone: '' });
		}
		if (name === 'address') {
			setErrTxts({ ...errTxts, address: '' });
		}
		if (name === 'country_code') {
			setErrTxts({ ...errTxts, country_code: '' });
		}
		if (name === 'state_id') {
			setErrTxts({ ...errTxts, state_id: '' });
			const a = JSON.parse(value);
			setTimeZone({ ...timeZone, state: a });
			return;
		}
		if (name === 'city') {
			setErrTxts({ ...errTxts, city: '' });
			const a = JSON.parse(value);
			setTimeZone({ ...timeZone, city: a });
		}
		if (name === 'zip_code') {
			setErrTxts({ ...errTxts, zip_code: '' });
		}
		if (name === 'street') {
			setErrTxts({ ...errTxts, street: '' });
		}
		setForm({ ...form, [name]: value });
	};

	const isError = {
		first_name: false,
		last_name: false,
		email: false,
		phone: false,
		school_name: false,
		school_phone: false,
		address: false,
		street: false,
		country_code: false,
		state_id: false,
		city: false,
		zip_code: false,
	};
	const handleSubmit = (e) => {
		e.preventDefault();
		const data = JSON.parse(JSON.stringify(form));
		data.school_admins = admins.map((admin) => {
			if (admin.phone) {
				return {
					...admin,
					phone: parseInt(
						admin.phone.split(' ').join('').split('-').join('').split('(').join('').split(')').join(''),
						10
					),
				};
			}
			if (admin.designation) {
				return {
					...admin,
					designation: admin.designation.trim(),
				};
			}
			return admin;
		});
		data.school_phone = form.school_phone;
		if (data.school_phone) {
			data.school_phone = parseInt(
				data.school_phone.split(' ').join('').split('-').join('').split('(').join('').split(')').join(''),
				10
			);
		}
		if (data.state_id) {
			data.state_id = data.state_id;
		}
		if (data.city) {
			data.city = data.city;
			data.timezone = cityTimezone;
		}

		// admin validations
		const adminStates = admins[0];
		if (!adminStates?.first_name) {
			isError.first_name = true;
			setIsReq(false);
			setErrTxts((prevState) => ({ ...prevState, first_name: 'This field is required.' }));
			scrollIntoView('fname-0');
		} else if (adminStates?.first_name && /[^a-zA-Z]/.test(adminStates?.first_name)) {
			isError.first_name = true;
			setIsReq(false);
			setErrTxts((prevState) => ({ ...prevState, first_name: 'Please enter a valid name.wrong' }));
			scrollIntoView('fname-0');
		} else {
			isError.first_name = false;
			setIsReq(false);
			setErrTxts((prevState) => ({ ...prevState, first_name: '' }));
		}
		// last_name validations
		if (!adminStates?.last_name) {
			isError.last_name = true;
			setIsReq(false);
			setErrTxts((prevState) => ({ ...prevState, last_name: 'This field is required.' }));
			scrollIntoView('lname-0');
		} else if (adminStates?.last_name && /[^a-zA-Z]/.test(adminStates?.last_name)) {
			isError.last_name = true;
			setIsReq(false);
			setErrTxts((prevState) => ({ ...prevState, last_name: 'Please enter a valid name.' }));
			scrollIntoView('lname-0');
		} else {
			isError.last_name = false;
			setIsReq(false);
			setErrTxts((prevState) => ({ ...prevState, last_name: '' }));
		}
		// email validations
		if (!adminStates?.email) {
			isError.email = true;
			setIsReq(false);
			setErrTxts((prevState) => ({ ...prevState, email: 'This field is required' }));
			scrollIntoView('email-0');
		} else if (!/^\S+@\S+\.\S+$/.test(adminStates?.email)) {
			isError.email = true;
			setIsReq(false);
			setErrTxts((prevState) => ({ ...prevState, email: 'Please enter valid email' }));
			scrollIntoView('email-0');
		} else {
			isError.email = false;
			setIsReq(false);
			setErrTxts((prevState) => ({ ...prevState, email: '' }));
		}
		// phone validations
		if (!adminStates.phone) {
			isError.phone = true;
			setIsReq(false);
			setErrTxts((prevState) => ({ ...prevState, phone: 'This field is required' }));
			scrollIntoView('phone-0');
		} else if (adminStates?.phone) {
			if (
				!Number?.isFinite(
					Number(
						adminStates.phone
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
				isError.phone = true;
				setIsReq(false);
				setErrTxts((prevState) => ({ ...prevState, phone: 'Please enter valid phone number' }));
				scrollIntoView('phone-0');
			} else {
				isError.phone = false;
				setErrTxts((prevState) => ({ ...prevState, phone: '' }));
				setIsReq(false);
			}
		}
		if (!adminStates?.designation) {
			isError.designation = true;
			setErrTxts((prevState) => ({ ...prevState, designation: 'This field is required.' }));
			scrollIntoView('designation-0');
		} else if (/[^a-zA-Z ]/.test(adminStates?.designation)) {
			isError.last_name = true;
			setErrTxts((prevState) => ({ ...prevState, designation: 'Please enter a valid name.' }));
			scrollIntoView('designation-0');
		} else {
			admins[0].designation = admins[0].designation.trim();
			isError.designation = false;
			setErrTxts((prevState) => ({ ...prevState, designation: '' }));
		}
		// school validations
		// school_name validations
		if (!form?.school_name) {
			isError.school_name = true;
			setIsReq(false);
			setErrTxts((prevState) => ({ ...prevState, school_name: 'This field is required.' }));
		} else if (form?.school_name && /[^a-zA-Z0-9 ]/.test(form?.school_name)) {
			isError.school_name = true;
			setIsReq(false);
			setErrTxts((prevState) => ({ ...prevState, school_name: 'Please enter a valid name.' }));
		} else {
			isError.school_name = false;
			setIsReq(false);
			setErrTxts((prevState) => ({ ...prevState, school_name: '' }));
		}
		// school_phone validations
		if (!form.school_phone) {
			isError.school_phone = true;
			setIsReq(false);
			setErrTxts((prevState) => ({ ...prevState, school_phone: 'This field is required' }));
		} else if (form?.school_phone) {
			if (
				!Number?.isFinite(
					Number(
						form?.school_phone
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
				isError.school_phone = true;
				setIsReq(false);
				setErrTxts((prevState) => ({ ...prevState, school_phone: 'Please enter valid phone number' }));
			} else {
				isError.school_phone = false;
				setIsReq(false);
				setErrTxts((prevState) => ({ ...prevState, school_phone: '' }));
			}
		}
		// address validations
		if (!form?.address) {
			isError.address = true;
			setIsReq(false);
			setErrTxts((prevState) => ({ ...prevState, address: 'This field is required.' }));
		} else {
			isError.address = false;
			setIsReq(false);
			setErrTxts((prevState) => ({ ...prevState, address: '' }));
		}
		// street validations
		// if (!form?.street) {
		// 	isError.street = true;
		// 	setIsReq(false);
		// 	setErrTxts(prevState => ({ ...prevState, street: 'This field is required.' }));
		// } else {
		// 	isError.street = false;
		// 	setIsReq(false);
		// 	setErrTxts(prevState => ({ ...prevState, street: '' }));
		// }
		// country_code validations
		if (!form?.country_code) {
			isError.country_code = true;
			setIsReq(false);
			setErrTxts((prevState) => ({ ...prevState, country_code: 'This field is required.' }));
		} else {
			isError.country_code = false;
			setErrTxts((prevState) => ({ ...prevState, country_code: '' }));
		}
		// state_id validations
		if (!form?.state_id) {
			isError.state_id = true;
			setIsReq(false);
			setErrTxts((prevState) => ({ ...prevState, state_id: 'This field is required.' }));
		} else {
			isError.state_id = false;
			setIsReq(false);
			setErrTxts((prevState) => ({ ...prevState, state_id: '' }));
		}
		// city validations
		if (!form?.city) {
			isError.city = true;
			setIsReq(false);
			setErrTxts((prevState) => ({ ...prevState, city: 'This field is required.' }));
		} else {
			isError.city = false;
			setIsReq(false);
			setErrTxts((prevState) => ({ ...prevState, city: '' }));
		}
		// zip_code validations
		if (!form?.zip_code) {
			isError.zip_code = true;
			setIsReq(false);
			setErrTxts((prevState) => ({ ...prevState, zip_code: 'This field is required.' }));
		} else {
			isError.zip_code = false;
			setIsReq(false);
			setErrTxts((prevState) => ({ ...prevState, zip_code: '' }));
		}

		console.log(isError, 'isError');
		if (
			isError.first_name ||
			isError.last_name ||
			isError.email ||
			isError.phone ||
			isError.school_name ||
			isError.school_phone ||
			isError.address ||
			isError.street ||
			isError.country_code ||
			isError.state_id ||
			isError.city ||
			isError.zip_code ||
			isError.designation
		) {
			// console.log('yes');
		} else {
			data.company_id = user.data.school.id; // Company Id requested by Backend
			if (selectedFile) {
				const filename = getImageUrl(selectedFile);
				setIsReq(true);
				uploadFile(selectedFile, filename).then((response) => {
					data.school_profile_image = `${process.env.REACT_APP_S3_BASE_URL}${response}`;
					createSchool(data, cityTimezone)
						.then((res) => {
							dispatch(
								Actions.showMessage({
									message: 'School Successfuly added.',
									autoHideDuration: 1500,
									variant: 'success',
								})
							);
							history.push('/schools');
						})
						.catch((err) => {
							setIsReq(false);
							dispatch(
								Actions.showMessage({
									message: 'Failed to add School',
									autoHideDuration: 1500,
									variant: 'error',
								})
							);
							if (err.response.data.errors) {
								setErrTxts(err.response.data.errors);
							}
						});
				});
			} else {
				setIsReq(true);
				createSchool(data, cityTimezone)
					.then((res) => {
						dispatch(
							Actions.showMessage({
								message: 'School Successfuly added.',
								autoHideDuration: 1500,
								variant: 'success',
							})
						);
						history.push('/schools');
					})
					.catch((err) => {
						setIsReq(false);
						dispatch(
							Actions.showMessage({
								message: 'Failed to add School',
								autoHideDuration: 1500,
								variant: 'error',
							})
						);
						if (err.response.data.errors) {
							setErrTxts(err.response.data.errors);
						}
					});
			}
		}
	};

	useEffect(() => {
		if (latLong.lat !== '' && latLong.long !== '') {
			console.log(tzlookup(latLong.lat, latLong.long));
			setCityTimeZone(tzlookup(latLong.lat, latLong.long));
		}
	}, [latLong]);

	useEffect(() => {
		const timeout = setTimeout(() => {
			setIsCityLoading(true);
			setForm({ ...form, city: '' });
			setCity([]);
			if (!searchCityQuery && !form.state_id) {
				setForm({ ...form, city: '' });
				setCity([]);
			} else {
				getSearchableCityList(form.state_id, searchCityQuery, 1)
					.then((res) => {
						setForm({ ...form, city: '' });
						setCity(res.data.data);
					})
					.catch((err) => {
						dispatch(
							Actions.showMessage({
								message: 'Failed to get cities.',
								autoHideDuration: 1500,
								variant: 'error',
							})
						);
					})
					.finally(() => {
						setIsCityLoading(false);
					});
			}
		}, 1000);
		return () => {
			clearTimeout(timeout);
		};
	}, [form.state_id, searchCityQuery]);

	useEffect(() => {
		const timeout = setTimeout(() => {
			setIsStateloading(true);
			setStates([]);
			setForm({ ...form, city: '' });
			setCity([]);
			if (!searchStateQuery) {
				getSearchableStateList('', '')
					.then((res) => {
						setStates(res.data.data);
						setForm({ ...form, city: '' });
						setCity([]);
					})
					.catch((err) => {
						dispatch(
							Actions.showMessage({
								message: 'Failed to get states.',
								autoHideDuration: 1500,
								variant: 'error',
							})
						);
					})
					.finally(() => {
						setIsStateloading(false);
					});
			} else {
				getSearchableStateList(searchStateQuery, searchStateQuery ? undefined : 1)
					.then((res) => {
						setStates(res.data.data);
						setForm({ ...form, city: '' });
					})
					.catch((err) => {
						dispatch(
							Actions.showMessage({
								message: 'Failed to get states.',
								autoHideDuration: 1500,
								variant: 'error',
							})
						);
					})
					.finally(() => {
						setIsStateloading(false);
					});
			}
		}, 1000);
		return () => {
			clearTimeout(timeout);
		};
	}, [dispatch, form.country_code, searchStateQuery]);

	useEffect(() => {
		getCountryList()
			.then((res) => {
				setCountries(res.data);
			})
			.catch((err) => {
				dispatch(
					Actions.showMessage({
						message: 'Failed to get countries.',
						autoHideDuration: 1500,
						variant: 'error',
					})
				);
			});
	}, []);

	return (
		<FuseScrollbars className={classes.content} scrollToTopOnRouteChange>
			<FuseAnimate animation="transition.slideLeftIn" duration={600}>
				<div className="m-auto">
					<div className="items-end mb-20 justify-between">
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
						<span className="text-lg mr-59 hd-main " style={{ fontSize: '20px' }}>
							Add School
						</span>
						<div className="box-input">
							<h2 className="" style={{ fontSize: '18px', fontWeight: '700' }}>
								School Admin Info
							</h2>
							<div className="flex col-gap-52 mt-12">
								<div
									onClick={() => inputRef.current.click()}
									className="row-span-2 school-camera-holder"
									style={{ justifySelf: 'center' }}
								>
									<Avatar src={preview} style={{ width: 120, height: 120, cursor: 'pointer' }} />
									<div className="school-pp-overlay">
										<i className="fa fa-2x fa-camera" />
									</div>
									<input
										onChange={onSelectFile}
										type="file"
										name="file"
										id="image"
										className="hidden"
										ref={inputRef}
									/>
								</div>
								<form id="add-school-form" onSubmit={handleSubmit}>
									<div className="flex justify-between items-center">
										{/* <button className="add-school-admin" type="button" onClick={handleAddMoreAdmin}>
									+ Add More
								</button> */}
										{/* <CustomButton id="add-schooladmin" variant="secondary" onClick={handleAddMoreAdmin}>
									+ Add More
								</CustomButton> */}
									</div>

									{admins.map((_, index) => (
										<fieldset className={index !== 0 && 'my-10 bg-grey-100 pt-4'} key={index}>
											{index !== 0 && (
												<div className="flex justify-end">
													<button
														id={`remove-admin-${index}`}
														onClick={() =>
															setAdmins([
																...admins.slice(0, index),
																...admins.slice(index + 1),
															])
														}
														type="button"
													>
														<i style={{ cursor: 'pointer' }} className="fas fa-times" />
													</button>
												</div>
											)}
											<TextField
												error={
													!!errTxts[`school_admins.${index}.first_name`] || errTxts.first_name
												}
												helperText={
													errTxts[`school_admins.${index}.first_name`] || errTxts.first_name
												}
												name="first_name"
												value={admins[index].first_name}
												onChange={(event) => handleChange(event, index)}
												id={`fname-${index}`}
												label="First Name "
											/>
											<TextField
												error={
													!!errTxts[`school_admins.${index}.last_name`] || errTxts.last_name
												}
												helperText={
													errTxts[`school_admins.${index}.last_name`] || errTxts.last_name
												}
												name="last_name"
												value={admins[index].last_name}
												onChange={(event) => handleChange(event, index)}
												id={`lname-${index}`}
												label="Last Name"
											/>
											<TextField
												error={!!errTxts[`school_admins.${index}.email`] || errTxts.email}
												helperText={errTxts[`school_admins.${index}.email`] || errTxts.email}
												name="email"
												value={admins[index].email}
												onChange={(event) => handleChange(event, index)}
												id={`email-${index}`}
												label="Email Address"
											/>
											<TextField
												error={!!errTxts[`school_admins.${index}.phone`] || errTxts.phone}
												helperText={errTxts[`school_admins.${index}.phone`] || errTxts.phone}
												name="phone"
												value={admins[index].phone}
												onChange={(event) => handleChange(event, index)}
												id={`phone-${index}`}
												label="Contact Number"
											/>
											<TextField
												error={
													!!errTxts[`school_admins.${index}.designation`] ||
													errTxts.designation
												}
												helperText={
													errTxts[`school_admins.${index}.designation`] || errTxts.designation
												}
												name="designation"
												value={admins[index].designation}
												onChange={(event) => handleChange(event, index)}
												id={`designation-${index}`}
												label="Designation"
											/>
										</fieldset>
									))}
									<fieldset>
										<h1 style={{ fontSize: '18px', fontWeight: '700' }}>School Info</h1>
										<TextField
											error={!!errTxts.school_name}
											helperText={errTxts.school_name}
											name="school_name"
											value={form.school_name}
											onChange={handleChange}
											id="school-name"
											label="School Name"
										/>
										<TextField
											error={!!errTxts.school_phone}
											helperText={errTxts.school_phone}
											name="school_phone"
											value={form.school_phone}
											onChange={handleChange}
											id="school-phone"
											label="Contact Number"
										/>
										<TextField
											error={!!errTxts.address}
											helperText={errTxts.address}
											name="address"
											value={form.address}
											onChange={handleChange}
											id="school-address"
											label="Address 1"
										/>
										<div className="flex">
											<TextField
												// error={!!errTxts.street}
												// helperText={errTxts.street}
												name="street"
												value={form.street}
												onChange={handleChange}
												id="school-street"
												label="Address 2"
											/>
											<FormControl error={!!errTxts.country_code} className="country-width mr-40">
												<InputLabel id="country_code_label">Country</InputLabel>
												<Select
													name="country_code"
													value={form.country_code}
													onChange={handleChange}
													labelId="country_code"
													id="country_code"
												>
													{countries.length ? (
														countries.map((country, index) => {
															return (
																<MenuItem key={country.id + 60} value={country.code}>
																	<span id={country.code}>{country.name}</span>
																</MenuItem>
															);
														})
													) : (
														<MenuItem>Loading...</MenuItem>
													)}
												</Select>
												{errTxts.country_code && (
													<FormHelperText>{errTxts.country_code}</FormHelperText>
												)}
											</FormControl>
											<Autocomplete
												id="state-autocomplete"
												name="state_id"
												options={states}
												renderOption={(option) => (
													<>
														<div className="flex" style={{ gap: 10 }}>
															<div>{option.name}</div>
														</div>
													</>
												)}
												getOptionLabel={(option) => option.name}
												autoComplete={false}
												clearOnBlur={false}
												disableClearable
												loading={isStateloading}
												loadingText="...Loading"
												sx={{ width: '100%' }}
												onChange={(_e, v) => {
													setForm({ ...form, state_id: v?.id || '' });
												}}
												onInputChange={(e, value) => {
													setStateSearchQuery(value);
													if (value === '') {
														setForm({ ...form, state_id: '', city: '' });
													}
												}}
												renderInput={(params) => (
													<TextField
														{...params}
														label="State"
														style={{ width: 220 }}
														error={!!errTxts.state_id?.length}
														helperText={errTxts.state_id}
														autoComplete="off"
													/>
												)}
											/>
										</div>
										<div className="flex">
											<Autocomplete
												id="city-autocomplete"
												name="city"
												options={city}
												renderOption={(option) => (
													<>
														<div className="flex" style={{ gap: 10 }}>
															<div>{option.name}</div>
														</div>
													</>
												)}
												getOptionLabel={(option) => option.name}
												autoComplete={false}
												clearOnBlur={false}
												disableClearable
												loading={isCityLoading}
												loadingText="...Loading"
												sx={{ width: '100%' }}
												onChange={(_e, v) => {
													const value = JSON.parse(v?.meta);
													setLatLong({
														...latLong,
														lat: value.latitude,
														long: value.longitude,
													});
													setForm({ ...form, city: v?.name || '' });
												}}
												renderInput={(params) => (
													<TextField
														{...params}
														label="City"
														onChange={(e) => {
															setSearchCityQuery(e.target.value);
															if (e.target.value === '') {
																setForm({ ...form, city: '' });
															}
														}}
														error={!!errTxts.city?.length}
														helperText={errTxts.city}
														autoComplete="off"
														style={{ width: 220 }}
													/>
												)}
											/>
											<TextField
												error={!!errTxts.zip_code}
												helperText={errTxts.zip_code}
												name="zip_code"
												value={form.zip_code}
												onChange={handleChange}
												id="school-zipcode"
												label="Zipcode"
											/>
											<FormControl className="country-width">
												<InputLabel id="state-label">Status</InputLabel>
												<Select
													name="status"
													value={form.status}
													onChange={handleChange}
													labelId="status-label"
													id="school-status"
													placeholder="Status"
												>
													<MenuItem selected value={1}>
														<span id="active">Active</span>
													</MenuItem>
													<MenuItem value={0}>
														<span id="inactive">Inactive</span>
													</MenuItem>
												</Select>
											</FormControl>
										</div>
									</fieldset>
									{/* <div className="flex align-center justify-center">
								<CustomButton variant="primary" type="submit" id="add-school-button">
									Add
								</CustomButton>
							</div> */}

									<div className="flex justify-center w-max mt-40" style={{ gap: '20px' }}>
										{isReq ? (
											<div className="flex align-center justify-center mr-128">
												<CircularProgress size={35} />
											</div>
										) : (
											<>
												<CustomButton
													variant="secondary"
													width={140}
													onClick={() => {
														history.goBack();
													}}
												>
													Cancel
												</CustomButton>
												<CustomButton
													variant="primary"
													width={140}
													type="submit"
													id="add-school-button"
												>
													Add
												</CustomButton>
											</>
										)}
									</div>
								</form>
							</div>
						</div>
					</div>
				</div>
			</FuseAnimate>
		</FuseScrollbars>
	);
}

export default AddSchools;
