import DatePicker from 'app/customComponents/CustomDatePicker/CustomDatePicker';
import React, { useState, useEffect } from 'react';
import {
	TextField,
	InputLabel,
	MenuItem,
	FormControl,
	Select,
	IconButton,
	CircularProgress,
	FormHelperText
} from '@material-ui/core';
import './Reports.css';
import { Close } from '@material-ui/icons';
import CustomButton from 'app/customComponents/CustomButton/CustomButton';
import { useDispatch, useSelector } from 'react-redux';
import {
	getRoomRatios,
	getRooms,
	getStaffs,
	getEnrolledStudents,
	getStudentsAge,
	getAllergies,
	getContacts,
	getImmunizationsReport,
	getMedications,
	getMealReport,
	getParentsSubscription,
	getSchoolRoyalties
} from 'app/services/reports/reports';
import * as Actions from 'app/store/actions';
import FuseAnimate from '@fuse/core/FuseAnimate';
import history from '@history';

const listOfReports = [
	{ key: 'ratio', label: 'Ratio' },
	{ key: 'staff', label: 'Staff' },
	{ key: 'enrolled-student', label: 'Enrolled Student' },
	{ key: 'age', label: 'Age' },
	{ key: 'allergy', label: 'Allergy' },
	{ key: 'contact', label: 'Contact' },
	{ key: 'immunization', label: 'Immunization Record' },
	{ key: 'immunization-due-overdue', label: 'Immunization Due/Overdue' },
	{ key: 'medication', label: 'Medication' },
	{ key: 'meal', label: 'Meal' },
	{ key: 'subscription', label: 'Subscription Reporting' },
	{ key: 'royalties', label: 'Royalties Reporting' }
];

