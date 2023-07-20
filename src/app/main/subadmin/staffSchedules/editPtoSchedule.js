import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import * as Actions from 'app/store/actions';
import FuseAnimate from '@fuse/core/FuseAnimate';
import history from '@history';
import { Avatar, IconButton, TextField, CircularProgress } from '@material-ui/core';
import CustomDatePicker from 'app/customComponents/CustomDatePicker/CustomDatePicker';
import CustomTimePicker from 'app/customComponents/CustomTimePicker/CustomTimePicker';
import CustomButton from 'app/customComponents/CustomButton/CustomButton';
import dayjs from 'dayjs';
import { getStaff } from 'app/services/staff/staff';
import Autocomplete from '@material-ui/lab/Autocomplete';
import '../staff/staff.css';
import { updateSchedule, deleteEvent } from 'app/services/staff/staffschedule';

function EditPtoSchedule() {
	const dispatch = useDispatch();
	const [form, setForm] = useState({});
	const [errTxts, setErrTxts] = useState({});
	const [startTime, setStartTime] = useState('');
	const [endTime, setEndTime] = useState('');
	const [startDate, setStartDate] = useState('');
	const [endDate, setEndDate] = useState('');
	const [searchQuery, setSearchQuery] = useState('');
	const [isStaffLoading, setIsStaffLoading] = useState(false);
	const [staff, setStaff] = useState([]);
	const [defaultStaff, setDefaultStaff] = useState({});
	const [isLoading, setLoading] = useState(false);
	const { state } = history.location;
	console.log(state);

	const [isRequesting, setIsRequesting] = useState(false);
	const [scheduleid, setScheduleid] = useState();
	console.log(state);

	useEffect(() => {
		setDefaultStaff(state.staff ? state.staff.filter((s) => s.id === state.teacher_id)[0] : []);

		setStartDate(state.schedule_start_date ? state.schedule_start_date : state.start_date);
		setEndDate(state.schedule_end_date ? state.schedule_end_date : state.end_date);
		setStartTime(
			new Date('', '', '', Number(state.start_time.split(':')[0]), Number(state.start_time.split(':')[1]))
		);
		setEndTime(new Date('', '', '', Number(state.end_time.split(':')[0]), Number(state.end_time.split(':')[1])));

		setForm({
			...form,
			staff: state.teacher_id,
			startDate: state.schedule_start_date ? state.schedule_start_date : state.start_date,
			endDate: state.schedule_end_date ? state.schedule_end_date : state.end_date,
			startTime: state.start_time,
			endTime: state.end_time,
			description: state.description,
		});
		setScheduleid(state.id);
	}, []);

	useEffect(() => {
		setIsStaffLoading(true);
		setStaff([]);
		getStaff(searchQuery, searchQuery ? undefined : 1)
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
	}, [searchQuery]);

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

	const handleChange = ({ target }) => {
		const { name, value } = target;
		setErrTxts({ ...errTxts, [name]: '' });
		setForm({ ...form, [name]: value });
	};

	const handleTimeChange = (time, name) => {
		setErrTxts({ ...errTxts, startTime: '', endTime: '' });
		setForm({ ...form, [name]: time });
	};

	const handleSubmit = () => {
		setErrTxts({});
		if (!form.staff) {
			setErrTxts({ ...errTxts, staff: 'This field is required' });
			return;
		}
		if (!form.startDate) {
			setErrTxts({ ...errTxts, startDate: 'This field is required' });
			return;
		}
		if (form.startDate === 'Invalid Date') {
			setErrTxts({ ...errTxts, startDate: 'Please enter a valid date' });
			return;
		}
		if (form.startDate) {
			const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
			const today = `${months[new Date().getMonth()]} ${new Date().getDate()} ${new Date().getFullYear()}`;
			const diff = dayjs(form.startDate).diff(dayjs(today));
			if (diff < 0) {
				setErrTxts({ ...errTxts, startDate: 'Start date cannot be in the past' });
				return;
			}
		}
		if (!form.endDate) {
			setErrTxts({ ...errTxts, endDate: 'This field is required' });
			return;
		}
		if (form.endDate) {
			const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
			const today = `${months[new Date().getMonth()]} ${new Date().getDate()} ${new Date().getFullYear()}`;
			const diff = dayjs(form.endDate).diff(dayjs(today));
			if (diff < 0) {
				setErrTxts({ ...errTxts, endDate: 'End date cannot be in the past!' });
				return;
			}
		}
		if (form.endDate === 'Invalid Date') {
			setErrTxts({ ...errTxts, endDate: 'Please enter a valid date!' });
			return;
		}
		if (form.endDate && form.startDate) {
			const startDate = dayjs(form.startDate);
			const endDate = dayjs(form.endDate);
			const diff = endDate.diff(startDate);

			if (diff < 0) {
				setErrTxts({ ...errTxts, endDate: 'End date should not be before start date' });
				return;
			}
		}
		if (!form.startTime) {
			setErrTxts({ ...errTxts, startTime: 'This field is required' });
			return;
		}
		if (!form.endTime) {
			setErrTxts({ ...errTxts, endTime: 'This field is required' });
			return;
		}
		if (form.startTime && form.endTime) {
			const [startHour, startMinutes] = form.startTime.split(':');
			const [endHour, endMinutes] = form.endTime.split(':');
			if (startHour > endHour) {
				setErrTxts({ ...errTxts, endTime: 'End time should be greater than start time' });
				return;
			}
			if (startHour === endHour) {
				if (startMinutes >= endMinutes) {
					setErrTxts({ ...errTxts, endTime: 'End time should be greater than start time' });
					return;
				}
			}
		}

		const data = {
			teacher_id: form.staff,
			schedule_type: 'pto',
			start_date: form.startDate,
			start_time: form.startTime,
			end_date: form.endDate,
			end_time: form.endTime,
			description: form.description,
		};

		setLoading(true);
		updateSchedule(state.id, data)
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
			.finally(() => setLoading(false));
	};

	return (
		<FuseAnimate animation="transition.slideLeftIn">
			<div className="pl-52 pt-52 pb-52 pr-52">
				<div className="text-lg font-bold" style={{ fontSize: '20px', fontWeight: '700' }}>
					<span className="">
						<IconButton
							onClick={() => {
								history.goBack();
							}}
						>
							<img src="assets/images/arrow-long.png" alt="filter" width="24px" className="backBtn-img" />
						</IconButton>
					</span>
					Add Staff To Schedules
				</div>
				<div className="bg-white rounded mt-12 p-52">
					<div className="flex justify-between items-end">
						<span className="text-lg font-bold" style={{ fontSize: '18px', fontWeight: '700' }}>
							PTO
						</span>
						<div className="flex justify-between items-end">
							<IconButton size="small" onClick={() => handledelete()}>
								<img src="assets/images/dlt.png" alt="edit" width="25px" />
							</IconButton>
							<div
								className="flex justify-between "
								style={{
									marginBottom: '4px',
									marginLeft: '8px',
									fontSize: '14px',
									color: 'red',
									cursor: 'pointer',
								}}
								onClick={() => handledelete()}
							>
								<span>Delete</span>
							</div>
						</div>
					</div>
					<div className="grid grid-cols-2 grid-rows-2 gap-52 mt-52">
						<span className="insert-form margin-bottom">
							<Autocomplete
								id="staff"
								options={staff}
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
								onChange={(_e, v) => {
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
										onChange={(e) => setSearchQuery(e.target.value)}
										helperText={errTxts.staff}
										error={errTxts.staff}
										autoComplete="off"
									/>
								)}
							/>
						</span>
						<div className="col-span-1 flex items-row">
							<div className="w-2.5/6 flex-grow">
								<CustomDatePicker
									value={startDate}
									errTxts={errTxts.startDate}
									disablePast
									setValue={(value) => {
										setErrTxts({ ...errTxts, startDate: '', endDate: '' });
										const date = value ? dayjs(value).format('YYYY-MM-DD') : '';
										setStartDate(date);
										setForm({ ...form, startDate: date });
									}}
									label="Start Date"
									width="100"
								/>
							</div>
							<div className="w-1/6 text-center flex-grow">
								<span className="m-auto" style={{ lineHeight: '50px' }}>
									to
								</span>
							</div>
							<div className="w-2.5/6 flex-grow">
								<CustomDatePicker
									errTxts={errTxts.endDate}
									value={endDate}
									disablePast
									setValue={(value) => {
										setErrTxts({ ...errTxts, startDate: '', endDate: '' });
										const date = value ? dayjs(value).format('YYYY-MM-DD') : '';
										setEndDate(date);
										setForm({ ...form, endDate: date });
									}}
									label="End date"
									width="100"
									minDate={form.startDate || undefined}
								/>
							</div>
						</div>
						<div className="col-span-1 flex items-row">
							<div className="w-2.5/6 flex-grow">
								<CustomTimePicker
									width="100%"
									name="startTime"
									errTxts={errTxts}
									value={startTime}
									setValue={setStartTime}
									label="Start Time"
									handleTimeChange={handleTimeChange}
								/>
							</div>
							<div className="w-1/6 text-center flex-grow" style={{ lineHeight: '50px' }}>
								<span className="m-auto">to</span>
							</div>
							<div className="w-2.5/6 flex-grow">
								<CustomTimePicker
									width="100%"
									name="endTime"
									errTxts={errTxts}
									value={endTime}
									setValue={setEndTime}
									label="End Time"
									handleTimeChange={handleTimeChange}
								/>
							</div>
						</div>
						<div className="col-span-1">
							<TextField
								name="description"
								className="w-full"
								value={form.description}
								label="Description"
								error={errTxts.description}
								helperText={errTxts.description}
								onChange={handleChange}
							/>
						</div>
					</div>
					{isLoading ? (
						<div className="flex justify-center my-24">
							<CircularProgress className="mx-auto" />
						</div>
					) : (
						<div className="flex justify-center mt-64 mb-64">
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

								<CustomButton variant="primary" width={140} onClick={handleSubmit}>
									Save
								</CustomButton>
							</span>
						</div>
					)}
				</div>
			</div>
		</FuseAnimate>
	);
}

export default EditPtoSchedule;
