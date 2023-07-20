import CustomButton from 'app/customComponents/CustomButton/CustomButton';
import React, { useState, useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import * as Actions from 'app/store/actions';
import { makeStyles, Select, MenuItem, TextField, Typography, Avatar } from '@material-ui/core';
import history from '@history';
import FuseAnimate from '@fuse/core/FuseAnimate';
import Autocomplete from '@material-ui/lab/Autocomplete';
import { getRooms, getAllRooms } from 'app/services/rooms/rooms';
import moment from 'moment';
import DayjsUtils from '@date-io/dayjs';
import { DatePicker as MuiDatePicker, MuiPickersUtilsProvider } from '@material-ui/pickers';
import { useReactToPrint } from 'react-to-print';
import { getStaffById } from 'app/services/staff/staff';
import { schedulesList } from 'app/services/staff/staffschedule';
import Calendar from './calendar';
import './calendar.css';

const useStyles = makeStyles({
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
		},
		'& .MuiSvgIcon-root': {
			color: 'inherit'
		},
		color: 'inherit',
		'&:hover': {
			color: 'inherit'
		}
	},
});

function StaffScheduleListing() {
	const componentToPrint = useRef(null);
	const classes = useStyles();
	const dispatch = useDispatch();
	const [rooms, setRooms] = useState([]);
	const [isRoomLoading, setIsRoomLoading] = useState(false);
	const [searchRoomQuery, setRoomSearchQuery] = useState('');
	const [date, setDate] = useState(new Date());
	const [week, setWeek] = useState([]);
	const [schedules, setSchedules] = useState([]);
	const [isScheduleLoading, setScheduleLoading] = useState(false);
	const [page, setPage] = useState(1);
	const [selectedRoom, setSelectedRoom] = useState(null);
	const [hasMore, setHasMore] = useState(false);
	const ref = useRef(null);
	const [allRooms, setAllRooms] = useState([]);
	const [allStaff, setAllStaff] = useState([]);

	useEffect(() => {
		const d = moment(date).startOf('week');
		const newWeek = [];
		for (let i = 0; i < 7; i++) {
			const date = d.add(1, 'days');
			newWeek.push(new Date(date));
		}
		setWeek(newWeek);
		getAllRooms().then(({ data }) => {
			setAllRooms(data);
		});
		getStaffById().then(({ data }) => {
			setAllStaff(data);
		});
	}, []);

	useEffect(() => {
		setScheduleLoading(true);
		setSchedules([]);
		setPage(1);
		schedulesList(
			week[0]
				? moment(week[0]).format('YYYY-MM-DD')
				: moment()
						.startOf('week')
						.add(1, 'days')
						.format('YYYY-MM-DD'),
			week[6]
				? moment(week[6]).format('YYYY-MM-DD')
				: moment()
						.startOf('week')
						.add(7, 'days')
						.format('YYYY-MM-DD'),
			1,
			selectedRoom
		)
			.then(({ data }) => {
				setSchedules(data.data);
				if (data.current_page < data.last_page) {
					setHasMore(true);
					setPage(page + 1);
				} else {
					setHasMore(false);
				}
			})
			.catch(() => {
				dispatch(
					Actions.showMessage({
						message: 'Failed to fetch data, please refresh',
						variant: 'error'
					})
				);
			})
			.finally(() => {
				setScheduleLoading(false);
			});
	}, [selectedRoom, week, date]);

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
							variant: 'error'
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
							variant: 'error'
						})
					);
				})
				.finally(() => {
					setIsRoomLoading(false);
				});
		}
	}, [searchRoomQuery]);

	const handleSelectChange = e => {
		history.push(`/${e.target.value}`);
	};

	const handleWeekChange = changeNumber => {
		setHasMore(false);
		setPage(1);
		const newWeekArray = [];
		for (let i = 0; i < 7; i++) {
			const date = new Date(week[i]);
			newWeekArray[i] = new Date(date.setDate(date.getDate() + changeNumber));
			setWeek(newWeekArray);
		}
	};

	const handlePrint = useReactToPrint({
		content: () => componentToPrint.current
	});

	const handleLoadMore = () => {
		setScheduleLoading(true);
		schedulesList(moment(week[0]).format('YYYY-MM-DD'), moment(week[6]).format('YYYY-MM-DD'), page, selectedRoom)
			.then(({ data }) => {
				setSchedules(schedules.concat(data.data));
				if (data.current_page >= data.last_page) {
					setHasMore(false);
				} else {
					setHasMore(true);
					setPage(page + 1);
				}
			})
			.catch(() => {
				dispatch(
					Actions.showMessage({
						message: 'Failed to fetch data, please refresh',
						variant: 'error'
					})
				);
			})
			.finally(() => {
				setScheduleLoading(false);
			});
	};

	const handleCalendarDateChange = date => {
		date = new Date(date.format('YYYY-MM-DD'));
		setHasMore(false);
		setPage(1);
		const newWeek = [];
		for (let i = 0; i < 7; i++) {
			newWeek[i] = new Date(moment(date).add(i, 'days'));
		}
		setWeek(newWeek);
	};

	return (
		<FuseAnimate animation="transition.slideLeftIn" duration={600}>
			<div className="staff-schedule-cont mx-auto">
				<div style={{ display: 'none' }}>
					<div ref={componentToPrint} className="p-32">
						<div className="flex flex-row justify-between">
							<div>
								<img src="assets/images/logos/logo.png" />
							</div>
							<div style={{ textAlign: 'right' }}>
								<Typography variant="subtitle1">
									<span style={{ display: 'block', marginBottom: '-0.7em', writingMode: '' }}>
										642 Glan Eagles Street
									</span>{' '}
									<span>Hom Lake, Orlando, FL 38637</span>
								</Typography>
								<Typography variant="subtitle1">+1 365 986 1258</Typography>
								<Typography variant="subtitle1">perfectday@gmail.com</Typography>
							</div>
						</div>
						<div style={{ marginBottom: '20px' }}>
							<h3>
								<strong>Schedules</strong>
							</h3>
							<span>
								<strong>Date: </strong>
							</span>
							<span>{moment(date).format('dddd, DD MMMM YYYY')}</span>
						</div>
						<Calendar
							week={week}
							loading={isScheduleLoading}
							staffSchedules={schedules}
							printTable="print-table"
							allRooms={allRooms}
							allStaff={allStaff}
						/>
					</div>
				</div>
				<div className="flex justify-between">
					<span className="text-xl self-end font-bold mr-28" style={{fontSize:'20px'}}>Schedules</span>
					<div className="flex items-end grow" style={{ marginTop: 20, gap: 15 }}>
						<Autocomplete
							id="rooms"
							options={rooms}
							renderOption={option => (
								<>
									<div className="flex" style={{ gap: 10 }}>
										<Avatar src={option.photo} />
										<div>{option.name}</div>
									</div>
								</>
							)}
							getOptionLabel={option => option.name}
							autoComplete={false}
							clearOnBlur={false}
							loading={isRoomLoading}
							loadingText="...Loading"
							sx={{ width: '100%' }}
							onChange={(_e, v) => {
								setSelectedRoom(v?.id);
							}}
							renderInput={params => (
								<TextField
									{...params}
									label="Room"
									style={{ width: '250px' }}
									onChange={e => setRoomSearchQuery(e.target.value)}
									autoComplete="off"
								/>
							)}
						/>
						<CustomButton
							variant="secondary"
							height="40"
							width="200px"
							fontSize="15px"
							padding="2px"
							id="add-btn"
						>
							<Select
								className={classes.select}
								name="isNew"
								defaultValue="staffschedule"
								onChange={handleSelectChange}
								id="isNew"
							>
								<MenuItem className="hidden" value="staffschedule" disabled>
									+&nbsp; Staff Schedule
								</MenuItem>
								<MenuItem value="staff-schedule-workshiftschedule">Work Shift</MenuItem>
								<MenuItem value="staff-schedule-ptoschedule">PTO</MenuItem>
								<MenuItem value="staff-schedule-sickschedule">Sick</MenuItem>
							</Select>
						</CustomButton>
						<CustomButton onClick={handlePrint} variant="secondary" height="40" width="80px">
							<i className="fa fa-print" aria-hidden="true" /> Print
						</CustomButton>
					</div>
				</div>
				<div
					className="bg-white rounded mt-12 p-32"
					style={{ height: '66vh', overflow: 'scroll', overflowX: 'auto' }}
				>
					<div className="flex justify-between">
						<div>
							<div className="flex justify-between">
								<img
									src="assets/images/backward.png"
									style={{ cursor: 'pointer' }}
									onClick={() => {
										handleWeekChange(-7);
									}}
								/>
								<span
									className="font-extrabold"
									onClick={() => ref.current.click()}
									style={{ fontSize: '15px', margin: '0 15px', cursor: 'pointer', lineHeight: '2.2' }}
								>
									<p>
										{week[6] ? moment.months()[new Date(week[3]).getMonth()] : ''},{' '}
										{new Date(week[3]).getFullYear()}
									</p>
								</span>
								<img
									src="assets/images/forward.png"
									style={{ cursor: 'pointer' }}
									onClick={() => {
										handleWeekChange(7);
									}}
								/>
							</div>
							<MuiPickersUtilsProvider utils={DayjsUtils}>
								<MuiDatePicker
									disabled={false}
									inputRef={ref}
									style={{ display: 'none' }}
									format="dd/MM/yyyy"
									onChange={date => handleCalendarDateChange(date)}
									minDate={moment()
										.subtract(2, 'months')
										.format('MM/DD/YYYY')}
									maxDate={moment()
										.add(1, 'years')
										.format('MM/DD/YYYY')}
								/>
							</MuiPickersUtilsProvider>
						</div>
						<div>
							<div className="schedule-option">
								<div className="flex justify-between items-center" style={{ padding: '0px 20px' }}>
									<img src="assets/images/week.png" style={{ marginRight: 5 }} />
									<span>Week</span>
								</div>
							</div>
						</div>
					</div>
					<div className="mt-28">
						<Calendar
							week={week}
							loading={isScheduleLoading}
							staffSchedules={schedules}
							allRooms={allRooms}
							allStaff={allStaff}
							rooms={allRooms}
							staff={allStaff}
						/>
						<div style={{ textAlign: 'center', marginTop: '10px' }}>
							{!isScheduleLoading && hasMore && (
								<CustomButton
									variant="secondary"
									height="40"
									width="200px"
									onClick={() => {
										handleLoadMore();
									}}
								>
									Load More
								</CustomButton>
							)}
						</div>
					</div>
				</div>
			</div>
		</FuseAnimate>
	);
}

export default StaffScheduleListing;
