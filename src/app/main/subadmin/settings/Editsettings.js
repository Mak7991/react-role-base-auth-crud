import React, { useState, useEffect, useRef } from 'react';
import { CircularProgress, TextField, FormControl, FormHelperText, Avatar, IconButton } from '@material-ui/core';
import CustomButton from 'app/customComponents/CustomButton/CustomButton';
import './Settings.css';
import history from '@history';
import { updatesettings, getCountryList, getSchoolDetailsByiD } from 'app/services/settings/settings';
import { getSearchableStateList, getSearchableCityList } from 'app/services/schools/schools';
import { useDispatch, useSelector } from 'react-redux';
import * as Actions from 'app/store/actions';
import Select from '@material-ui/core/Select';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import axios from 'axios';
import { useParams } from 'react-router';
import FuseScrollbars from '@fuse/core/FuseScrollbars';
import { makeStyles } from '@material-ui/core/styles';
import { uploadFile } from 'app/services/imageUpload/imageUpload';
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
function Editsettings() {
	const classes = useStyles();
	const inputRef = useRef(null);
	const [selectedFile, setSelectedFile] = useState(null);
	const [preview, setPreview] = useState(null);
	const [isLoading, setIsLoading] = useState(true);
	const [countries, setCountries] = useState([]);
	const [city, setCity] = useState([]);
	const [latLong, setLatLong] = useState({ lat: '', long: '' });
	const [cityTimezone, setCityTimeZone] = useState();
	const geocoder = require('google-geocoder');
	const tzlookup = require('tz-lookup');
	const geo = geocoder({
		key: process.env.REACT_APP_GOOGLE_API_ENDPOINT,
	});
	const [modifieduser, setModifieduser] = useState({});
	const [isSaving, setIsSaving] = useState(false);
	const [errTxts, setErrTxts] = useState({});
	const dispatch = useDispatch();
	const [states, setStates] = useState([]);
	const [timeZones, setTimeZones] = useState([]);
	const [hasMore, setHasMore] = useState(false);
	const user = useSelector(({ auth }) => auth.user);
	const { id } = useParams();
	const [isStateloading, setIsStateloading] = useState(false);
	const [searchStateQuery, setStateSearchQuery] = useState('');
	const [isCityLoading, setIsCityLoading] = useState(false);
	const [searchCityQuery, setSearchCityQuery] = useState('');
	const [defaultCity, setDefaultCity] = useState({});
	const [defaultState, setDefaultState] = useState({});

	useEffect(() => {
		setIsLoading(true);
		getSchoolDetailsByiD(id)
			.then((res) => {
				setPreview(res?.data?.logo);
				setModifieduser({
					school_name: res.data.name,
					address: res.data.address,
					address2: res.data.address2,
					school_phone: res.data.phone,
					website: res.data.website,
					country_code: res.data.country_code,
					state_id: res.data.state_id,
					city: res.data.city,
					street: res.data.street,
					zip_code: res.data.zip_code,
					timezone_checkin: res.data.timezone,
					timezone: res.data.timezone,
					status: res.data.status,
				});
				setDefaultState(res.data.state);
				setDefaultCity({ name: res.data.city });
				setIsLoading(false);
			})
			.catch((err) => {
				dispatch(
					Actions.showMessage({
						message: 'Failed to get details.',
						autoHideDuration: 1500,
						variant: 'error',
					})
				);
				setIsLoading(false);
			});
	}, []);

	useEffect(() => {
		if (modifieduser.state_id && states.length > 0) {
			setDefaultState({ id: defaultState.id, name: defaultState.name });
			setDefaultCity({ name: modifieduser.city });
		}
	}, [isLoading, states]);

	const handleChange = (e) => {
		const { name, value } = e.target;
		setErrTxts({ ...errTxts, [name]: '' });
		setModifieduser({ ...modifieduser, [name]: value });
		if (name === 'country_code') {
			setErrTxts({ ...errTxts, country_code: '' });
			setModifieduser({ ...modifieduser, country_code: value, state_id: '', city: '' });
			return;
		}
		if (name === 'state_id') {
			setErrTxts({ ...errTxts, state_id: '' });
			setModifieduser({ ...modifieduser, state_id: value, city: '' });
		}
	};

	useEffect(() => {
		if (modifieduser.city !== '') {
			geo.find(`${modifieduser.city}`, (err, res) => {
				// process response object
				if (res) {
					const value = res[0]?.location;
					console.log(value, '88888');
					if (value === undefined) {
						// dispatch(
						// 	Actions.showMessage({
						// 		message: 'Failed to get TimeZone',
						// 		autoHideDuration: 1500,
						// 		variant: 'error'
						// 	})
						// );
						console.log(value, 'Failed to get TimeZone');
					} else {
						setLatLong({ ...latLong, lat: value.lat, long: value.lng });
					}
				} else {
					setLatLong({ ...latLong, lat: '', long: '' });
					console.log(err);
				}
			});
		}
	}, [modifieduser.city]);

	useEffect(() => {
		if (latLong.lat !== '' && latLong.long !== '') {
			console.log(tzlookup(latLong.lat, latLong.long));
			setCityTimeZone(tzlookup(latLong.lat, latLong.long));
			setModifieduser({ ...modifieduser, timezone_checkin: tzlookup(latLong.lat, latLong.long) });
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
	}, [dispatch, modifieduser.country_code, searchStateQuery]);

	useEffect(() => {
		const timeout = setTimeout(() => {
			setIsCityLoading(true);
			setCity([]);
			if (!searchCityQuery && !modifieduser.state_id) {
				setCity([]);
			} else {
				getSearchableCityList(modifieduser.state_id, searchCityQuery, 1)
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
	}, [modifieduser.state_id, searchCityQuery]);

	useEffect(() => {
		// setIsLoading(true);
		getCountryList()
			.then((res) => {
				setCountries(res.data);
				// setIsLoading(false);
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

	useEffect(() => {
		axios.get('/api/v1/timezones').then((res) => {
			setTimeZones(res.data);
			if (res.data.last_page > res.data.current_page) {
				setHasMore(true);
			} else {
				setHasMore(false);
			}
		});
	}, []);

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

	const handleSubmit = () => {
		if (!modifieduser.school_name) {
			setErrTxts({ ...errTxts, school_name: 'This field is required' });
			return;
		}
		if (!modifieduser.address) {
			setErrTxts({ ...errTxts, address: 'This field is required' });
			return;
		}
		// if (!modifieduser.website) {
		// 	setErrTxts({ ...errTxts, website: 'This field is required' });
		// 	return;
		// }
		if (!modifieduser.school_phone) {
			setErrTxts({ ...errTxts, school_phone: 'This field is required' });
			return;
		}
		if (modifieduser.school_phone) {
			const phoneNumber = modifieduser.school_phone
				.split(' ')
				.join('')
				.split('-')
				.join('')
				.split('(')
				.join('')
				.split(')')
				.join('');

			if (!Number(phoneNumber)) {
				setErrTxts({ ...errTxts, school_phone: 'Please enter valid phone number' });
				return;
			}
		}
		if (typeof modifieduser.zip_code !== 'number' && Number.isInteger(modifieduser.zip_code)) {
			setErrTxts({ ...errTxts, zip_code: 'Zipcode must be a number' });
			return;
		}

		if (!modifieduser.website) {
			delete modifieduser.website;
		}
		if (modifieduser.timezone_checkin) {
			modifieduser.timezone = cityTimezone;
			modifieduser.timezone_checkin = cityTimezone;
		}
		if (selectedFile) {
			const filename = getImageUrl(selectedFile);
			setIsSaving(true);
			uploadFile(selectedFile, filename).then((response) => {
				modifieduser.school_profile_image = `${process.env.REACT_APP_S3_BASE_URL}${response}`;
				updatesettings(modifieduser)
					.then((resp) => {
						dispatch(
							Actions.showMessage({
								message: resp.data.message,
								autoHideDuration: 1500,
								variant: 'success',
							})
						);
						// const user = {
						// 	school: {
						// 		timezone: cityTimezone,
						// 	},
						// };
						// dispatch(UserActions.setUserData(user));
						history.goBack();
					})
					.catch((err) => {
						if (err.response?.data?.errors) {
							setErrTxts(err.response.data.errors);
						} else {
							dispatch(
								Actions.showMessage({
									message: 'Failed to edit settings.',
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
			updatesettings(modifieduser)
				.then((resp) => {
					dispatch(
						Actions.showMessage({
							message: resp.data.message,
							autoHideDuration: 1500,
							variant: 'success',
						})
					);
					// const user = {
					// 	school: {
					// 		timezone: cityTimezone,
					// 	},
					// };
					// dispatch(UserActions.setUserData(user));
					history.goBack();
				})
				.catch((err) => {
					if (err.response?.data?.errors) {
						setErrTxts(err.response.data.errors);
					} else {
						dispatch(
							Actions.showMessage({
								message: 'Failed to edit settings.',
								autoHideDuration: 1500,
								variant: 'error',
							})
						);
					}
				})
				.finally(() => setIsSaving(false));
		}
	};

	return (
		<FuseScrollbars className={classes.content} scrollToTopOnRouteChange>
			<div className="m-32">
				<div className="setinfo flex items-center flex-nowrap justify-between mx-auto">
					<span className="totalRooms-heading" style={{ fontWeight: '700' }}>
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
						Settings
					</span>
					<div className="personal-button flex justify-between" />
				</div>
				<div className="bg-white rounded mt-28 p-32">
					{isLoading ? (
						<div className="flex align-center justify-center">
							<CircularProgress size={35} />
						</div>
					) : (
						<>
							<div className="bg-white rounded mx-auto" style={{ paddingBottom: '70px' }}>
								<div className="setting-pos">
									<div className="flex-shrink-0 " style={{ marginBottom: '20px' }}>
										<span className="" style={{ fontSize: '18px', fontWeight: '700' }}>
											School Profile
										</span>
									</div>
									<div className="flex col-gap-52 mt-12">
										<div
											onClick={() => inputRef.current.click()}
											className="row-span-2 setting-camera-holder"
											style={{ justifySelf: 'center' }}
										>
											<Avatar
												src={preview}
												style={{ width: 120, height: 120, cursor: 'pointer' }}
											/>
											<div className="setting-pp-overlay">
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
										<div className="grid grid-cols-2 w-full">
											<div className=" insert-field">
												<TextField
													helperText={errTxts.school_name}
													error={errTxts.school_name}
													className="text-field"
													onChange={handleChange}
													value={modifieduser.school_name}
													name="school_name"
													label="School name"
												/>
											</div>
											<div className="last-field">
												<TextField
													helperText={errTxts.address}
													error={errTxts.address}
													onChange={handleChange}
													className="text-field"
													value={modifieduser.address}
													name="address"
													label="Address 1"
												/>
											</div>
											<div className="insert-field">
												<TextField
													onChange={handleChange}
													className="text-field"
													value={modifieduser.address2}
													name="address2"
													label="Address 2"
													// helperText={errTxts.email}
													// error={errTxts.email}
													// className="capitalize-text"
													// disabled={modifieduser.role !== 'super_admin'}
												/>
											</div>
											<div className="last-field">
												<TextField
													onChange={handleChange}
													className="text-field"
													value={modifieduser.school_phone}
													name="school_phone"
													label="School phone no"
													helperText={errTxts.school_phone}
													error={errTxts.school_phone}
												/>
											</div>

											<div className="insert-field">
												<TextField
													onChange={handleChange}
													className="text-field"
													value={modifieduser.website}
													name="website"
													label="The school website link"
													helperText={errTxts.website}
													error={errTxts.website}
												/>
											</div>
											<div className="last-field">
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
														setDefaultState(v);
														setModifieduser({ ...modifieduser, state_id: v?.id || '' });
													}}
													onInputChange={(e, value) => {
														setStateSearchQuery(value);
														if (value === '') {
															setModifieduser({
																...modifieduser,
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
															style={{ width: '100%' }}
															error={!!errTxts.state_id?.length}
															helperText={errTxts.state_id}
															autoComplete="off"
															defaultValue={defaultState}
														/>
													)}
												/>

												{/* <FormControl error={!!errTxts.city} className="select-country">
													<InputLabel id="state-label">City</InputLabel>
													<Select
														name="city"
														value={modifieduser.city}
														onChange={handleChange}
														labelId="city-label"
														style={{ maxHeight: '400px' }}
														id="school-city"
														disabled={!states || !modifieduser.state_id}
													>
														{city?.length ? (
															city.map(city => {
																return (
																	<MenuItem key={city.id} value={city.name}>
																		<span id={city.id}>{city.name}</span>
																	</MenuItem>
																);
															})
														) : (
															<MenuItem>Loading...</MenuItem>
														)}
													</Select>
													{errTxts.city && <FormHelperText>{errTxts.city}</FormHelperText>}
												</FormControl> */}
											</div>

											<div className="field-main">
												<div className="last-field half-field">
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
															setDefaultCity(v);
															setModifieduser({ ...modifieduser, city: v?.name });
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

													{/* <FormControl error={!!errTxts.state_id} className="select-country">
														<TextField
															name="state_id"
															label="State"
															disabled={!countries || !modifieduser.country_code}
															value={modifieduser.state_id}
															select
															onChange={handleChange}
															style={{ maxHeight: '400px' }}
															labelId="state-label"
															id="state_id"
														>
															{states.length ? (
																states.map(state => {
																	return (
																		<MenuItem key={state.id} value={state.id}>
																			{state.name}
																		</MenuItem>
																	);
																})
															) : (
																<MenuItem>Loading...</MenuItem>
															)}
														</TextField>
														{errTxts.state_id && (
															<FormHelperText>{errTxts.state_id}</FormHelperText>
														)}
													</FormControl> */}
												</div>
												<div className=" insert-field half-field">
													<TextField
														onChange={handleChange}
														className="text-field"
														value={modifieduser.zip_code}
														name="zip_code"
														label="Zip Code"
														helperText={errTxts.zip_code}
														error={errTxts.zip_code}
													/>
												</div>
											</div>

											<div className="last-field">
												<FormControl
													error={!!errTxts.timezone_checkin}
													className="select-country"
												>
													<InputLabel id="timezone_checkin">
														Time Zone For Check In
													</InputLabel>
													<Select
														name="timezone_checkin"
														value={modifieduser.timezone_checkin}
														onChange={handleChange}
														labelId="time-zone"
														id="timezone_checkin"
													>
														{timeZones.length ? (
															timeZones.map((timeZone, key) => {
																return (
																	<MenuItem key={key} value={timeZone.name}>
																		{timeZone.name}
																	</MenuItem>
																);
															})
														) : (
															<MenuItem>Loading...</MenuItem>
														)}
													</Select>

													{errTxts.timezone_checkin && (
														<FormHelperText>{errTxts.timezone_checkin}</FormHelperText>
													)}
												</FormControl>
											</div>
											<div className=" insert-field">
												<FormControl error={!!errTxts.country_code} className="select-country">
													{/* <InputLabel id="country-label">Country</InputLabel> */}
													<TextField
														name="country_code"
														select
														label="Country"
														value={modifieduser?.country_code}
														onChange={handleChange}
														labelId="country-label"
														style={{ maxHeight: '400px' }}
														id="country"
													>
														{countries?.length ? (
															countries.map((country) => {
																return (
																	<MenuItem key={country.id} value={country.code}>
																		{country.name}
																	</MenuItem>
																);
															})
														) : (
															<MenuItem>Loading...</MenuItem>
														)}
													</TextField>
													{errTxts.country_code && (
														<FormHelperText>{errTxts.country_code}</FormHelperText>
													)}
												</FormControl>
											</div>
										</div>
									</div>
								</div>
								<div className={`btnedit ${isSaving ? 'pt-8' : ''} text-center`}>
									{!isSaving ? (
										<div className="center-btn margin-btn">
											<CustomButton
												variant="secondary"
												width="137px"
												height="35px"
												fontSize="15px"
												onClick={() => {
													history.goBack();
												}}
											>
												Cancel
											</CustomButton>

											<CustomButton
												variant="primary"
												width="137px"
												height="35px"
												fontSize="15px"
												marginRight="22px"
												onClick={handleSubmit}
											>
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
						</>
					)}
				</div>
			</div>
		</FuseScrollbars>
	);
}

export default Editsettings;
