import React, { useState, useEffect, useRef } from 'react';
import TextField from '@material-ui/core/TextField';
import './EditSchool.css';
import FuseAnimate from '@fuse/core/FuseAnimate';
import Select from '@material-ui/core/Select';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import history from '@history';
import { FormControl, FormHelperText, CircularProgress, Avatar, IconButton } from '@material-ui/core';
import {
	updateSchool,
	getCountryList,
	getCompanySchool,
	getSearchableStateList,
	getSearchableCityList,
} from 'app/services/schools/schools';
import { useDispatch } from 'react-redux';
import * as Actions from 'app/store/actions/';
import CustomButton from 'app/customComponents/CustomButton/CustomButton';
import { useParams } from 'react-router-dom';
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

function EditSchools() {
	const classes = useStyles();
	const dispatch = useDispatch();
	const inputRef = useRef(null);
	const { id } = useParams();
	const [row, setRow] = useState({});
	const [otp, setOtp] = useState('');
	const [modifiedAdmins, setModifiedAdmins] = useState([]);
	const [modifiedRow, setModifiedRow] = useState({
		school_name: '',
		total_students: '',
		school_phone: '',
		address: '',
		street: '',
		country: '',
		state_id: '',
		zip_code: '',
		status: '',
		user_id: '',
		city: '',
	});
	const [selectedFile, setSelectedFile] = useState(null);
	const [preview, setPreview] = useState(null);
	const [isEditing, setIsEditing] = useState(false);
	const [isSaving, setIsSaving] = useState(false);
	const [errTxts, setErrTxts] = useState({});
	const [countries, setCountries] = useState([]);
	const [states, setStates] = useState([]);
	const [city, setCity] = useState([]);
	const [latLong, setLatLong] = useState({ lat: '', long: '' });
	const [cityTimezone, setCityTimeZone] = useState('');
	const geocoder = require('google-geocoder');
	const tzlookup = require('tz-lookup');
	const [isLoading, setIsLoading] = useState(true);
	const [isStateloading, setIsStateloading] = useState(false);
	const [searchStateQuery, setStateSearchQuery] = useState('');
	const [isCityLoading, setIsCityLoading] = useState(false);
	const [searchCityQuery, setSearchCityQuery] = useState('');
	const [defaultCity, setDefaultCity] = useState({});
	const [defaultState, setDefaultState] = useState({});
	const geo = geocoder({
		key: process.env.REACT_APP_GOOGLE_API_ENDPOINT,
	});

	useEffect(() => {
		const timeout = setTimeout(() => {
			setIsLoading(true);
			getCompanySchool(id)
				.then((res) => {
					setRow(res.data);
					setModifiedAdmins(res.data.admins);
					setModifiedRow({
						...modifiedRow,
						school_name: res.data.name,
						total_students: res.data.total_students,
						school_phone: res.data.phone,
						address: res.data.address,
						street: res.data.street,
						country: res.data.country_code,
						city: res.data.city,
						state_id: res.data.state_id,
						zip_code: res.data.zip_code,
						status: res.data.status,
						user_id: res.data.user_id,
						account_connected_status: res.data.account_connected_status,
					});
					setDefaultState(res.data.state);
					setDefaultCity({ name: res.data.city });
					setOtp(res.data.otp);
					setPreview(res?.data?.logo);
				})
				.catch((err) => {
					console.log(err);
				})
				.finally(() => {
					setIsLoading(false);
				});
		}, 1000);
		return () => {
			clearTimeout(timeout);
		};
	}, [id]);

	useEffect(() => {
		if (modifiedRow.state_id && states.length > 0) {
			setDefaultState({ id: defaultState.id, name: defaultState.name });
			setDefaultCity({ name: modifiedRow.city });
		}
	}, [isLoading, states]);

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

	const handleChange = (e, index) => {
		const { name, value } = e.target;
		if (name === 'first_name') {
			setErrTxts({ ...errTxts, first_name: '' });
			setModifiedAdmins([
				...modifiedAdmins.slice(0, index),
				{ ...modifiedAdmins[index], [name]: value },
				...modifiedAdmins.slice(index + 1),
			]);
			return;
		}
		if (name === 'last_name') {
			setErrTxts({ ...errTxts, last_name: '' });
			setModifiedAdmins([
				...modifiedAdmins.slice(0, index),
				{ ...modifiedAdmins[index], [name]: value },
				...modifiedAdmins.slice(index + 1),
			]);
			return;
		}
		if (name === 'phone') {
			setErrTxts({ ...errTxts, phone: '' });
			setModifiedAdmins([
				...modifiedAdmins.slice(0, index),
				{ ...modifiedAdmins[index], [name]: value },
				...modifiedAdmins.slice(index + 1),
			]);
			return;
		}
		if (name === 'email') {
			setErrTxts({ ...errTxts, email: '' });
			setModifiedAdmins([
				...modifiedAdmins.slice(0, index),
				{ ...modifiedAdmins[index], [name]: value },
				...modifiedAdmins.slice(index + 1),
			]);
			return;
		}
		if (name === 'designation') {
			setErrTxts({ ...errTxts, designation: '' });
			setModifiedAdmins([
				...modifiedAdmins.slice(0, index),
				{ ...modifiedAdmins[index], [name]: value },
				...modifiedAdmins.slice(index + 1),
			]);
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
		if (name === 'country') {
			setErrTxts({ ...errTxts, country: '' });
			setModifiedRow({ ...modifiedRow, country: value, state_id: '', city: '' });
			return;
		}
		if (name === 'state_id') {
			setErrTxts({ ...errTxts, state_id: '' });
			setModifiedRow({ ...modifiedRow, state_id: value, city: '' });
			return;
		}
		if (name === 'city') {
			setErrTxts({ ...errTxts, city: '' });
		}
		if (name === 'zip_code') {
			setErrTxts({ ...errTxts, zipcode: '' });
		}

		setModifiedRow({ ...modifiedRow, [name]: value });
	};

	const handleCancel = () => {
		setModifiedRow({
			school_name: row?.name,
			school_phone: row?.phone,
			address: row?.address,
			street: row?.street || '',
			total_students: row?.total_students,
			country: row?.country_code,
			state_id: row?.state_id,
			city: row?.city,
			zip_code: row?.zip_code,
			status: row?.status,
		});
		setIsEditing(false);
	};

	const handleSave = (e) => {
		e.preventDefault();

		if (!modifiedAdmins[0].first_name) {
			setErrTxts({ ...errTxts, first_name: 'This field is required' });
			scrollIntoView('fname0');
			return;
		}
		if (modifiedAdmins[0].first_name && /[^a-z A-Z]/.test(modifiedAdmins[0].first_name)) {
			setErrTxts({ ...errTxts, first_name: 'Please enter a valid value.' });
			scrollIntoView('fname0');
			return;
		}
		if (!modifiedAdmins[0].last_name) {
			setErrTxts({ ...errTxts, last_name: 'This field is required' });
			scrollIntoView('lname0');
			return;
		}
		if (modifiedAdmins[0].last_name && /[^a-z A-Z]/.test(modifiedAdmins[0].last_name)) {
			setErrTxts({ ...errTxts, last_name: 'Please enter a valid value.' });
			scrollIntoView('lname0');
			return;
		}
		if (!modifiedAdmins[0].email) {
			setErrTxts({ ...errTxts, email: 'This field is required' });
			scrollIntoView('email0');
			return;
		}
		if (modifiedAdmins[0].email && !/^\S+@\S+\.\S+$/.test(modifiedAdmins[0].email)) {
			setErrTxts({ ...errTxts, email: 'Please enter a valid value.' });
			scrollIntoView('email0');
			return;
		}
		if (!modifiedAdmins[0].phone) {
			setErrTxts({ ...errTxts, phone: 'This field is required' });
			scrollIntoView('phone0');
			return;
		}
		if (modifiedAdmins[0].phone) {
			if (
				!Number.isFinite(
					Number(
						modifiedAdmins[0].phone
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
				scrollIntoView('phone0');
				return;
			}
		}
		if (!modifiedAdmins[0].designation) {
			setErrTxts({ ...errTxts, designation: 'This field is required.' });
			scrollIntoView('designation0');
			return;
		}
		if (!modifiedRow.school_name) {
			setErrTxts({ ...errTxts, school_name: 'This field is required' });
			return;
		}
		if (modifiedRow.school_name && /[^a-z A-Z]/.test(modifiedRow.school_name)) {
			setErrTxts({ ...errTxts, school_name: 'Please enter a valid value.' });
			return;
		}

		if (!modifiedRow.school_phone) {
			setErrTxts({ ...errTxts, school_phone: 'This field is required' });
			return;
		}
		if (modifiedRow.school_phone) {
			if (
				!Number.isFinite(
					Number(
						modifiedRow.school_phone
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
				setErrTxts({ ...errTxts, school_phone: 'Please enter valid phone number' });
				return;
			}
		}
		if (!modifiedRow.address) {
			setErrTxts({ ...errTxts, address: 'This field is required.' });
			return;
		}
		if (!modifiedRow.total_students) {
			setErrTxts({ ...errTxts, total_students: 'This field is required.' });
			return;
		}
		if (!modifiedRow.country) {
			setErrTxts({ ...errTxts, country: 'This field is required.' });
			return;
		}
		if (!modifiedRow.state_id) {
			setErrTxts({ ...errTxts, state_id: 'This field is required.' });
			return;
		}

		if (!modifiedRow.city) {
			setErrTxts({ ...errTxts, city: 'This field is required.' });
			return;
		}

		if (!modifiedRow.zip_code) {
			setErrTxts({ ...errTxts, zip_code: 'This field is required.' });
			return;
		}
		if (typeof modifiedRow.zip_code !== 'number' && Number.isInteger(modifiedRow.zip_code)) {
			setErrTxts({ ...errTxts, zip_code: 'Zipcode must be a number' });
			return;
		}

		setIsSaving(true);
		const data = JSON.parse(JSON.stringify(modifiedRow));
		data.school_admins = modifiedAdmins?.map((admin) => {
			if (admin.phone) {
				return {
					...admin,
					user_id: admin.id,
					phone: parseInt(
						String(admin.phone)
							.split(' ')
							.join('')
							.split('-')
							.join('')
							.split('(')
							.join('')
							.split(')')
							.join('')
							.split('.')
							.join(''),
						10
					),
				};
			}
			return admin;
		});
		data.school_phone = modifiedRow?.school_phone;
		if (data.school_phone) {
			data.school_phone = parseInt(
				String(data.school_phone)
					.split(' ')
					.join('')
					.split('-')
					.join('')
					.split('(')
					.join('')
					.split(')')
					.join('')
					.split('.')
					.join(''),
				10
			);
		}
		if (data.state_id) {
			data.state_id = data.state_id;
		}
		if (data.city) {
			data.city = data.city;
			data.time_zone = cityTimezone;
		}
		const payload = {
			address: data.address,
			city: data.city,
			country_code: data.country,
			school_admins: data.school_admins,
			school_name: data.school_name,
			school_phone: data.school_phone,
			state_id: data.state_id,
			status: data.status,
			street: data.street,
			timezone: cityTimezone,
			timezone_checkin: cityTimezone,
			total_students: data.total_students,
			zip_code: data.zip_code,
		};
		if (selectedFile) {
			const filename = getImageUrl(selectedFile);
			uploadFile(selectedFile, filename).then((response) => {
				payload.school_profile_image = `${process.env.REACT_APP_S3_BASE_URL}${response}`;
				updateSchool(payload, row.id)
					.then((res) => {
						dispatch(
							Actions.showMessage({
								message: res.data.message,
								variant: 'success',
							})
						);
						history.push('/schools');
					})
					.catch((err) => {
						setIsSaving(false);
						dispatch(
							Actions.showMessage({
								message: 'Failed to update School Data',
							})
						);
						if (err?.response?.data?.errors) {
							setErrTxts(err.response.data.errors);
						}
					})
					.finally(() => {
						setIsSaving(false);
					});
			});
		} else {
			updateSchool(payload, row.id)
				.then((res) => {
					dispatch(
						Actions.showMessage({
							message: res.data.message,
							variant: 'success',
						})
					);
					history.push('/schools');
				})
				.catch((err) => {
					setIsSaving(false);
					dispatch(
						Actions.showMessage({
							message: 'Failed to update School Data',
						})
					);
					if (err?.response?.data?.errors) {
						setErrTxts(err.response.data.errors);
					}
				})
				.finally(() => {
					setIsSaving(false);
				});
		}
	};

	useEffect(() => {
		if (latLong.lat !== '' && latLong.long !== '') {
			setCityTimeZone(tzlookup(latLong.lat, latLong.long));
		}
	}, [latLong]);

	useEffect(() => {
		const timeout = setTimeout(() => {
			setIsStateloading(true);
			setStates([]);
			getSearchableStateList(searchStateQuery, searchStateQuery ? undefined : 1)
				.then((res) => {
					setStates(res.data.data);
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
		}, 1000);
		return () => {
			clearTimeout(timeout);
		};
	}, [dispatch, modifiedRow.country_code, searchStateQuery]);

	useEffect(() => {
		const timeout = setTimeout(() => {
			setIsCityLoading(true);
			setCity([]);
			if (!searchCityQuery && !modifiedRow.state_id) {
				setCity([]);
			} else {
				getSearchableCityList(modifiedRow.state_id, searchCityQuery, 1)
					.then((res) => {
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
	}, [modifiedRow.state_id, searchCityQuery]);

	useEffect(() => {
		setIsLoading(true);
		getCountryList()
			.then((res) => {
				setCountries(res.data);
				setIsLoading(false);
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
					<div className="items-end mb-20 justify-between overall-box">
						<div className="flex items-center flex-nowrap justify-between mx-auto">
							<span className="personal-hd info-hd stext-2xl self-end ">
								<h1
									className="text-lg self-end font-extrabold mr-59 hd0-edit"
									style={{ marginLeft: '0px' }}
								>
									{' '}
									<span className="">
										<IconButton
											onClick={() => {
												history.push('/schools');
											}}
										>
											<img
												src="assets/images/arrow-long.png"
												alt="filter"
												width="24px"
												className=""
											/>
										</IconButton>
									</span>{' '}
									School
								</h1>
							</span>
							<div className="personal-button flex justify-between">
								{!isEditing ? (
									// <button
									// 	type="button"
									// 	className="self-end edit-btn"
									// 	onClick={() => {
									// 		setIsEditing(true);
									// 	}}
									// >
									// 	Edit
									// </button>
									<CustomButton
										variant="secondary self-end mr-32"
										onClick={() => {
											setIsEditing(true);
										}}
									>
										Edit
									</CustomButton>
								) : (
									''
								)}
							</div>
						</div>

						<div className="edit-input">
							<div className="flex justify-between items-center">
								<h2 className="" style={{ fontSize: '18px', fontWeight: '700' }}>
									School Admin Info
								</h2>
							</div>
							<div className="flex col-gap-52 mt-12">
								{!isEditing ? (
									<div className="row-span-2 school-camera-holder" style={{ justifySelf: 'center' }}>
										<Avatar src={preview} style={{ width: 120, height: 120 }} />
									</div>
								) : (
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
								)}

								<form onSubmit={handleSave}>
									{modifiedAdmins?.map((admin, index) => (
										<fieldset className={index !== 0 && 'my-10 bg-grey-100 pt-4'} key={index}>
											<TextField
												disabled={!isEditing}
												error={
													!!(
														errTxts[`school_admins.${index}.first_name`] ||
														errTxts.first_name
													)
												}
												helperText={
													errTxts[`school_admins.${index}.first_name`] || errTxts.first_name
												}
												name="first_name"
												value={modifiedAdmins[index].first_name}
												onChange={(event) => handleChange(event, index)}
												id={`fname${index}`}
												label="First Name of Sub-Admin"
											/>
											<TextField
												disabled={!isEditing}
												error={
													!!(errTxts[`school_admins.${index}.last_name`] || errTxts.last_name)
												}
												helperText={
													errTxts[`school_admins.${index}.last_name`] || errTxts.last_name
												}
												name="last_name"
												value={modifiedAdmins[index].last_name}
												onChange={(event) => handleChange(event, index)}
												id={`lname${index}`}
												label="Last Name of Sub-Admin"
											/>
											<TextField
												disabled={!!modifiedAdmins[index].id}
												error={!!(errTxts[`school_admins.${index}.email`] || errTxts.email)}
												helperText={errTxts[`school_admins.${index}.email`] || errTxts.email}
												name="email"
												value={modifiedAdmins[index].email}
												onChange={(event) => handleChange(event, index)}
												id={`email${index}`}
												label="Email Address"
											/>
											<TextField
												disabled={!isEditing}
												error={!!(errTxts[`school_admins.${index}.phone`] || errTxts.phone)}
												helperText={errTxts[`school_admins.${index}.phone`] || errTxts.phone}
												name="phone"
												value={modifiedAdmins[index].phone}
												onChange={(event) => handleChange(event, index)}
												id={`phone${index}`}
												label="Admin Contact Number"
											/>
											<TextField
												disabled={!isEditing}
												error={
													!!(
														errTxts[`school_admins.${index}.designation`] ||
														errTxts.designation
													)
												}
												helperText={
													errTxts[`school_admins.${index}.designation`] || errTxts.designation
												}
												name="designation"
												value={modifiedAdmins[index].designation}
												onChange={(event) => handleChange(event, index)}
												id={`designation${index}`}
												label="Designation"
											/>
										</fieldset>
									))}
									<fieldset>
										<h1 style={{ fontSize: '18px', fontWeight: '700' }}>School Info</h1>
										<TextField
											disabled
											name="school_code"
											value={otp}
											id="school_code"
											label="School Code"
										/>
										<TextField
											disabled={!isEditing}
											error={!!errTxts?.school_name}
											helperText={errTxts?.school_name}
											name="school_name"
											value={modifiedRow?.school_name}
											onChange={handleChange}
											id="school_name"
											label="Name of School"
										/>
										<TextField
											disabled
											name="total_students"
											value={modifiedRow?.total_students}
											onChange={handleChange}
											id="total_students"
											label="Total Students"
										/>
										<TextField
											disabled={!isEditing}
											error={!!errTxts?.school_phone}
											helperText={errTxts?.school_phone}
											name="school_phone"
											value={modifiedRow?.school_phone}
											onChange={handleChange}
											id="school_phone"
											label="Contact Number"
										/>
										<TextField
											disabled={!isEditing}
											error={!!errTxts?.address}
											helperText={errTxts?.address}
											name="address"
											value={modifiedRow?.address}
											onChange={handleChange}
											id="address"
											label="Address 1"
										/>
										<div className="flex">
											<TextField
												disabled={!isEditing}
												error={!!errTxts?.street}
												helperText={errTxts?.street}
												name="street"
												value={modifiedRow?.street}
												onChange={handleChange}
												id="street"
												label="Address 2"
											/>
											<FormControl
												error={!!errTxts?.country_code}
												className="country-width mr-40"
											>
												<InputLabel id="country_code">Country</InputLabel>
												<Select
													disabled={!isEditing}
													name="country"
													value={modifiedRow.country}
													onChange={handleChange}
													labelId="country_code"
													id="country_code"
												>
													{countries?.length ? (
														countries.map((country) => {
															return (
																<MenuItem key={country.id + 60} value={country.code}>
																	{country.name}
																</MenuItem>
															);
														})
													) : (
														<MenuItem>Loading...</MenuItem>
													)}
												</Select>
												{errTxts?.country_code && (
													<FormHelperText>{errTxts?.country_code}</FormHelperText>
												)}
											</FormControl>
											<Autocomplete
												disabled={!isEditing}
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
													setDefaultState(v);
													setModifiedRow({ ...modifiedRow, state_id: v?.id || '' });
												}}
												onInputChange={(e, value) => {
													setStateSearchQuery(value);
													if (value === '') {
														setModifiedRow({
															...modifiedRow,
															state_id: '',
															city: '',
														});
														setDefaultCity({ ...defaultState, name: '' });
													}
												}}
												value={defaultState}
												renderInput={(params) => (
													<TextField
														{...params}
														label="State"
														style={{ width: 190 }}
														error={!!errTxts.state_id?.length}
														helperText={errTxts.state_id}
														autoComplete="off"
														defaultValue={defaultState}
													/>
												)}
											/>
										</div>
										<div className="flex">
											<Autocomplete
												disabled={!isEditing}
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
													setDefaultCity(v);
													const value = JSON.parse(v?.meta);
													setLatLong({
														...latLong,
														lat: value.latitude,
														long: value.longitude,
													});
													setModifiedRow({ ...modifiedRow, city: v?.name });
												}}
												value={defaultCity}
												renderInput={(params) => (
													<TextField
														{...params}
														label="City"
														style={{ width: 190 }}
														error={!!errTxts.city?.length}
														helperText={errTxts.city}
														autoComplete="off"
														onChange={(e) => setSearchCityQuery(e.target.value)}
														defaultValue={defaultCity}
													/>
												)}
											/>
											<TextField
												disabled={!isEditing}
												error={!!errTxts.zip_code}
												helperText={errTxts.zip_code}
												name="zip_code"
												value={modifiedRow.zip_code}
												onChange={handleChange}
												id="zip_code"
												label="Zipcode"
											/>
											<FormControl className="country-width">
												<InputLabel id="state-label">Status</InputLabel>
												<Select
													name="status"
													value={modifiedRow.status}
													onChange={handleChange}
													labelId="status-label"
													id="status"
													placeholder="Status"
													disabled={!isEditing || !modifiedRow.account_connected_status}
												>
													<MenuItem selected value={1}>
														Active
													</MenuItem>
													<MenuItem value={0}>Inactive</MenuItem>
												</Select>
											</FormControl>
										</div>
									</fieldset>
									{isEditing ? (
										!isSaving ? (
											<div className="flex justify-center mr-128" style={{ gap: 20 }}>
												<CustomButton variant="secondary" onClick={handleCancel}>
													Cancel
												</CustomButton>
												<CustomButton variant="primary" type="submit">
													update
												</CustomButton>
											</div>
										) : (
											<div className="flex align-center justify-center">
												<CircularProgress />
											</div>
										)
									) : (
										<></>
									)}
								</form>
							</div>
						</div>
					</div>
				</div>
			</FuseAnimate>
		</FuseScrollbars>
	);
}

export default EditSchools;
