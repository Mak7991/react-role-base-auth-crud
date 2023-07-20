/* eslint-disable consistent-return */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/control-has-associated-label */
import React, { useState, useEffect, useRef } from 'react';
import './StudentInformation.css';
import CustomButton from 'app/customComponents/CustomButton/CustomButton';
import history from '@history';
import {
	TextField,
	InputLabel,
	MenuItem,
	FormControl,
	Select,
	FormHelperText,
	Avatar,
	CircularProgress,
	IconButton,
} from '@material-ui/core/';
import CustomDatePicker from 'app/customComponents/CustomDatePicker/CustomDatePicker';
import { uploadFile } from 'app/services/imageUpload/imageUpload';
import { updateStudent } from 'app/services/students/students';
import { useDispatch } from 'react-redux';
import * as Actions from 'app/store/actions';
import dayjs from 'dayjs';
import Autocomplete from '@material-ui/lab/Autocomplete';
import { getSearchableStateList, getSearchableCityList } from 'app/services/schools/schools';
import { getCountryList } from 'app/services/settings/settings';
import { getImageUrl } from 'utils/utils';

function EditStudent() {
	const dispatch = useDispatch();

	useEffect(() => {
		if (!history.location.state?.student) {
			history.goBack();
		}
	}, [history.location.state?.student]);

	const [modifiedStudent, setModifiedStudent] = useState({
		...history.location.state.student,
		address1: history.location.state.student?.address1 || '',
		address2: history.location.state.student?.address2 || '',
		notes: history.location.state.student?.notes || '',
		country_code: history.location.state.student?.country?.code || '',
		state_id: history.location.state.student?.state?.id || '',
		city: history.location.state.student?.city?.name || '',
		zip_code: history.location.state.student?.zip_code || '',
		country_id: history.location.state.student?.country?.id || '',
	});

	const [errTxts, setErrTxts] = useState({});
	const [selectedFile, setSelectedFile] = useState();
	const [preview, setPreview] = useState(history.location.state.student?.photo);
	const [isSaving, setIsSaving] = useState(false);
	const inputRef = useRef(null);
	const [date, setDate] = useState(modifiedStudent.date_of_birth);
	const [isStateloading, setIsStateloading] = useState(false);
	const [searchStateQuery, setStateSearchQuery] = useState('');
	const [isCityLoading, setIsCityLoading] = useState(false);
	const [searchCityQuery, setSearchCityQuery] = useState('');
	const [defaultCity, setDefaultCity] = useState(history.location.state.student?.city);
	const [defaultState, setDefaultState] = useState(history.location.state.student?.state);
	const [countries, setCountries] = useState([]);
	const [city, setCity] = useState([]);
	const [states, setStates] = useState([]);

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

	useEffect(() => {
		const timeout = setTimeout(() => {
			setIsStateloading(true);
			setStates([]);
			setCity([]);
			if (!searchStateQuery && !modifiedStudent.country_code) {
				setIsStateloading(true);
				setStates([]);
			} else {
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
			}
		}, 1000);
		return () => {
			clearTimeout(timeout);
		};
	}, [dispatch, modifiedStudent.country_code, searchStateQuery]);

	useEffect(() => {
		const timeout = setTimeout(() => {
			setIsCityLoading(true);
			setCity([]);
			if (!searchCityQuery && !modifiedStudent.state_id) {
				setCity([]);
			} else {
				getSearchableCityList(modifiedStudent.state_id, searchCityQuery, 1)
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
	}, [modifiedStudent.state_id, searchCityQuery]);

	useEffect(() => {
		if (date) {
			if (dayjs(date).format('YYYY-MM-DD') === modifiedStudent.date_of_birth) {
				return;
			}
			setModifiedStudent({ ...modifiedStudent, date_of_birth: dayjs(date).format('YYYY-MM-DD') });
		} else {
			setModifiedStudent({ ...modifiedStudent, date_of_birth: '' });
		}
	}, [date, modifiedStudent.date_of_birth]);

	useEffect(() => {
		if (!selectedFile) {
			setPreview(history.location.state.student?.photo);
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

	const handleChange = (e) => {
		const { name, value } = e.target;
		setErrTxts({ ...errTxts, [name]: '' });
		setModifiedStudent({ ...modifiedStudent, [name]: value });
		if (name === 'country_code') {
			setErrTxts({ ...errTxts, country_code: '' });
			setModifiedStudent({ ...modifiedStudent, country_code: value, country_id: value });
			return;
		}
		if (name === 'state_id') {
			setErrTxts({ ...errTxts, state_id: '' });
		}
		if (name === 'city') {
			setErrTxts({ ...errTxts, city: '' });
		}
		if (modifiedStudent.zip_code) {
			setErrTxts({ ...errTxts, zipcode: '' });
		}
	};

	const handleSubmit = () => {
		if (!modifiedStudent.first_name) {
			setErrTxts({ ...errTxts, first_name: 'This field is required' });
			return;
		}
		if (modifiedStudent.first_name && /[^a-zA-Z]/.test(modifiedStudent.first_name)) {
			setErrTxts({ ...errTxts, first_name: 'Please enter a valid name.' });
			return;
		}
		if (!modifiedStudent.last_name) {
			setErrTxts({ ...errTxts, last_name: 'This field is required' });
			return;
		}
		if (modifiedStudent.last_name && /[^a-zA-Z]/.test(modifiedStudent.last_name)) {
			setErrTxts({ ...errTxts, last_name: 'Please enter a valid name.' });
			return;
		}
		if (!modifiedStudent.address1) {
			setErrTxts({ ...errTxts, address1: 'This field is required' });
			return;
		}
		if (!modifiedStudent.country_code) {
			setErrTxts({ ...errTxts, country_code: 'This field is required' });
			return;
		}
		if (!modifiedStudent.state_id) {
			setErrTxts({ ...errTxts, state_id: 'This field is required' });
			return;
		}
		if (!modifiedStudent.city) {
			setErrTxts({ ...errTxts, city: 'This field is required' });
			return;
		}
		if (!modifiedStudent.zip_code) {
			setErrTxts({ ...errTxts, zip_code: 'This field is required' });
			return;
		}

		delete modifiedStudent.notes;

		if (selectedFile) {
			const filename = getImageUrl(selectedFile)
			setIsSaving(true);
			uploadFile(selectedFile, filename).then((response) => {
				modifiedStudent.photo = `${process.env.REACT_APP_S3_BASE_URL}${response}`;
				modifiedStudent.thumb = `${process.env.REACT_APP_S3_BASE_URL}${response}`;
				updateStudent(modifiedStudent.id, modifiedStudent)
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
					.finally(() => setIsSaving(false));
			});
		} else {
			setIsSaving(true);
			updateStudent(modifiedStudent.id, modifiedStudent)
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
				.finally(() => setIsSaving(false));
		}
	};

	return (
		<div className="P-m">
			<div className="stdinfo flex items-center flex-nowrap justify-between mx-auto">
				<span className="personal-hd info-hd stext-2xl self-end font-extrabold ">
					<h1 className="hd-main" style={{ fontSize: '20px' }}>
						{' '}
						<span className="mr-12 icon-color">
							<IconButton
								onClick={() => {
									history.goBack();
								}}
							>
								<img
									src="assets/images/arrow-long.png"
									alt="filter"
									width="24px"
									className="fiterimg"
								/>
							</IconButton>
						</span>{' '}
						Edit Personal Information
					</h1>
				</span>
			</div>

			<div className="editwidth">
				<div className="white-back flex justify-between">
					<div
						className="flex justify-between"
						style={{
							padding: '50px 80px 0px 20px',
						}}
					>
						<div
							className="relative pic-upload-overlay cursor-pointer mx-40 flex-grow "
							onClick={() => inputRef.current.click()}
						>
							<Avatar style={{ height: '140px', width: '140px' }} src={preview} className="imageupload" />
							<div className="ppinputoverlay personaledit">
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
						<div className="grid grid-cols-3 personal-margin">
							<div className="margin-33 field-margin">
								<TextField
									helperText={errTxts.first_name}
									error={errTxts.first_name}
									onChange={handleChange}
									value={modifiedStudent.first_name}
									name="first_name"
									label="First Name"
								/>
							</div>
							<div className="margin0-33 field-margin">
								<TextField
									helperText={errTxts.last_name}
									error={errTxts.last_name}
									onChange={handleChange}
									value={modifiedStudent.last_name}
									name="last_name"
									label="Last Name"
								/>
							</div>

							<CustomDatePicker
								errTxts={errTxts.date_of_birth}
								value={modifiedStudent.date_of_birth}
								setValue={setDate}
								label="Date of Birth"
								disableFuture
							/>
							<FormControl
								error={errTxts.gender?.length}
								variant="standard"
								className="w-10/12 student-select"
							>
								<InputLabel id="relationLabel">Gender</InputLabel>
								<Select
									onChange={handleChange}
									labelId="relationLabel"
									id="childRelation"
									label="Gender"
									name="gender"
									defaultValue={modifiedStudent.gender}
								>
									<MenuItem value="male">Male</MenuItem>
									<MenuItem value="female">Female</MenuItem>
								</Select>
								{errTxts.gender && <FormHelperText>{errTxts.gender}</FormHelperText>}
							</FormControl>
							<div className="margin0-33 field-margin">
								<TextField
									helperText={errTxts.address1}
									error={errTxts.address1}
									onChange={handleChange}
									value={modifiedStudent.address1}
									name="address1"
									label="Address"
								/>
							</div>
							<FormControl error={errTxts.country_code} className="w-full">
								<TextField
									name="country_code"
									select
									label="Country"
									value={modifiedStudent.country_id}
									onChange={handleChange}
									labelId="country-label"
									style={{ width: '100%' }}
									id="country_code"
									error={errTxts.country_code}
								>
									{countries?.length ? (
										countries.map((country) => {
											return (
												<MenuItem key={country.id} value={country.id}>
													{country.name}
												</MenuItem>
											);
										})
									) : (
										<MenuItem>Loading...</MenuItem>
									)}
								</TextField>
								{errTxts.country_code && <FormHelperText>{errTxts.country_code}</FormHelperText>}
							</FormControl>
							<div className="w-10/12 student-select">
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
										setModifiedStudent({ ...modifiedStudent, state_id: v?.id || '' });
									}}
									onInputChange={(e, value) => {
										setStateSearchQuery(value);
										if (value === '') {
											setModifiedStudent({
												...modifiedStudent,
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
											error={errTxts.state_id}
											helperText={errTxts.state_id}
											autoComplete="off"
											defaultValue={defaultState}
										/>
									)}
								/>
							</div>
							<div className="w-10/12 student-select">
								<Autocomplete
									id="city"
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
										setModifiedStudent({ ...modifiedStudent, city: v?.id, city_id: v?.id });
									}}
									value={defaultCity}
									onInputChange={(e, value) => {
										setSearchCityQuery(value);
										if (value === '') {
											setModifiedStudent({
												...modifiedStudent,
												city: '',
												city_id: '',
											});
											setDefaultCity({ ...defaultCity, name: '' });
										}
									}}
									renderInput={(params) => (
										<TextField
											{...params}
											label="City"
											name="city"
											style={{ width: '100%' }}
											error={errTxts.city}
											helperText={errTxts.city}
											autoComplete="off"
											defaultValue={defaultCity}
										/>
									)}
								/>
							</div>
							<div className="w-full">
								<TextField
									onChange={handleChange}
									className="text-field"
									value={modifiedStudent.zip_code}
									name="zip_code"
									label="Zip Code"
									id="zip_code"
									helperText={errTxts.zip_code}
									error={errTxts.zip_code}
								/>
							</div>
						</div>
					</div>
				</div>
				<div className="btnedit">
					{!isSaving ? (
						<div className=" center-btn">
							<CustomButton
								variant="secondary"
								onClick={() => {
									history.goBack();
								}}
							>
								Cancel
							</CustomButton>
							<CustomButton variant="primary" onClick={handleSubmit}>
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
	);
}

export default EditStudent;
