import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import * as Actions from 'app/store/actions';
import FuseAnimate from '@fuse/core/FuseAnimate';
import history from '@history';
import {
	TextField,
	Checkbox,
	FormControlLabel,
	Chip,
	Typography,
	Avatar,
	IconButton,
	CircularProgress,
} from '@material-ui/core';
import CustomDatePicker from 'app/customComponents/CustomDatePicker/CustomDatePicker';
import CustomTimePicker from 'app/customComponents/CustomTimePicker/CustomTimePicker';
import CustomButton from 'app/customComponents/CustomButton/CustomButton';
import CircleUnchecked from '@material-ui/icons/RadioButtonUnchecked';
import CircleCheckedFilled from '@material-ui/icons/CheckCircle';
import dayjs from 'dayjs';
import { getStaff } from 'app/services/staff/staff';
import Autocomplete from '@material-ui/lab/Autocomplete';
import { getRooms, getAllRooms } from 'app/services/rooms/rooms';
import { updateWorkshift } from 'app/services/staff/staffschedule';
import './calendar.css';
import FuseScrollbars from '@fuse/core/FuseScrollbars';
import { makeStyles } from '@material-ui/core/styles';
import { deleteEvent } from 'app/services/staff/staffschedule';
import { scrollIntoView } from 'utils/utils';

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
function EditWorkShiftSchedule() {
	const classes = useStyles();
	const { state } = history.location;
	const dispatch = useDispatch();
	const [repeatEveryWeek, setRepeat] = useState(true);
	const [form, setForm] = useState({});
	const [errTxts, setErrTxts] = useState({});
	const [startDate, setStartDate] = useState();
	const [endDate, setEndDate] = useState();
	const [date, setDate] = useState();
	const [staff, setStaff] = useState([]);
	const [searchStaffQuery, setSearchStaffQuery] = useState('');
	const [rooms, setRooms] = useState([]);
	const [searchRoomQuery, setRoomSearchQuery] = useState('');
	const [isStaffLoading, setIsStaffLoading] = useState(false);
	const [isRoomLoading, setIsRoomLoading] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [defaultStaff, setDefaultStaff] = useState({});
	const [activeDay, setActiveDay] = useState(null);
	const [isRequesting, setIsRequesting] = useState(false);
	const [scheduleid, setScheduleid] = useState();
	const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
	const [repeatTime, setRepeatTime] = useState(state.repeat_time || false);
	const [days, setDays] = useState(state.repeat_time ? state.shifts.map((shift) => shift.day.toLowerCase()) : []);
	const dayNum = {
		monday: 0,
		tuesday: 1,
		wednesday: 2,
		thursday: 3,
		friday: 4,
		saturday: 5,
		sunday: 6,
	};
	const [singleDayShifts, setSingleDayShifts] = useState(1);
	const [multiDayShifts, setMultiDayShifts] = useState(Array(7).fill(1));
	const [singleShifts, setSingleShifts] = useState([{ start_time: '06:00', end_time: '19:00' }]);
	const [multiShifts, setMultiShifts] = useState({
		monday: [{ start_time: '06:00', end_time: '19:00' }],
		tuesday: [{ start_time: '06:00', end_time: '19:00' }],
		wednesday: [{ start_time: '06:00', end_time: '19:00' }],
		thursday: [{ start_time: '06:00', end_time: '19:00' }],
		friday: [{ start_time: '06:00', end_time: '19:00' }],
		saturday: [{ start_time: '06:00', end_time: '19:00' }],
		sunday: [{ start_time: '06:00', end_time: '19:00' }],
	});
	const returnDateFromTime = (time) => {
		if (time) {
			return new Date('', '', '', time.split(':')[0], time.split(':')[1], '', '');
		}
		return undefined;
	};

	useEffect(() => {
		if (!state.staff) {
			history.push('/staff-schedule');
		}
		console.log(state.staff?.filter((s) => s.id === state.teacher_id)[0]);
		setDefaultStaff(state.staff?.filter((s) => s.id === state.teacher_id)[0]);
		if (!state.recurring || (state.recurring && state.repeat_time)) {
			setSingleShifts(state.shifts?.filter((shift) => shift?.day === (state.shifts && state.shifts[0].day)));
			setSingleDayShifts(
				state.shifts?.filter((shift) => shift?.day === (state.shifts && state.shifts[0].day)).length
			);
		} else {
			const ms = {
				...multiShifts,
			};
			state.shifts.forEach((shift) => {
				ms[shift.day].length === 1 && !ms[shift.day][0].room_id && ms[shift.day].pop();
				ms[shift.day].push(shift);
			});
			const mds = [];
			for (const day of Object.keys(ms)) {
				mds[dayNum[day]] = ms[day].length;
			}
			setMultiDayShifts(mds);
		}
		setStartDate(state?.recurring ? state?.schedule_start_date : '');
		setEndDate(state?.recurring ? state?.schedule_end_date : '');
		setDate(!state?.recurring ? state?.start_date : '');

		setForm({
			...form,
			selectedDays: state?.days,
			staff: state?.teacher_id,
			description: state?.description,
			startDate: state?.recurring ? state?.schedule_start_date : '',
			endDate: state?.recurring ? state?.schedule_end_date : '',
			date: !state?.recurring ? state?.start_date : '',
		});
		setRepeat(!!state.recurring);
		setRepeatTime(!!state.repeat_time);
		setScheduleid(state?.id);
	}, []);

	useEffect(() => {
		setIsStaffLoading(true);
		setStaff([]);
		getStaff(searchStaffQuery, searchStaffQuery ? undefined : 1)
			.then(({ data }) => {
				setStaff(data.data);
			})
			.catch(() => {
				dispatch(
					Actions.showMessage({
						message: 'Failed to fetch data, please refresh',
						variant: 'error',
					})
				);
			})
			.finally(() => {
				setIsStaffLoading(false);
			});
	}, [searchStaffQuery]);

	useEffect(() => {
		setIsRoomLoading(true);
		setRooms([]);
		if (!searchRoomQuery) {
			getAllRooms()
				.then(({ data }) => {
					setRooms(data);
				})
				.catch(() => {
					dispatch(
						Actions.showMessage({
							message: 'Failed to fetch data, please refresh',
							variant: 'error',
						})
					);
				})
				.finally(() => {
					setIsRoomLoading(false);
				});
		} else {
			getRooms(searchRoomQuery, searchRoomQuery ? undefined : 1)
				.then(({ data }) => {
					setRooms(data.data);
				})
				.catch(() => {
					dispatch(
						Actions.showMessage({
							message: 'Failed to fetch data, please refresh',
							variant: 'error',
						})
					);
				})
				.finally(() => {
					setIsRoomLoading(false);
				});
		}
	}, [searchRoomQuery]);

	const handleDaySelection = (day) => {
		setActiveDay(day.toLowerCase());
	};

	const handleDays = (day) => {
		const found = days?.find((d) => d.toLowerCase() === day.toLowerCase());
		if (found) {
			const newDays = days.filter((d) => d.toLowerCase() !== found.toLowerCase());
			console.log(newDays);
			setDays(newDays);
		} else {
			setDays([...days, day]);
		}
	};

	const handleSubmit = () => {
		setErrTxts({});
		let isError = false;
		if (!form.staff) {
			setErrTxts((prev) => ({ ...prev, staff: 'This field is required' }));
			isError = true;
			scrollIntoView('staff');
		}
		if (!repeatEveryWeek) {
			delete form.startDate;
			delete form.endDate;
			setStartDate('');
			setEndDate('');

			if (!form.date) {
				setErrTxts((prev) => ({ ...prev, date: 'This field is required' }));
				isError = true;
				scrollIntoView('staff');
			}

			singleShifts.forEach((shift, index) => {
				if (!shift.start_time) {
					setErrTxts((prev) => ({
						...prev,
						[`start_time-${index}`]: 'This is required',
					}));
					isError = true;
				}
				if (!shift.end_time) {
					setErrTxts((prev) => ({
						...prev,
						[`end_time-${index}`]: 'This is required',
					}));
					isError = true;
				}
				if (shift.start_time > shift.end_time) {
					setErrTxts((prev) => ({
						...prev,
						[`end_time-${index}`]: 'End time must be greater than start time',
					}));
					isError = true;
				}
				if (!shift.room_id) {
					setErrTxts((prev) => ({
						...prev,
						[`room-${index}`]: 'This is required',
					}));
					isError = true;
				}
			});
		}
		if (repeatEveryWeek && !repeatTime) {
			delete form.date;
			setDate('');

			if (!form.startDate) {
				setErrTxts((prev) => ({ ...prev, startDate: 'This field is required' }));
				isError = true;
				scrollIntoView('staff');
			}
			if (!form.endDate) {
				setErrTxts((prev) => ({ ...prev, endDate: 'This field is required' }));
				isError = true;
				scrollIntoView('staff');
			}
			let validCount = 0;
			for (const day of Object.keys(multiShifts)) {
				validCount += multiShifts[day].filter(
					(shift) => shift.start_time && shift.end_time && shift.room_id
				).length;
			}
			if (validCount === 0) {
				dispatch(
					Actions.showMessage({
						message: 'No schedule is filled completely',
						autoHideDuration: 2000,
						variant: 'error',
					})
				);
				return;
			}
			for (const day of Object.keys(multiShifts)) {
				multiShifts[day].forEach((shift, index, arr) => {
					if (arr.length === 1 && !shift.room_id) {
						// incase of default selection, return and dont check
						return;
					}
					if (!shift.start_time) {
						setErrTxts((prev) => ({
							...prev,
							[`start_time-${day}-${index}`]: 'This is required',
						}));
						isError = true;
					}
					if (!shift.end_time) {
						setErrTxts((prev) => ({
							...prev,
							[`end_time-${day}-${index}`]: 'This is required',
						}));
						isError = true;
					}
					if (shift.start_time > shift.end_time) {
						setErrTxts((prev) => ({
							...prev,
							[`end_time-${day}-${index}`]: 'End time must be greater than start time',
						}));
						isError = true;
					}
					if (!shift.room_id) {
						setErrTxts((prev) => ({
							...prev,
							[`room-${day}-${index}`]: 'This is required',
						}));
						isError = true;
					}
				});
				if (isError) {
					setActiveDay(day);
					return;
				}
			}
			if (isError) {
				return;
			}
		}
		if (repeatEveryWeek && repeatTime) {
			delete form.date;
			setDate('');
			if (!form.startDate) {
				setErrTxts((prev) => ({ ...prev, startDate: 'This field is required' }));
				isError = true;
				scrollIntoView('staff');
			}
			if (!form.endDate) {
				setErrTxts((prev) => ({ ...prev, endDate: 'This field is required' }));
				isError = true;
				scrollIntoView('staff');
			}

			singleShifts.forEach((shift, index) => {
				if (!shift.start_time) {
					setErrTxts((prev) => ({
						...prev,
						[`start_time-${index}`]: 'This is required',
					}));
					isError = true;
				}
				if (!shift.end_time) {
					setErrTxts((prev) => ({
						...prev,
						[`end_time-${index}`]: 'This is required',
					}));
					isError = true;
				}
				if (shift.start_time > shift.end_time) {
					setErrTxts((prev) => ({
						...prev,
						[`end_time-${index}`]: 'End time must be greater than start time',
					}));
					isError = true;
				}
				if (!shift.room_id) {
					setErrTxts((prev) => ({
						...prev,
						[`room-${index}`]: 'This is required',
					}));
					isError = true;
				}
			});
			if (days.length === 0) {
				dispatch(
					Actions.showMessage({
						message: 'Select atleast one day',
						autoHideDuration: 1500,
						variant: 'error',
					})
				);
				return;
			}
		}
		if (isError) {
			return;
		}
		const filteredShifts = {};
		if (!repeatTime) {
			for (const day of Object.keys(multiShifts)) {
				filteredShifts[day] = multiShifts[day].filter(
					(shift) => shift.start_time && shift.end_time && shift.room_id
				);
				console.log(filteredShifts);
				if (filteredShifts[day].length === 0) {
					delete filteredShifts[day];
				}
			}
		} else {
			for (const day of days) {
				filteredShifts[day] = singleShifts;
			}
		}
		console.log(filteredShifts);
		const payload = !repeatEveryWeek
			? {
					teacher_id: form.staff,
					start_date: form.date,
					end_date: form.date,
					single_shift: singleShifts,
					recurring: 0,
					repeat_time: 0,
					description: form.description,
			  }
			: {
					teacher_id: form.staff,
					start_date: form.startDate,
					end_date: form.endDate,
					multiple_shifts: filteredShifts,
					recurring: 1,
					repeat_time: repeatTime ? 1 : 0,
					description: form.description,
			  };
		setIsLoading(true);
		updateWorkshift(state.id, payload)
			.then((resp) => {
				dispatch(
					Actions.showMessage({
						message: resp.data.message,
						autoHideDuration: 1500,
						variant: 'success',
					})
				);
				history.push('/staff-schedule');
			})
			.catch((err) => {
				if (err.response?.data?.errors) {
					setErrTxts(err.response.data.errors);
				} else {
					dispatch(
						Actions.showMessage({
							message: err.response.data.message,
							autoHideDuration: 1500,
							variant: 'error',
						})
					);
				}
			})
			.finally(() => setIsLoading(false));
	};

	const handledelete = () => {
		setIsRequesting(true);
		deleteEvent(scheduleid)
			.then((res) => {
				dispatch(
					Actions.showMessage({
						message: res.data.message,
						autoHideDuration: 1500,
						variant: 'success',
					})
				);
				history.push('/staff-schedule');
			})
			.catch((err) => {
				dispatch(
					Actions.showMessage({
						message: err.response.data.message,
						variant: 'error',
					})
				);
			})
			.finally(() => {
				setIsRequesting(false);
			});
	};

	return (
		<FuseScrollbars className={classes.content} scrollToTopOnRouteChange>
			<FuseAnimate animation="transition.slideLeftIn">
				<div className="pl-52 pt-52 pb-52 pr-52">
					<div className="text-lg font-bold" style={{ fontSize: '20px', fontWeight: '700' }}>
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
						Edit Staff To Schedules
					</div>
					<div className="bg-white rounded mt-12 mb-72 p-48">
						<div className="flex justify-between items-end">
							<span className="text-lg font-bold" style={{ fontSize: '18px', fontWeight: '700' }}>
								Work Shift
							</span>
							<div className="flex justify-between items-center">
								<IconButton size="small" className="py-12 px-24" onClick={() => handledelete()}>
									<div className="flex">
										<img src="assets/images/dlt.png" alt="edit" width="25px" />
										<div
											className="flex justify-between "
											style={{
												marginBottom: '4px',
												marginLeft: '8px',
												fontSize: '14px',
												color: 'red',
												cursor: 'pointer',
											}}
										>
											<span>Delete</span>
										</div>
									</div>
								</IconButton>
							</div>
						</div>

						<div
							className={`grid grid-cols-2 grid-rows-${repeatEveryWeek ? '4' : '3'} mt-32`}
							style={{ gridRowGap: '40px', gridColumnGap: '40px' }}
						>
							<div className="col-span-1 row-span-1">
								<Autocomplete
									id="staff"
									options={staff}
									className="w-4/5"
									renderOption={(option) => (
										<>
											<div className="flex" style={{ gap: 10 }}>
												<Avatar src={option.photo} />
												<div>
													{option.first_name} {option.last_name}
												</div>
											</div>
										</>
									)}
									getOptionLabel={(option) => `${option.first_name} ${option.last_name}`}
									autoComplete={false}
									clearOnBlur={false}
									loading={isStaffLoading}
									loadingText="...Loading"
									sx={{ width: '100%' }}
									onChange={(e, v) => {
										setDefaultStaff(v);
										setErrTxts({ ...errTxts, staff: '' });
										setForm({ ...form, staff: v?.id });
									}}
									value={defaultStaff}
									renderInput={(params) => (
										<TextField
											{...params}
											label="Staff"
											style={{ width: '100%' }}
											onChange={(e) => setSearchStaffQuery(e.target.value)}
											helperText={errTxts.staff}
											error={errTxts.staff}
											autoComplete="off"
										/>
									)}
								/>
							</div>
							<div className="col-span-1 row-span-1 flex flex-col pr-52 items-end">
								<FormControlLabel
									styles={{ color: '#4da0ed' }}
									control={
										<Checkbox
											size="medium"
											icon={<CircleUnchecked />}
											onChange={() => {
												setRepeat(!repeatEveryWeek);
											}}
											checked={repeatEveryWeek}
											checkedIcon={<CircleCheckedFilled style={{ color: '#028AFD' }} />}
											name="repeat"
											className="p-6"
										/>
									}
									label={
										<Typography variant="body1" style={{ color: '#028AFD', fontWeight: 'bold' }}>
											Repeats every week
										</Typography>
									}
								/>
							</div>
							{repeatEveryWeek ? (
								<div className="col-span-2 flex justify-between">
									<div className="flex-grow">
										<CustomDatePicker
											value={startDate}
											disablePast
											errTxts={errTxts.startDate}
											setValue={(value) => {
												setErrTxts({ ...errTxts, startDate: '' });
												const date = value ? dayjs(value).format('YYYY-MM-DD') : '';
												setStartDate(date);
												setForm({ ...form, startDate: date });
											}}
											label="Start Date"
											maxDate={form.endDate || undefined}
											width="81%"
										/>
									</div>
									<div className="pt-32 mr-12">to</div>
									<div className="flex-grow flex justify-end" style={{ marginRight: 40 }}>
										<CustomDatePicker
											value={endDate}
											disablePast
											errTxts={errTxts.endDate}
											setValue={(value) => {
												setErrTxts({ ...errTxts, endDate: '' });
												const date = value ? dayjs(value).format('YYYY-MM-DD') : '';
												setEndDate(date);
												setForm({ ...form, endDate: date });
											}}
											label="End date"
											minDate={form.startDate || undefined}
											width="85%"
										/>
									</div>
								</div>
							) : (
								<>
									<div className="col-span-1 row-span-1 w-4/5">
										<CustomDatePicker
											value={date}
											disablePast
											errTxts={errTxts.date}
											setValue={(value) => {
												setErrTxts({ ...errTxts, date: '' });
												const date = value ? dayjs(value).format('YYYY-MM-DD') : '';
												setDate(date);
												setForm({ ...form, date });
											}}
											label="Date"
											width="100"
										/>
									</div>
								</>
							)}
							<div className="col-span-2">
								<TextField
									name="description"
									className="w-full"
									label="Add Description"
									onChange={(e) => {
										setForm({ ...form, description: e.target.value });
									}}
								/>
							</div>
							{repeatEveryWeek && (
								<>
									<div className="col-span-2 grid grid-cols-1">
										<span className="text-md font-bold grow row-span-1 col-span-1">
											Days of the week
										</span>
										<div className="col-span-1">
											<div className="flex">
												{weekdays.map((day, key) => {
													const currentShift = multiShifts[day.toLowerCase()] || null;
													return (
														<div
															className={`pb-8 ${
																day.toLowerCase() === activeDay
																	? 'border-b-2 border-blue'
																	: ''
															}`}
														>
															<Chip
																style={{
																	background:
																		(!repeatTime &&
																			currentShift.every(
																				(shift) =>
																					shift.start_time &&
																					shift.end_time &&
																					shift.room_id
																			)) ||
																		(repeatTime &&
																			days?.find(
																				(d) =>
																					d.toLowerCase() ===
																					day.toLowerCase()
																			))
																			? 'transparent linear-gradient(270deg, #36cee5 0%, #676af6 100%) 0% 0% no-repeat padding-box'
																			: '#EFF7FD',
																	padding: '18px',
																	color:
																		(!repeatTime &&
																			currentShift.every(
																				(shift) =>
																					shift.start_time &&
																					shift.end_time &&
																					shift.room_id
																			)) ||
																		(repeatTime &&
																			days?.find(
																				(d) =>
																					d.toLowerCase() ===
																					day.toLowerCase()
																			))
																			? '#fff'
																			: 'black',
																	fontWeight:
																		(!repeatTime &&
																			currentShift.every(
																				(shift) =>
																					shift.start_time &&
																					shift.end_time &&
																					shift.room_id
																			)) ||
																		(repeatTime &&
																			days?.find(
																				(d) =>
																					d.toLowerCase() ===
																					day.toLowerCase()
																			))
																			? '900'
																			: 'normal',
																	marginRight: '10px',
																	width: '100px',
																}}
																size="medium"
																label={day.slice(0, 3)}
																key={key}
																clickable
																onClick={() => {
																	repeatTime
																		? handleDays(day)
																		: handleDaySelection(day);
																}}
															/>
														</div>
													);
												})}
												<FormControlLabel
													styles={{ color: '#4da0ed' }}
													control={
														<Checkbox
															size="small"
															icon={<CircleUnchecked />}
															onChange={() => {
																setActiveDay(null);
																setDays([]);
																setRepeatTime(!repeatTime);
															}}
															checked={repeatTime}
															checkedIcon={
																<CircleCheckedFilled style={{ color: '#028AFD' }} />
															}
															name="repeattime"
														/>
													}
													label={
														<Typography
															variant="body1"
															style={{ color: '#028AFD', fontWeight: 'bold' }}
														>
															Repeats time
														</Typography>
													}
												/>
											</div>
										</div>
									</div>
									{(repeatTime || activeDay) && <div />}
								</>
							)}
							{((repeatEveryWeek && activeDay) || !repeatEveryWeek || repeatTime) && (
								<>
									{!repeatEveryWeek && <div />}
									<div className="col-span-1 grid grid-cols-2 items-end">
										<div />
										<CustomButton
											style={{ justifySelf: 'end' }}
											onClick={() => {
												if (repeatEveryWeek && !repeatTime) {
													let updatedArr = [...multiDayShifts];
													updatedArr[dayNum[activeDay.toLowerCase()]] += 1;
													setMultiDayShifts(updatedArr);
													let updatedShifts = { ...multiShifts };
													updatedShifts[activeDay].push({
														start_time: '06:00',
														end_time: '19:00',
													});
													setMultiShifts(updatedShifts);
												} else {
													setSingleDayShifts((prev) => prev + 1);
													setSingleShifts([
														...singleShifts,
														{ start_time: '06:00', end_time: '19:00' },
													]);
												}
											}}
										>
											+ Add
										</CustomButton>
									</div>
								</>
							)}
							{((repeatEveryWeek && activeDay) || !repeatEveryWeek || repeatTime) &&
								Array(
									repeatEveryWeek && !repeatTime
										? multiDayShifts[dayNum[activeDay?.toLowerCase()]]
										: singleDayShifts
								)
									.fill(1)
									.map((num, ind) => {
										return (
											<>
												<div className="grid grid-cols-2">
													<CustomTimePicker
														errTxts={errTxts}
														setValue={() => {}}
														name={`start_time-${
															repeatEveryWeek && !repeatTime ? `${activeDay}-${ind}` : ind
														}`}
														value={
															repeatEveryWeek && !repeatTime
																? returnDateFromTime(
																		multiShifts[activeDay] &&
																			multiShifts[activeDay][ind] &&
																			multiShifts[activeDay][ind].start_time
																  )
																: returnDateFromTime(
																		singleShifts[ind] &&
																			singleShifts[ind].start_time
																  )
														}
														handleTimeChange={(time) => {
															if (!repeatEveryWeek || repeatTime) {
																let updatedArr = [...singleShifts];
																updatedArr[ind] = {
																	...singleShifts[ind],
																	start_time: time,
																};
																setSingleShifts(updatedArr);
															} else {
																let updatedShifts = { ...multiShifts };
																updatedShifts[activeDay][ind] = {
																	...updatedShifts[activeDay][ind],
																	start_time: time,
																};
																setMultiShifts(updatedShifts);
															}
														}}
														label="Start Time"
														width="85%"
													/>
													<CustomTimePicker
														errTxts={errTxts}
														name={`end_time-${
															repeatEveryWeek && !repeatTime ? `${activeDay}-${ind}` : ind
														}`}
														setValue={() => {}}
														value={
															repeatEveryWeek && !repeatTime
																? returnDateFromTime(
																		multiShifts[activeDay] &&
																			multiShifts[activeDay][ind] &&
																			multiShifts[activeDay][ind].end_time
																  )
																: returnDateFromTime(
																		singleShifts[ind] && singleShifts[ind].end_time
																  )
														}
														handleTimeChange={(time) => {
															if (!repeatEveryWeek || repeatTime) {
																let updatedArr = [...singleShifts];
																updatedArr[ind] = {
																	...singleShifts[ind],
																	end_time: time,
																};
																setSingleShifts(updatedArr);
															} else {
																let updatedShifts = { ...multiShifts };
																updatedShifts[activeDay][ind] = {
																	...updatedShifts[activeDay][ind],
																	end_time: time,
																};
																setMultiShifts(updatedShifts);
															}
														}}
														label="End Time"
														width="78%"
													/>
												</div>
												<div className="flex items-end gap-16">
													<Autocomplete
														id={`room-${
															repeatEveryWeek && !repeatTime ? `${activeDay}-${ind}` : ind
														}`}
														options={rooms}
														className="flex-grow"
														renderOption={(option) => (
															<>
																<div className="flex" style={{ gap: 10 }}>
																	<Avatar src={option.photo} />
																	<div>{option.name}</div>
																</div>
															</>
														)}
														getOptionLabel={(option) => option.name}
														getOptionSelected={(option, value) => {
															return option.id === value.id;
														}}
														autoComplete={false}
														clearOnBlur={false}
														value={
															repeatEveryWeek && !repeatTime
																? multiShifts[activeDay] && multiShifts[activeDay][ind]
																	? rooms.find(
																			(ro) =>
																				ro.id ===
																				multiShifts[activeDay][ind]?.room_id
																	  ) || null
																	: null
																: rooms.find(
																		(ro) => ro.id === singleShifts[ind]?.room_id
																  ) || null
														}
														loading={isRoomLoading}
														loadingText="...Loading"
														sx={{ width: '100%' }}
														onChange={(_e, v) => {
															setErrTxts({ ...errTxts, room: '' });
															if (!repeatEveryWeek || repeatTime) {
																let updatedShifts = [...singleShifts];
																updatedShifts[ind] = {
																	...singleShifts[ind],
																	room_id: v?.id || null,
																};
																setSingleShifts(updatedShifts);
															} else {
																let updatedShifts = { ...multiShifts };
																updatedShifts[activeDay][ind] = {
																	...updatedShifts[activeDay][ind],
																	room_id: v?.id || null,
																};
																setMultiShifts(updatedShifts);
															}
															setRoomSearchQuery('');
														}}
														renderInput={(params) => (
															<TextField
																{...params}
																label="Room"
																style={{ width: '100%' }}
																onChange={(e) => setRoomSearchQuery(e.target.value)}
																helperText={
																	!repeatEveryWeek || repeatTime
																		? errTxts[`room-${ind}`]
																		: errTxts[`room-${activeDay}-${ind}`]
																}
																error={
																	!repeatEveryWeek || repeatTime
																		? errTxts[`room-${ind}`]
																		: errTxts[`room-${activeDay}-${ind}`]
																}
																autoComplete="off"
															/>
														)}
													/>
													{((repeatEveryWeek &&
														!repeatTime &&
														multiDayShifts[dayNum[activeDay.toLowerCase()]] > 1) ||
														singleDayShifts > 1) && (
														<button
															className="clear-schedule-btn"
															onClick={() => {
																if (repeatEveryWeek && !repeatTime) {
																	console.log('Changin multi');
																	const updatedArr = [
																		...multiShifts[activeDay].slice(0, ind),
																		...multiShifts[activeDay].slice(ind + 1),
																	];
																	setMultiShifts((prev) => ({
																		...prev,
																		[activeDay]: updatedArr,
																	}));
																	const newArr = [...multiDayShifts];
																	newArr[dayNum[activeDay.toLowerCase()]] -= 1;
																	setMultiDayShifts(newArr);
																} else {
																	const updatedArr = [
																		...singleShifts.slice(0, ind),
																		...singleShifts.slice(ind + 1),
																	];
																	setSingleShifts(updatedArr);
																	setSingleDayShifts(singleDayShifts - 1);
																}
															}}
														>
															Clear
														</button>
													)}
												</div>
											</>
										);
									})}
						</div>
						{isLoading ? (
							<div className="flex justify-center my-24">
								<CircularProgress className="mx-auto" />
							</div>
						) : (
							<div className="flex justify-center mb-24" style={{ marginTop: 50 }}>
								<span style={{ marginRight: '5px' }}>
									<CustomButton
										variant="secondary"
										marginRight="11px"
										width={140}
										onClick={() => {
											history.push('/staff-schedule');
										}}
									>
										Cancel
									</CustomButton>

									<CustomButton onClick={handleSubmit} width={140} variant="primary">
										Save
									</CustomButton>
								</span>
							</div>
						)}
					</div>
				</div>
			</FuseAnimate>
		</FuseScrollbars>
	);
}

export default EditWorkShiftSchedule;
