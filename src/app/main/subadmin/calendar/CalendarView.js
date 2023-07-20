/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
import './calendar.css';
import moment from 'moment';
import DayjsUtils from '@date-io/dayjs';
import { useDispatch, useSelector } from 'react-redux';
import * as Actions from 'app/store/actions';
import FuseAnimate from '@fuse/core/FuseAnimate';
import Autocomplete from '@material-ui/lab/Autocomplete';
import React, { useState, useEffect, useRef } from 'react';
import { getRooms, getAllRooms } from 'app/services/rooms/rooms';
import CustomButton from 'app/customComponents/CustomButton/CustomButton';
import { useReactToPrint } from 'react-to-print';
import { TextField, Typography, Avatar, InputLabel, Select, MenuItem, FormControl } from '@material-ui/core';
import { DatePicker as MuiDatePicker, MuiPickersUtilsProvider } from '@material-ui/pickers';
import { getEvents } from 'app/services/events/events';
import WeeklyCalendar from './WeeklyCalendar';
import DailyCalendar from './DailyCalendar';
import MonthlyCalendar from './MonthlyCalendar';

function CalendarView() {
	const ref = useRef(null);
	const dispatch = useDispatch();
	const [page, setPage] = useState(1);
	const [week, setWeek] = useState(() => {
		const d = moment(new Date()).startOf('week');
		const newWeek = [];
		for (let i = 0; i < 7; i += 1) {
			newWeek.push(moment(d.add(1, 'days')));
		}
		console.log(newWeek);
		return newWeek;
	});
	const [rooms, setRooms] = useState([]);
	const [hasMore, setHasMore] = useState(false);
	const [anchorEl, setAnchorEl] = useState(null);
	const [selectedRoom, setSelectedRoom] = useState(null);
	const [isRoomLoading, setIsRoomLoading] = useState(false);
	const [searchRoomQuery, setRoomSearchQuery] = useState('');
	const [currentView, setCurrentView] = useState('month'); // One of week, day, month
	const [events, setEvents] = useState([]);
	const [isLoadingEvents, setIsLoadingEvents] = useState(false);
	const user = useSelector(({ auth }) => auth.user);
	const [refresh, setRefresh] = useState(false);

	const componentToPrint = useRef(null);

	useEffect(() => {
		setIsLoadingEvents(true);
		console.log(week);
		getEvents(week[0]?.format('YYYY-MM-DD'), week[week.length - 1]?.format('YYYY-MM-DD'), selectedRoom)
			.then((res) => {
				console.log(res);
				setEvents(res.data);
			})
			.finally((_) => setIsLoadingEvents(false));
	}, [week, selectedRoom, refresh]);

	useEffect(() => {
		setEvents([]);
		if (currentView === 'week') {
			const d = moment(new Date()).startOf('week');
			const newWeek = [];
			for (let i = 0; i < 7; i += 1) {
				newWeek.push(moment(d.add(1, 'days')));
			}
			setWeek(newWeek);
		}
		if (currentView === 'day') {
			setWeek([moment(new Date())]);
		}
		if (currentView === 'month') {
			const d = moment(new Date()).startOf('month').startOf('week');
			const newWeek = [];
			for (let i = 0; i < 35; i += 1) {
				newWeek.push(moment(d.add(1, 'days')));
			}
			setWeek(newWeek);
		}
	}, [currentView]);

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

	const handlePrint = useReactToPrint({
		content: () => componentToPrint.current,
	});

	const handleWeekChange = (changeNumber) => {
		if (currentView === 'week') {
			setHasMore(false);
			setPage(1);
			const newWeekArray = [];
			for (let i = 0; i < 7; i += 1) {
				const date = new Date(week[i]);
				newWeekArray[i] = moment(new Date(date.setDate(date.getDate() + changeNumber)));
			}
			setWeek(newWeekArray);
		}
		if (currentView === 'day') {
			setHasMore(false);
			setPage(1);
			setWeek([moment(week[0].add(changeNumber, 'days'))]);
		}
		if (currentView === 'month') {
			setHasMore(false);
			setPage(1);
			const d = week[15].add(changeNumber, 'month').startOf('month').startOf('week');
			const newWeek = [];
			for (let i = 0; i < 35; i += 1) {
				newWeek.push(moment(d.add(1, 'days')));
			}
			setWeek(newWeek);
		}
	};

	const handleCalendarDateChange = (date) => {
		if (currentView === 'week') {
			date = new Date(date.format('YYYY-MM-DD'));
			setHasMore(false);
			setPage(1);
			const newWeek = [];
			for (let i = 0; i < 7; i += 1) {
				newWeek[i] = moment(new Date(moment(date).add(i, 'days')));
			}
			setWeek(newWeek);
		}
		if (currentView === 'day') {
			setWeek([moment(new Date(date))]);
		}
		if (currentView === 'month') {
			console.log(date);
			const d = moment(new Date(date)).startOf('month').startOf('week');
			console.log(d);
			const newWeek = [];
			for (let i = 0; i < 35; i += 1) {
				newWeek.push(moment(d.add(1, 'days')));
			}
			setWeek(newWeek);
		}
	};
	const handleView = (e) => {
		const { value } = e.target;
		setCurrentView(value);
	};

	const open = Boolean(anchorEl);

	return (
		<FuseAnimate animation="transition.slideLeftIn" duration={600}>
			<div className="calendar-cont mx-auto">
				<div className="flex items-end justify-between">
					<span className="text-xl font-bold mr-28">Calendar</span>
					<div className="flex items-end grow" style={{ gap: 15 }}>
						<Autocomplete
							id="rooms"
							options={rooms}
							renderOption={(option) => (
								<>
									<div className="flex" style={{ gap: 10 }}>
										<Avatar src={option.photo} />
										<div>{option.name}</div>
									</div>
								</>
							)}
							getOptionLabel={(option) => option.name}
							autoComplete={false}
							clearOnBlur={false}
							loading={isRoomLoading}
							loadingText="...Loading"
							sx={{ width: '100%' }}
							onChange={(_e, v) => {
								setSelectedRoom(v?.id);
							}}
							renderInput={(params) => (
								<TextField
									{...params}
									label="Room"
									style={{ width: '250px' }}
									onChange={(e) => setRoomSearchQuery(e.target.value)}
									autoComplete="off"
								/>
							)}
						/>
						<CustomButton onClick={handlePrint} variant="secondary" height="40" width="80px">
							<i className="fa fa-print" aria-hidden="true" /> Print
						</CustomButton>
					</div>
				</div>
				<div
					className="bg-white rounded mt-32 p-32"
					style={{ height: '66vh', overflow: 'scroll', overflowX: 'auto' }}
				>
					<div className="flex justify-between">
						<div>
							<div className="flex justify-between">
								<img
									src="assets/images/backward.png"
									style={{ cursor: 'pointer' }}
									onClick={() => {
										if (currentView === 'week') {
											handleWeekChange(-7);
										} else if (currentView === 'day') {
											handleWeekChange(-1);
										} else {
											handleWeekChange(-1);
										}
									}}
								/>
								<span
									className="font-extrabold"
									onClick={() => ref.current.click()}
									style={{ fontSize: '15px', margin: '0 15px', cursor: 'pointer', lineHeight: '2.2' }}
								>
									{currentView === 'week' && (
										<p>
											{week[6] ? moment.months()[new Date(week[3]).getMonth()] : ''},{' '}
											{new Date(week[3]).getFullYear()}
										</p>
									)}
									{currentView === 'day' && <p>{week[0].format('DD[, ]MMMM[ ] YYYY')}</p>}
									{currentView === 'month' && (
										<p>
											{week[15] ? moment.months()[new Date(week[15])?.getMonth()] : ''},{' '}
											{new Date(week[15]).getFullYear()}
										</p>
									)}
								</span>
								<img
									src="assets/images/forward.png"
									style={{ cursor: 'pointer' }}
									onClick={() => {
										if (currentView === 'week') {
											handleWeekChange(7);
										} else if (currentView === 'day') {
											handleWeekChange(1);
										} else {
											handleWeekChange(1);
										}
									}}
								/>
							</div>
							<MuiPickersUtilsProvider utils={DayjsUtils}>
								<MuiDatePicker
									disabled={false}
									views={currentView === 'month' ? ['month', 'year'] : ['year', 'month', 'date']}
									inputRef={ref}
									style={{ display: 'none' }}
									format="dd/MM/yyyy"
									onChange={(date) => handleCalendarDateChange(date)}
									minDate={moment().subtract(2, 'months').format('MM/DD/YYYY')}
									maxDate={moment().add(1, 'years').format('MM/DD/YYYY')}
								/>
							</MuiPickersUtilsProvider>
						</div>
						<div>
							<FormControl>
								<Select
									name="filter"
									onChange={handleView}
									value={currentView}
									id="view"
									style={{ width: 150, gap: 10 }}
									startAdornment={
										<>
											{currentView === 'day' && (
												<img className="cursor-pointer" src="assets/images/day.png" />
											)}
											{currentView === 'week' && (
												<img className="cursor-pointer" src="assets/images/week.png" />
											)}
											{currentView === 'month' && (
												<img className="cursor-pointer" src="assets/images/month.png" />
											)}
										</>
									}
								>
									<MenuItem value="day">
										<span id="day">Day</span>
									</MenuItem>
									<MenuItem value="week">
										<span id="week">Week</span>
									</MenuItem>
									<MenuItem value="month">
										<span id="month">Month</span>
									</MenuItem>
								</Select>
							</FormControl>
						</div>
					</div>
					<div className="mt-28">
						{currentView === 'week' && (
							<WeeklyCalendar
								week={week}
								loading={isLoadingEvents}
								events={events}
								setRefresh={setRefresh}
								refresh={refresh}
							/>
						)}
						{currentView === 'day' && (
							<DailyCalendar
								week={week}
								loading={isLoadingEvents}
								events={events}
								setRefresh={setRefresh}
								refresh={refresh}
							/>
						)}
						{currentView === 'month' && (
							<MonthlyCalendar
								loading={isLoadingEvents}
								week={week}
								events={events}
								setWeek={setWeek}
								setRefresh={setRefresh}
								refresh={refresh}
							/>
						)}
					</div>
				</div>
				<div className="hidden">
					<div ref={componentToPrint} className="p-16">
						<div className="flex flex-row justify-between">
							<div>
								<img src="assets/images/logos/logo.png" />
							</div>
							<div style={{ textAlign: 'right' }}>
								<Typography variant="subtitle1">
									<span style={{ display: 'block', marginBottom: '-0.7em', writingMode: '' }}>
										{user.school?.address || user.data.school.address}
									</span>{' '}
									<span>
										{user.school?.city || user.data.school.city}{' '}
										{user.school?.zip_code || user.data.school.city}
									</span>
								</Typography>
								<Typography variant="subtitle1">+1 365 986 1258</Typography>
								<Typography variant="subtitle1">perfectday@gmail.com</Typography>
							</div>
						</div>
						<div style={{ marginBottom: '20px' }}>
							<h3>
								<strong>Calendar Events</strong>
							</h3>
							<span>
								<strong>Date: </strong>
							</span>
							<span>
								{currentView === 'day' ? (
									<>{week[0].format('dddd, DD MMMM YYYY')}</>
								) : (
									<>{week[6]?.format('MMMM YYYY')}</>
								)}
							</span>
						</div>
						<div className="mt-28">
							{currentView === 'week' && (
								<WeeklyCalendar week={week} loading={isLoadingEvents} events={events} />
							)}
							{currentView === 'day' && (
								<DailyCalendar week={week} loading={isLoadingEvents} events={events} />
							)}
							{currentView === 'month' && (
								<MonthlyCalendar
									loading={isLoadingEvents}
									week={week}
									events={events}
									setWeek={setWeek}
									setCurrentView={setCurrentView}
									printView={true}
								/>
							)}
						</div>
					</div>
				</div>
			</div>
		</FuseAnimate>
	);
}

export default CalendarView;