function DownloadReports() {
	const dispatch = useDispatch();
	const user = useSelector(({ auth }) => auth.user);
	const [filters, setFilters] = useState({
		school_id: user?.school?.id || user?.data?.school?.id,
		export_id: 0,
		status: '',
		student_id: '',
		fromDate: '',
		toDate: '',
		room_id: '',
		interval: '',
		package_type: '',
		role: ''
	});
	const [roomPage, setRoomPage] = useState(1);
	const [rooms, setRooms] = useState([]);
	const [iisLoading, ssetIsLoading] = useState(false);
	const [errorFields, setErrorsFields] = useState({});

	useEffect(() => {
		getRooms('', roomPage)
			.then(res => {
				setRooms([...rooms, ...res.data.data]);
				if (res.data.current_page < res.data.last_page) {
					setRoomPage(roomPage + 1);
				}
			})
			.catch(err => {
				dispatch(
					Actions.showMessage({
						message: 'Failed to get rooms.',
						autoHideDuration: 1500,
						variant: 'error'
					})
				);
			});
	}, [roomPage, dispatch]);
	const handleFilters = ev => {
		const { name, value } = ev.target;
		setFilters({ ...filters, [name]: value });
		setErrorsFields({ ...errorFields, [name]: '' });
		if (name === 'report_type' && value === 'staff') {
			setFilters({ ...filters, [name]: value, room_id: '' });
		}
	};

	const sendEmail = () => {
		let errors = 0;
		let e = {};
		if (!filters.report_type) {
			console.log('AAAAAAAAAAAA');
			errors = 1;
			e = { ...e, report_type: 'This fields is required' };
		} else {
			e = { ...e, report_type: '' };
		}
		if (!filters.room_id && filters.report_type !== 'staff') {
			errors = 1;
			e = { ...e, room_id: 'This fields is required' };
		} else {
			e = { ...e, room_id: '' };
		}

		if (!filters.fromDate && filters.report_type !== 'ratio') {
			errors = 1;
			e = { ...e, date_from: 'This fields is required' };
		} else {
			e = { ...e, date_from: '' };
		}

		if (!filters.toDate && filters.report_type !== 'ratio') {
			errors = 1;
			e = { ...e, date_to: 'This fields is required' };
		} else {
			e = { ...e, date_to: '' };
		}
		// split email field by comma and space
		const emails = filters.email?.split(/,| /);
		// if more than 1 email is entered, consider it invalid
		const re = /\S+@\S+\.\S+/;
		if (!filters.email) {
			errors = 1;
			e = { ...e, email: 'This fields is required' };
		} else if (emails.length > 1 || !re.test(filters.email)) {
			errors = 1;
			e = { ...e, email: 'Invalid email' };
		} else {
			e = { ...e, email: '' };
		}
		if (filters.report_type === 'ratio') {
			if (!filters.interval) {
				errors = 1;
				e = { ...e, interval: 'This fields is required' };
			} else {
				e = { ...e, interval: '' };
			}
			if (!filters.date) {
				errors = 1;
				e = { ...e, date: 'This fields is required' };
			} else {
				e = { ...e, date: '' };
			}
		}
		setErrorsFields(e);
		if (errors) {
			return;
		}
		ssetIsLoading(true);
		let changingFilters = false;
		if (filters.room_id === 'all') {
			filters.room_id = '';
			changingFilters = true;
		}
		switch (filters.report_type) {
			// add catch in all cases
			case 'ratio': {
				const room = rooms.find(r => r.id === filters.room_id);
				getRoomRatios(1, filters.room_id, filters.date, filters.interval, room.name, 1, filters.email)
					.then(res => {
						dispatch(
							Actions.showMessage({
								message: 'Email sent successfully.',
								autoHideDuration: 1500,
								variant: 'success'
							})
						);
						ssetIsLoading(false);
					})
					.catch(err => {
						dispatch(
							Actions.showMessage({
								message: 'Failed to send email.',
								autoHideDuration: 1500,
								variant: 'error'
							})
						);
						ssetIsLoading(false);
					});
				break;
			}
			case 'staff':
				getStaffs(filters, 1, '', 1, 1, filters.email)
					.then(res => {
						dispatch(
							Actions.showMessage({
								message: 'Email sent successfully.',
								autoHideDuration: 1500,
								variant: 'success'
							})
						);
						ssetIsLoading(false);
					})
					.catch(err => {
						dispatch(
							Actions.showMessage({
								message: 'Failed to send email.',
								autoHideDuration: 1500,
								variant: 'error'
							})
						);
						ssetIsLoading(false);
					});
				break;
			case 'enrolled-student':
				getEnrolledStudents(
					1,
					'',
					filters.school_id,
					filters.room_id,
					'',
					filters.fromDate,
					filters.toDate,
					1,
					1,
					filters.email
				)
					.then(res => {
						dispatch(
							Actions.showMessage({
								message: 'Email sent successfully.',
								autoHideDuration: 1500,
								variant: 'success'
							})
						);
						ssetIsLoading(false);
					})
					.catch(err => {
						dispatch(
							Actions.showMessage({
								message: 'Failed to send email.',
								autoHideDuration: 1500,
								variant: 'error'
							})
						);
						ssetIsLoading(false);
					});
				break;
			case 'age':
				getStudentsAge(
					1,
					'',
					filters.school_id,
					filters.room_id,
					'',
					filters.fromDate,
					filters.toDate,
					1,
					1,
					filters.email
				)
					.then(res => {
						dispatch(
							Actions.showMessage({
								message: 'Email sent successfully.',
								autoHideDuration: 1500,
								variant: 'success'
							})
						);
						ssetIsLoading(false);
					})
					.catch(err => {
						dispatch(
							Actions.showMessage({
								message: 'Failed to send email.',
								autoHideDuration: 1500,
								variant: 'error'
							})
						);
						ssetIsLoading(false);
					});
				break;
			case 'allergy':
				getAllergies(filters, 1, '', 1, 1, filters.email)
					.then(res => {
						dispatch(
							Actions.showMessage({
								message: 'Email sent successfully.',
								autoHideDuration: 1500,
								variant: 'success'
							})
						);
						ssetIsLoading(false);
					})
					.catch(err => {
						dispatch(
							Actions.showMessage({
								message: 'Failed to send email.',
								autoHideDuration: 1500,
								variant: 'error'
							})
						);
						ssetIsLoading(false);
					});
				break;
			case 'contact':
				getContacts(filters, 1, '', 1, 1, filters.email)
					.then(res => {
						dispatch(
							Actions.showMessage({
								message: 'Email sent successfully.',
								autoHideDuration: 1500,
								variant: 'success'
							})
						);
						ssetIsLoading(false);
					})
					.catch(err => {
						dispatch(
							Actions.showMessage({
								message: 'Failed to send email.',
								autoHideDuration: 1500,
								variant: 'error'
							})
						);
						ssetIsLoading(false);
					});
				break;
			case 'immunization':
				getImmunizationsReport(
					1,
					'',
					filters.school_id,
					filters.room_id,
					'',
					filters.fromDate,
					filters.toDate,
					1,
					0,
					1,
					filters.email
				)
					.then(res => {
						dispatch(
							Actions.showMessage({
								message: 'Email sent successfully.',
								autoHideDuration: 1500,
								variant: 'success'
							})
						);
						ssetIsLoading(false);
					})
					.catch(err => {
						dispatch(
							Actions.showMessage({
								message: 'Failed to send email.',
								autoHideDuration: 1500,
								variant: 'error'
							})
						);
						ssetIsLoading(false);
					});
				break;
			case 'immunization-due-overdue':
				getImmunizationsReport(
					1,
					'',
					filters.school_id,
					filters.room_id,
					'',
					filters.fromDate,
					filters.toDate,
					1,
					1,
					1,
					filters.email
				)
					.then(res => {
						dispatch(
							Actions.showMessage({
								message: 'Email sent successfully.',
								autoHideDuration: 1500,
								variant: 'success'
							})
						);
						ssetIsLoading(false);
					})
					.catch(err => {
						dispatch(
							Actions.showMessage({
								message: 'Failed to send email.',
								autoHideDuration: 1500,
								variant: 'error'
							})
						);
						ssetIsLoading(false);
					});
				break;
			case 'medication':
				getMedications(filters, 1, '', 1, 1, filters.email)
					.then(res => {
						dispatch(
							Actions.showMessage({
								message: 'Email sent successfully.',
								autoHideDuration: 1500,
								variant: 'success'
							})
						);
						ssetIsLoading(false);
					})
					.catch(err => {
						dispatch(
							Actions.showMessage({
								message: 'Failed to send email.',
								autoHideDuration: 1500,
								variant: 'error'
							})
						);
						ssetIsLoading(false);
					});
				break;
			case 'meal': {
				const allRooms = rooms.map(room => room.id);
				getMealReport(filters, 1, allRooms, 1, filters.email)
					.then(res => {
						dispatch(
							Actions.showMessage({
								message: 'Email sent successfully.',
								autoHideDuration: 1500,

								variant: 'success'
							})
						);
						ssetIsLoading(false);
					})
					.catch(err => {
						dispatch(
							Actions.showMessage({
								message: 'Failed to send email.',
								autoHideDuration: 1500,
								variant: 'error'
							})
						);
						ssetIsLoading(false);
					});
				break;
			}
			case 'subscription':
				getParentsSubscription(
					1,
					'',
					filters.school_id,
					filters.room_id,
					'',
					filters.fromDate,
					filters.toDate,
					1,
					1,
					filters.email
				)
					.then(res => {
						dispatch(
							Actions.showMessage({
								message: 'Email sent successfully.',
								autoHideDuration: 1500,
								variant: 'success'
							})
						);
						ssetIsLoading(false);
					})
					.catch(err => {
						dispatch(
							Actions.showMessage({
								message: 'Failed to send email.',
								autoHideDuration: 1500,
								variant: 'error'
							})
						);
						ssetIsLoading(false);
					});
				break;
			case 'royalties':
				getSchoolRoyalties(filters, '', 1, 1, 1, 1, filters.email)
					.then(res => {
						dispatch(
							Actions.showMessage({
								message: 'Email sent successfully.',
								autoHideDuration: 1500,
								variant: 'success'
							})
						);
						ssetIsLoading(false);
					})
					.catch(err => {
						dispatch(
							Actions.showMessage({
								message: 'Failed to send email.',
								autoHideDuration: 1500,
								variant: 'error'
							})
						);
						ssetIsLoading(false);
					});
				break;
			default:
				dispatch(
					Actions.showMessage({
						message: 'Select report type.',
						autoHideDuration: 1500,
						variant: 'error'
					})
				);
				ssetIsLoading(false);
		}
		if (changingFilters) {
			filters.room_id = 'all';
		}
	};
	return (
		<FuseAnimate animation="transition.slideLeftIn" duration={600}>
			<div className="flex flex-col items-center">
				<div className="flex items-center flex-nowrap self-start pl-40">
					<div className="reports-topDiv">
						<h1 className="">
							{' '}
							<span className="">
								<IconButton
									onClick={() => {
										history.goBack();
									}}
								>
									<img src="assets/images/arrow-long.png" alt="filter" width="24px" className="" />
								</IconButton>
							</span>{' '}
							<span className="text-xl self-end font-bold mr-28"> Downloads</span>
						</h1>
						<p>Export a variety of reports such as Activity, Staff, and Immunization.</p>
					</div>
				</div>
				<div
					className="p-64 py-32 bg-white rounded flex flex-col gap-16"
					style={{ width: '75vw', minHeight: '60vh' }}
				>
					<div className="flex items-center">
						<h2 className="font-bold">Available Reports</h2>
					</div>
					<div className="flex justify-between gap-80">
						{filters.report_type === 'ratio' ? (
							<>
								<div className="flex-grow">
									<DatePicker
										id="date"
										label="Date"
										name="date"
										value={filters.date}
										setValue={Date => {
											setErrorsFields({ ...errorFields, date: false });
											setFilters({ ...filters, date: Date?.format('YYYY-MM-DD') || '' });
										}}
										maxDate={new Date()}
										errTxts={errorFields.date}
									/>
								</div>
								<FormControl
									error={!!errorFields.interval}
									className="flex-grow"
									style={{ width: '23%' }}
								>
									<InputLabel id="interval">Interval</InputLabel>
									<Select
										name="interval"
										className="interval-select"
										labelId="interval"
										id="interval"
										label="Time Interval"
										value={filters.interval}
										onChange={handleFilters}
										endAdornment={
											filters.interval ? (
												<IconButton id="clear-room-filter" size="small" className="mr-16">
													<Close
														onClick={() => {
															setFilters({
																...filters,
																interval: ''
															});
														}}
														fontSize="small"
													/>
												</IconButton>
											) : (
												''
											)
										}
									>
										<MenuItem value="fifteen">15 Minute</MenuItem>
										<MenuItem value="thirty">30 Minute</MenuItem>
										<MenuItem value="sixty">1 Hour</MenuItem>
									</Select>
									{errorFields.interval && <FormHelperText>{errorFields.interval}</FormHelperText>}
								</FormControl>
							</>
						) : (
							<>
								<div className="flex-grow">
									<DatePicker
										id="date-from"
										name="date_from"
										label="Date From"
										value={filters.fromDate}
										setValue={Date => {
											setErrorsFields({ ...errorFields, date_from: false });
											setFilters({ ...filters, fromDate: Date?.format('YYYY-MM-DD') || '' });
										}}
										maxDate={filters.toDate || new Date()}
										errTxts={errorFields.date_from}
									/>
								</div>
								<div className="flex-grow">
									<DatePicker
										id="date-to"
										name="date_to"
										label="Date To"
										value={filters.toDate}
										setValue={Date => {
											setErrorsFields({ ...errorFields, date_to: false });
											setFilters({ ...filters, toDate: Date?.format('YYYY-MM-DD') || '' });
										}}
										maxDate={new Date()}
										minDate={filters.fromDate}
										errTxts={errorFields.date_to}
									/>
								</div>
							</>
						)}
					</div>
					<div className="flex justify-between gap-80">
						<div className="w-full">
							<FormControl error={!!errorFields.report_type} className="w-full">
								<InputLabel id="report_type_label">Report Type</InputLabel>
								<Select
									name="report_type"
									onChange={handleFilters}
									value={filters.report_type}
									labelId="report_type_label"
									id="report_type"
									label="Report Type"
									className="w-full"
								>
									{listOfReports.map(report => {
										return (
											<MenuItem key={report.key} value={report.key} id={report.key}>
												{report.label}
											</MenuItem>
										);
									})}
								</Select>
								{errorFields.report_type && <FormHelperText>{errorFields.report_type}</FormHelperText>}
							</FormControl>
						</div>
						<div className="w-full">
							<FormControl
								disabled={filters.report_type === 'staff'}
								error={errorFields.room_id}
								className="w-full"
							>
								<InputLabel id="roomLabel">Room</InputLabel>
								<Select
									disabled={filters.report_type === 'staff'}
									name="room_id"
									onChange={handleFilters}
									value={filters.room_id}
									labelId="roomLabel"
									id="room_id"
									label="Room"
									className="w-full"
									endAdornment={
										filters.room_id ? (
											<IconButton id="clear-room-filter" size="small" className="mr-16">
												<Close
													onClick={() => {
														setFilters({
															...filters,
															room_id: ''
														});
													}}
													fontSize="small"
												/>
											</IconButton>
										) : (
											''
										)
									}
								>
									{!!rooms.length && <MenuItem value="all">All</MenuItem>}
									{rooms.length ? (
										rooms.map(room => {
											return (
												<MenuItem key={room.id} value={room.id} id={room.id}>
													{room.name}
												</MenuItem>
											);
										})
									) : (
										<MenuItem disabled>Loading...</MenuItem>
									)}
								</Select>
								{errorFields.room_id && <FormHelperText>{errorFields.room_id}</FormHelperText>}
							</FormControl>
						</div>
					</div>

					<div className="mt-16">
						<TextField
							value={filters.email}
							name="email"
							onChange={handleFilters}
							className="w-full"
							label="Email Address"
							error={!!errorFields.email}
							helperText={errorFields.email}
						/>
					</div>
					<div className="self-center mt-32">
						{!iisLoading ? (
							<>
								<div className="flex justify-center" style={{ gap: 20 }}>
									<CustomButton
										variant="secondary"
										width="135px"
										fontSize="15px"
										onClick={() => history.goBack()}
									>
										Cancel
									</CustomButton>

									<CustomButton onClick={sendEmail} width={140}>
										{' '}
										Submit
									</CustomButton>
								</div>
							</>
						) : (
							<div className="circle-bar">
								<CircularProgress size={35} />
							</div>
						)}
					</div>
				</div>
			</div>
		</FuseAnimate>
	);
}

export default DownloadReports;
