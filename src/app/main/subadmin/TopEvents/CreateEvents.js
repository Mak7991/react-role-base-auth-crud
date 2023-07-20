import React, { useEffect, useState } from 'react';
import {
	TextField,
	InputLabel,
	MenuItem,
	FormControl,
	Select,
	FormHelperText,
	CircularProgress,
	Avatar,
	Input,
	ListItemText,
	Checkbox,
	ListItemIcon,
	IconButton
} from '@material-ui/core';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import CustomButton from 'app/customComponents/CustomButton/CustomButton';
import { getAllRooms } from 'app/services/rooms/rooms';
import './CreateEvents.css';
import { useDispatch } from 'react-redux';
import * as Actions from 'app/store/actions';
import dayjs from 'dayjs';
import history from '@history';
import CustomDatePicker from 'app/customComponents/CustomDatePicker/CustomDatePicker';
import { createEvent, getEventStudent, getEventType } from 'app/services/events/events';

const useStyles = makeStyles({
	root: {
		color: 'white'
	},
	select: {
		'&:before': {
			borderBottom: 'none'
		},
		'&:after': {
			borderBottom: 'none'
		},
		'&:not(.Mui-disabled):hover::before': {
			borderBottom: 'none'
		},
		'& .MuiSelect-select:focus': {
			backgroundColor: 'inherit'
		}
	},
	icon: {
		fill: 'white'
	}
});
function CreateEvents() {
	const theme = useTheme();
	const classes = useStyles();
	const dispatch = useDispatch();
	const [page, setPage] = useState(1);
	const [form, setForm] = useState({ student_id: null });
	const [date, setDate] = useState(null);
	const [types, setTypes] = useState([]);
	const [rooms, setRooms] = useState([]);
	const [errTxts, setErrTxts] = useState({});
	const [students, setStudents] = useState([]);
	const [selected, setSelected] = useState([]);
	const [isLoading, setIsLoading] = useState(false);
	const [isReq, setIsReq] = useState(false);

	const isAllSelected = rooms.length > 0 && selected.length === rooms.length;

	useEffect(() => {
		getEventType().then(res => {
			setTypes(res.data);
		});
		getAllRooms().then(res => {
			setRooms(res.data);
		});
	}, []);

	useEffect(() => {
		if (page === 1) {
			return;
		}
		if (selected.length === 1) {
			getEventStudent(page, selected[0].id).then(res => {
				setStudents(students.concat(res.data.data));
				if (res.data.current_page < res.data.last_page) {
					setPage(page + 1);
				}
			});
		}
	}, [page]);

	useEffect(() => {
		if (selected.length === 1) {
			getEventStudent(1, selected[0].id).then(res => {
				setStudents(res.data.data);
				if (res.data.current_page < res.data.last_page) {
					setPage(page + 1);
				}
			});
		}
	}, [selected]);

	const ITEM_HEIGHT = 48;
	const ITEM_PADDING_TOP = 8;
	const MenuProps = {
		PaperProps: {
			style: {
				maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
				width: 250
			}
		},
		getContentAnchorEl: null,
		anchorOrigin: {
			vertical: 'bottom',
			horizontal: 'center'
		},
		transformOrigin: {
			vertical: 'top',
			horizontal: 'center'
		},
		variant: 'menu'
	};

	const handleChange = e => {
		const { name, value } = e.target;
		setErrTxts({ ...errTxts, [name]: '' });

		if (name === 'room_id') {
			setPage(1);
			// Whenever room is changed, empty students array
			setStudents([]);
			// Whenever room changes, null student selection
			setForm({ ...form, student_id: null, [name]: value });
			setSelected(value);
		} else {
			setForm({ ...form, [name]: value });
		}

		if (name === 'room_id' && value[value.length - 1] === 'all') {
			setSelected(selected.length === rooms.length ? [] : rooms);
			setForm({ ...form, room_id: selected.length === rooms.length ? [] : rooms, student_id: null });
		}
		console.log('Name: ', name, 'Value: ', value, 'Form: ', form);
	};

	const handleSubmit = ev => {
		ev.preventDefault();

		setErrTxts({});

		if (!form.date) {
			setErrTxts({ ...errTxts, date: 'This field is required' });
			return;
		}

		if (!form.type) {
			setErrTxts({ ...errTxts, type: 'This field is required' });
			return;
		}
		if (!form.room_id) {
			setErrTxts({ ...errTxts, room_id: 'This field is required' });
			return;
		}

		if (form?.description?.length > 500) {
			setErrTxts({ ...errTxts, description: 'The description may not be greater than 500 characters.' });
			return;
		}
		const tempRoomId = form.room_id;
		if (form.room_id[0] === 'all') {
			delete form.room_id;
		} else {
			form.room_id = form.room_id.map(room => room.id);
		}
		if (!form.student_id) {
			delete form.student_id;
		}
		console.log(form);
		setIsLoading(true);
		createEvent(form)
			.then(res => {
				dispatch(
					Actions.showMessage({
						variant: 'success',
						message: 'Event successfully created.'
					})
				);
				history.goBack();
			})
			.catch(err => {
				dispatch(
					Actions.showMessage({
						variant: 'error',
						message: 'Failed to create event.'
					})
				);
				if (!form.room_id) {
					setForm({ ...form, room_id: tempRoomId });
				}
				if (err?.response?.data?.errors) {
					setErrTxts(err.response.data.errors);
				}
			})
			.finally(() => setIsLoading(false));
	};

	useEffect(() => {
		if (date) {
			if (dayjs(date).format('YYYY-MM-DD') === form.dob) {
				return;
			}
			setForm({ ...form, date: dayjs(date).format('YYYY-MM-DD') });
			setErrTxts({ ...errTxts, date: '' });
		} else {
			setForm({ ...form, date: '' });
		}
	}, [date, form.dob]);

	return (
		<div className="px-64 py-60">
			<div className="form-heading" style={{ fontSize: '20px' }}>
				<span className="">
					<IconButton
						onClick={() => {
							history.goBack();
						}}
					>
						<img src="assets/images/arrow-long.png" alt="filter" width="24px" className="backBtn-img" />
					</IconButton>
				</span>
				Create Event
			</div>
			<div className="enroll-form-containerr px-60 py-32 bg-white">
				<form id="create-event-form" onSubmit={handleSubmit}>
					<h2 className="form-section-headingg" style={{ fontSize: '18px' }}>
						Event Information
					</h2>
					<fieldset>
						<div className="student-fieldd-flexx flex justify-between">
							<CustomDatePicker
								width="45%"
								id="date"
								errTxts={errTxts.date}
								value={date}
								setValue={setDate}
								label="Calendar"
								disablePast
								// placeholder="Select date and month"
							/>
							<FormControl error={!!errTxts.type?.length} variant="standard" className="student-slt">
								<InputLabel id="homeroomLabel">Event Type</InputLabel>
								<Select
									name="type"
									onChange={handleChange}
									labelId="Eventtype"
									error={!!errTxts.type?.length}
									helperText={errTxts.type}
									id="type"
									label="Event type"
								>
									{types.length ? (
										types.map(type => {
											return (
												<MenuItem key={type.id} value={type.id}>
													<span id={`event-${type.id}`}>{type.type}</span>
												</MenuItem>
											);
										})
									) : (
										<MenuItem disabled>Loading...</MenuItem>
									)}
								</Select>
								{errTxts.type && <FormHelperText>{errTxts.type}</FormHelperText>}
							</FormControl>
						</div>
						<div className="studentt-field-flex flex justify-between">
							<FormControl
								error={!!errTxts.room_id?.length}
								className={`${classes.formControl} student-slt`}
							>
								<InputLabel id="mutiple-select-label">Room Name</InputLabel>
								<Select
									labelId="mutiple-select-label"
									multiple
									value={selected}
									error={!!errTxts.room_id?.length}
									helperText={errTxts.room_id}
									name="room_id"
									id="room_id"
									onChange={handleChange}
									renderValue={sel => {
										return sel.length === rooms.length
											? 'All Rooms Selected'
											: sel.map(room => room.name).join(', ');
									}}
									MenuProps={MenuProps}
								>
									<MenuItem
										value="all"
										classes={{
											root: isAllSelected ? classes.selectedAll : ''
										}}
									>
										<ListItemIcon id="all-rooms">
											<Checkbox
												classes={{ indeterminate: classes.indeterminateColor }}
												checked={isAllSelected}
												indeterminate={selected.length > 0 && selected.length < rooms.length}
											/>
										</ListItemIcon>
										<ListItemText
											classes={{ primary: classes.selectAllText }}
											primary="Select All"
										/>
									</MenuItem>

									{rooms.length ? (
										rooms.map(room => {
											return (
												<MenuItem key={room.id} value={room}>
													<ListItemIcon id={`room-${room.id}`}>
														<Checkbox
															checked={selected.map(ro => ro.id).indexOf(room.id) > -1}
														/>
													</ListItemIcon>
													<ListItemText primary={room.name} />
												</MenuItem>
											);
										})
									) : (
										<MenuItem disabled>Loading...</MenuItem>
									)}
								</Select>
								{errTxts.room_id && <FormHelperText>{errTxts.room_id}</FormHelperText>}
							</FormControl>

							{/* <TextField onChange={handleChange} name="address1" label="Address" /> */}
							<FormControl variant="standard" className="student-slt">
								<InputLabel id="student_id">Student Name</InputLabel>
								<Select
									name="student_id"
									onChange={handleChange}
									labelId="student_id"
									id="student_id"
									label="Student"
									value={form.student_id}
								>
									{students.length && form.room_id.length === 1 ? (
										students.map(student => {
											return (
												<MenuItem key={student.id} value={student.id}>
													<span
														id={`student-${student.id}`}
													>{`${student.first_name} ${student.last_name}`}</span>
												</MenuItem>
											);
										})
									) : <MenuItem disabled>Loading...</MenuItem> ? (
										<MenuItem disabled>
											{form.room_id === 'null' ? 'Please select a room' : 'No student found'}
										</MenuItem>
									) : (
										<MenuItem />
									)}
								</Select>
							</FormControl>
						</div>

						<div className="event-field-flex flex justify-between">
							<TextField
								onChange={handleChange}
								name="description"
								label="Event Specification"
								id="description"
								error={!!errTxts.description?.length}
								helperText={errTxts.description}
								className="impppp"
							/>
						</div>
					</fieldset>

					{/* <div className="flex justify-center" style={{ marginTop: '15px' }}>
						{!isLoading ? (
							<CustomButton
								variant="primary"
								type="submit"
								height="40"
								width="120px"
								fontSize="15px"
								id="submit-btn"
							>
								Add
							</CustomButton>
						) : (
							<CircularProgress size={35} />
						)}
					</div> */}

					<div className="flex justify-center w-max mt-16" style={{ gap: '20px' }}>
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
								<CustomButton variant="primary" type="submit" width={140} id="add-school-button">
									Add
								</CustomButton>
							</>
						)}
					</div>
				</form>
			</div>
		</div>
	);
}

export default CreateEvents;
