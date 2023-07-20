import React, { useEffect, useState, useRef } from 'react';
import {
	TextField,
	InputLabel,
	MenuItem,
	FormControl,
	Select,
	FormHelperText,
	CircularProgress,
	ListItemText,
	Checkbox,
	ListItemIcon,
	IconButton
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import CustomButton from 'app/customComponents/CustomButton/CustomButton';
import { getEventStudent, getEventType, updateEvent, getEventsById } from 'app/services/events/events';
import './CreateEvents.css';
import { useDispatch } from 'react-redux';
import * as Actions from 'app/store/actions';
import dayjs from 'dayjs';
import history from '@history';
import CustomDatePicker from 'app/customComponents/CustomDatePicker/CustomDatePicker';
import { getAllRooms } from 'app/services/rooms/rooms';
import { useParams } from 'react-router';
import moment from 'moment';

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
function UpdateEvents() {
	const classes = useStyles();
	const dispatch = useDispatch();
	const ref = useRef(null);
	const [form, setForm] = useState({});
	const [errTxts, setErrTxts] = useState({});
	const [isLoading, setIsLoading] = useState(true);
	const [types, setTypes] = useState([]);
	const [rooms, setRooms] = useState([]);
	const [date, setDate] = useState();
	const [students, setStudents] = useState([]);
	const [page, setPage] = useState(1);
	const [selected, setSelected] = useState([]);
	const isAllSelected = rooms.length > 0 && selected.length === rooms.length;
	const { id } = useParams();

	useEffect(() => {
		getEventsById(id).then(res => {
			setForm({
				id: res.data?.id,
				date: dayjs(res.data.datetime).format('YYYY-MM-DD'),
				student_id: res.data?.students?.student_id || null,
				room_id: JSON.parse(JSON.stringify(res.data?.rooms)),
				type: res.data.event_type?.id || '',
				description: res.data.description || ''
			});
			setDate(dayjs(res.data.datetime).format('YYYY-MM-DD'));
			setSelected(JSON.parse(JSON.stringify(res.data?.rooms)));
			setIsLoading(false);
		});
	}, []);

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

	const handleChange = e => {
		const { name, value } = e.target;
		setErrTxts({ ...errTxts, [name]: '' });
		if (name === 'room_id' && value[value.length - 1] === 'all') {
			setSelected(selected.length === rooms.length ? [] : rooms);
			setForm({ ...form, room_id: selected.length === rooms.length ? [] : rooms, student_id: null });
			setStudents([]);
			return;
		}

		if (name === 'room_id') {
			setPage(1);

			setStudents([]);

			if (
				selected.length < value.length &&
				selected.map(sel => sel.id).indexOf(value[value.length - 1]?.id) > -1
			) {
				const temp = selected.filter(sel => sel.id !== value[value.length - 1]?.id);
				setSelected(temp);
				setForm({ ...form, [name]: temp, student_id: null });
			} else {
				setSelected(value);
				setForm({ ...form, [name]: value, student_id: null });
			}
		} else {
			setForm({ ...form, [name]: value });
		}

	};

	const handleSubmit = ev => {
		ev.preventDefault();
		setErrTxts({});

		// if (!form.room_id) {
		// 	delete form.room_id;
		// 	delete form.student_id;
		// }
		if (selected.length === 0) {
			setErrTxts({ ...errTxts, room_id: 'This field is required' });
			return;
		}
		if (!form.student_id) {
			delete form.student_id;
		}

		if (!form.description) {
			delete form.description;
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
		setIsLoading(true);
		updateEvent(form, form.id)
			.then(res => {
				dispatch(
					Actions.showMessage({
						message: 'Event Updated Successfully.',
						autoHideDuration: 1500,
						variant: 'success'
					})
				);
				history.goBack();
			})
			.catch(err => {
				dispatch(
					Actions.showMessage({
						message: 'Failed to Updated event.',
						autoHideDuration: 1500,
						variant: 'error'
					})
				);
				if (!form.room_id) {
					setForm({ ...form, room_id: tempRoomId });
				}
				if (err.response.data.errors) {
					setErrTxts(err.response.data.errors);
				}
			})
			.finally(() => {
				setIsLoading(false);
			});
	};

	useEffect(() => {
		if (date) {
			if (dayjs(date).format('YYYY-MM-DD') === form.date) {
				return;
			}
			setForm({ ...form, date: dayjs(date).format('YYYY-MM-DD') });
			setErrTxts({ ...errTxts, date: '' });
		} else {
			setForm({ ...form, date: '' });
		}
	}, [date, form?.date]);

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

	return (
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
				Edit Event
			</div>

			<div className="enroll-form-containerr px-60 py-32 bg-white">
				{isLoading ? (
					<CircularProgress className="m-auto justtify-center items-center flex" />
				) : (
					<form onSubmit={handleSubmit}>
						<h2 className="form-section-headingg" style={{ fontSize: '18px' }}>Event Information</h2>
						<fieldset>
							<div className="student-fieldd-flexx flex justify-between date-width">
								<CustomDatePicker
									width="45%"
									errTxts={errTxts.date}
									value={form?.date}
									setValue={setDate}
									label="Calendar"
									id="date"
									name="date"
									disablePast
								/>

								<FormControl
									error={!!errTxts.type?.length}
									variant="standard"
									className="student-slt width-imp"
								>
									<InputLabel id="homeroomLabel">Event Type</InputLabel>
									<Select
										name="type"
										onChange={handleChange}
										labelId="Eventtype"
										error={!!errTxts.type?.length}
										helperText={errTxts.type}
										value={form?.type}
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
									className={`${classes.formControl} student-slt resulttttttt`}
								>
									<InputLabel id="mutiple-select-label">Room Name</InputLabel>
									<Select
										labelId="mutiple-select-label"
										multiple
										value={form.room_id}
										ref={ref}
										error={!!errTxts.room_id?.length}
										helperText={errTxts.room_id}
										name="room_id"
										id="room_id"
										onChange={handleChange}
										className="hello"
										renderValue={select => {
											return select.length === rooms.length
												? 'All Rooms Selected'
												: select.map(room => room.name).join(', ');
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
													indeterminate={
														selected.length > 0 && selected.length < rooms.length
													}
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
																checked={
																	selected.map(ro => ro.id).indexOf(room.id) > -1
																}
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
										{students?.length && form.room_id?.length === 1 ? (
											students.map(student => {
												return (
													<MenuItem key={student.id} value={student.id}>
														<span id={`student-${student.id}`}>
															{`${student.first_name} ${student.last_name}`}
														</span>
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

							<div className="event-field-flex flex justify-between des event-des">
								<TextField
									onChange={handleChange}
									name="description"
									label="Event Specification"
									id="description"
									value={form?.description}
									error={!!errTxts.description?.length}
									helperText={errTxts.description}
									className="impppp"
								/>
							</div>
						</fieldset>

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
										id="update-btn"
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
					</form>
				)}
			</div>
		</div>
	);
}

export default UpdateEvents;
