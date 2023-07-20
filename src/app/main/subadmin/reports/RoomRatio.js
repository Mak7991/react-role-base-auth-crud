import React, { useState, useEffect, useRef } from 'react';
import history from '@history';
import {
	Table,
	TableHead,
	TableBody,
	TableCell,
	TableContainer,
	TableRow,
	Paper,
	CircularProgress,
	IconButton,
	InputLabel,
	Select,
	MenuItem,
	FormControl,
	Typography,
} from '@material-ui/core';
import FuseAnimate from '@fuse/core/FuseAnimate';
import { useDispatch, useSelector } from 'react-redux';
import * as Actions from 'app/store/actions';
import CustomButton from 'app/customComponents/CustomButton/CustomButton';
import './Reports.css';
import moment from 'moment';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload } from '@fortawesome/free-solid-svg-icons';
import CustomDatePicker from 'app/customComponents/CustomDatePicker/CustomDatePicker';
import { getRoomRatios, getRooms } from 'app/services/reports/reports';
import { Close } from '@material-ui/icons';
import { useReactToPrint } from 'react-to-print';

export default function RoomRatio() {
	const dispatch = useDispatch();
	const user = useSelector(({ auth }) => auth.user);
	const [rows, setRows] = useState([]);
	const [isLoading, setIsLoading] = useState(false);
	const [firstLoad, setFirstLoad] = useState(true);
	const roomratioRef = useRef(null);
	const [filters, setFilters] = useState({
		export_id: 0,
		room_id: '',
		date: '',
		interval: '',
		room_name: '',
	});
	const [rooms, setRooms] = useState([]);
	const report_date = new Date();
	const [roomPage, setRoomPage] = useState(1);
	const [isLoadingExport, setIsLoadingExport] = useState(false);

	useEffect(() => {
		getRooms('', roomPage)
			.then((res) => {
				setRooms([...rooms, ...res.data.data]);
				if (res.data.current_page < res.data.last_page) {
					setRoomPage(roomPage + 1);
				}
			})
			.catch((err) => {
				dispatch(
					Actions.showMessage({
						message: 'Failed to get rooms.',
						autoHideDuration: 1500,
						variant: 'error',
					})
				);
			});
	}, [roomPage, dispatch]);

	const calculateRemainingSlots = (date, interval, slots) => {
		// if date is not today
		// date.slice(0,-1) to remove the z so it is not treated as utc date and timezone coversion does not change date
		console.log(moment(date.slice(0, -1)).format('YYYY-MM-DD'), moment().format('YYYY-MM-DD'));
		if (moment(date.slice(0, -1)).format('YYYY-MM-DD') !== moment().format('YYYY-MM-DD')) {
			switch (interval) {
				case 'fifteen': {
					const totalSlots = 13 * 4;
					const remainingSlots = totalSlots - slots.length;
					for (let i = 0; i < remainingSlots; i += 1) {
						slots.push({
							staff_count: slots.slice(-1)[0]?.staff_count || 0,
							student_count: slots.slice(-1)[0]?.student_count || 0,
							start_time: moment(`2022-12-01T${slots.slice(-1)[0]?.start_time}` || '2022-12-01T06:00:00') // here date does not matter, we only need time
								.add(15, 'minutes')
								.format('HH:mm'),
							end_time: moment(`2022-12-01T${slots.slice(-1)[0]?.end_time}` || '2022-12-01T19:00:00')
								.add(15, 'minutes')
								.format('HH:mm'),
						});
					}
					break;
				}
				case 'thirty': {
					const totalSlots = 13 * 2;
					const remainingSlots = totalSlots - slots.length;
					for (let i = 0; i < remainingSlots; i += 1) {
						slots.push({
							staff_count: slots.slice(-1)[0]?.staff_count || 0,
							student_count: slots.slice(-1)[0]?.student_count || 0,
							start_time: moment(`2022-12-01T${slots.slice(-1)[0]?.start_time}` || '2022-12-01T06:00:00')
								.add(30, 'minutes')
								.format('HH:mm'),
							end_time: moment(`2022-12-01T${slots.slice(-1)[0]?.end_time}` || '2022-12-01T19:00:00')
								.add(30, 'minutes')
								.format('HH:mm'),
						});
					}
					break;
				}
				case 'sixty': {
					const totalSlots = 13;
					const remainingSlots = totalSlots - slots.length;
					for (let i = 0; i < remainingSlots; i += 1) {
						slots.push({
							staff_count: slots.slice(-1)[0]?.staff_count || 0,
							student_count: slots.slice(-1)[0]?.student_count || 0,
							start_time: moment(`2022-12-01T${slots.slice(-1)[0]?.start_time}` || '2022-12-01T06:00:00')
								.add(60, 'minutes')
								.format('HH:mm'),
							end_time: moment(`2022-12-01T${slots.slice(-1)[0]?.end_time}` || '2022-12-01T19:00:00')
								.add(60, 'minutes')
								.format('HH:mm'),
						});
					}
					break;
				}
				default: {
					break;
				}
			}
		} else {
			// only add slots till current time
			const currentTime = moment().format('HH:mm:ss');
			switch (interval) {
				case 'fifteen': {
					const totalSlots = 13 * 4;
					const remainingSlots = totalSlots - slots.length;
					for (let i = 0; i < remainingSlots; i += 1) {
						slots.push({
							staff_count: slots.slice(-1)[0]?.staff_count || 0,
							student_count: slots.slice(-1)[0]?.student_count || 0,
							start_time: moment(`2022-12-01T${slots.slice(-1)[0]?.start_time}` || '2022-12-01T06:00:00')
								.add(15, 'minutes')
								.format('HH:mm:ss'),
							end_time: moment(`2022-12-01T${slots.slice(-1)[0].end_time}` || '2022-12-01T19:00:00')
								.add(15, 'minutes')
								.format('HH:mm:ss'),
						});
						if (moment(slots.slice(-1)[0].start_time).format('HH:mm:ss') > currentTime) {
							slots.pop();
							break;
						}
					}
					break;
				}
				case 'thirty': {
					const totalSlots = 13 * 2;
					const remainingSlots = totalSlots - slots.length;
					for (let i = 0; i < remainingSlots; i += 1) {
						slots.push({
							staff_count: slots.slice(-1)[0]?.staff_count || 0,
							student_count: slots.slice(-1)[0]?.student_count || 0,
							start_time: moment(`2022-12-01T${slots.slice(-1)[0]?.start_time}` || '2022-12-01T06:00:00')
								.add(30, 'minutes')
								.format('HH:mm:ss'),
							end_time: moment(`2022-12-01T${slots.slice(-1)[0].end_time}` || '2022-12-01T19:00:00')
								.add(30, 'minutes')
								.format('HH:mm:ss'),
						});
						if (moment(slots.slice(-1)[0].start_time).format('HH:mm:ss') > currentTime) {
							slots.pop();
							break;
						}
					}
					break;
				}
				case 'sixty': {
					const totalSlots = 13;
					const remainingSlots = totalSlots - slots.length;
					console.log('remainingSlots', remainingSlots);
					console.log(slots.slice(-1));
					for (let i = 0; i < remainingSlots; i += 1) {
						slots.push({
							staff_count: slots.slice(-1)[0]?.staff_count || 0,
							student_count: slots.slice(-1)[0]?.student_count || 0,
							start_time: moment(`2022-12-01T${slots.slice(-1)[0]?.start_time}` || '2022-12-01T06:00:00')
								.add(60, 'minutes')
								.format('HH:mm:ss'),
							end_time: moment(`2022-12-01T${slots.slice(-1)[0].end_time}` || '2022-12-01T19:00:00')
								.add(60, 'minutes')
								.format('HH:mm:ss'),
						});
						if (moment(slots.slice(-1)[0].start_time).format('HH:mm:ss') > currentTime) {
							slots.pop();
							break;
						}
					}
					break;
				}
				default: {
					break;
				}
			}
		}
		return slots;
	};

	const ApplyFilters = () => {
		setRows([]);
		setIsLoading(true);
		setFirstLoad(false);
		getRoomRatios(filters.export_id, filters.room_id, filters.date, filters.interval, filters.room_name)
			.then((res) => {
				if (!res.data.roomRatios) {
					setRows([]);
					setIsLoading(false);
					return;
				}
				if (filters.interval === 'fifteen') {
					setFirstLoad(false);
					if (res.data.roomRatios.fifteen.length > 0) {
						const remainingSlots = calculateRemainingSlots(
							res.data.roomRatios.date,
							filters.interval,
							res.data.roomRatios.fifteen
						);
						setRows(remainingSlots || []);
					} else {
						setRows([]);
					}
				} else if (filters.interval === 'thirty') {
					setFirstLoad(false);
					if (res.data.roomRatios.thirty.length > 0) {
						const remainingSlots = calculateRemainingSlots(
							res.data.roomRatios.date,
							filters.interval,
							res.data.roomRatios.thirty
						);
						setRows(remainingSlots || []);
					} else {
						setRows([]);
					}
				} else {
					setFirstLoad(false);
					if (res.data.roomRatios.sixty.length > 0) {
						const remainingSlots = calculateRemainingSlots(
							res.data.roomRatios.date,
							filters.interval,
							res.data.roomRatios.sixty
						);
						console.log(remainingSlots);
						setRows(remainingSlots || []);
					} else {
						setRows([]);
					}
				}
				dispatch(
					Actions.showMessage({
						message: 'Report has been generated',
						variant: 'success',
					})
				);
			})
			.catch((err) => {
				console.log(err);
				dispatch(
					Actions.showMessage({
						message: 'Failed to fetch data, please refresh',
						variant: 'error',
					})
				);
			})
			.finally(() => {
				setIsLoading(false);
			});
	};

	const handleExport = () => {
		if (!filters.interval || !filters.date || !filters.room_id) {
			dispatch(
				Actions.showMessage({
					message: 'Please select all the filters',
					variant: 'error',
				})
			);
			return;
		}
		setIsLoadingExport(true);
		getRoomRatios(1, filters.room_id, filters.date, filters.interval, filters.room_name)
			.then((res) => {
				const blob = new Blob([res.data], {
					type: 'text/csv',
				});
				const link = document.createElement('a');
				link.setAttribute('target', '_blank');
				link.href = window.URL.createObjectURL(blob);
				link.setAttribute('download', `RoomRatio_report_${new Date().getTime()}.csv`);
				document.body.appendChild(link);
				link.click();
				// Clean up and remove the link
				link.parentNode.removeChild(link);
				setIsLoadingExport(false);
			})
			.catch((err) => {
				dispatch(
					Actions.showMessage({
						message: 'Failed to Export',
						variant: 'error',
					})
				);
				setIsLoadingExport(false);
			})
			.finally(() => {
				setIsLoadingExport(false);
			});
	};

	const handlePrint = useReactToPrint({
		content: () => roomratioRef.current,
	});

	const handleFilters = (ev) => {
		const { name, value } = ev.target;
		setFilters({ ...filters, [name]: value });
	};

	return (
		<FuseAnimate animation="transition.slideLeftIn" duration={600}>
			<div className="mx-auto enrolled-cont">
				<div className="flex items-center justify-between">
					<div className="reports-topDiv">
						<h1 className="">
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
							<span className="text-xl self-end font-bold mr-28">Ratio</span>
						</h1>
						<p>
							Historical staff and student count and the associated student: staff ratio by room, with the
							option to choose <br />
							15-minute, 30-minute, or 1-hour intervals
						</p>
					</div>
					<div className="flex justify-between">
						<div className="flex items-center justify-between">
							<div className="">
								<span>
									{!isLoadingExport ? (
										<a>
											<CustomButton
												onClick={handleExport}
												variant="primary"
												height="40px"
												width="100px"
												marginRight="17px"
											>
												<span className="mr-4">
													<FontAwesomeIcon icon={faDownload} />
												</span>
												Export
											</CustomButton>
										</a>
									) : (
										<div className="circle-bar">
											<CircularProgress size={35} />
										</div>
									)}
									<CustomButton
										onClick={() => handlePrint()}
										variant="secondary"
										height="40px"
										width="100px"
									>
										<i className="fa fa-print" aria-hidden="true" /> Print
									</CustomButton>
								</span>
							</div>
						</div>
					</div>
				</div>

				<div className="flex items-center flex-nowrap justify-between">
					<span className="text-2xl self-end font-extrabold mr-28" />
					<div className="flex justify-between">
						<div className="flex">
							<div className="mx-8">
								<FormControl>
									<InputLabel id="roomLabel"> Room</InputLabel>
									<Select
										name="room_id"
										onChange={(ev) => {
											setFilters({
												...filters,
												room_id: ev.target.value.id,
												room_name: ev.target.value.name,
											});
										}}
										value={rooms.filter((room) => room.id === filters.room_id)[0] || null}
										labelId="roomLabel"
										id="room_id"
										label="Room"
										style={{ width: 160 }}
										endAdornment={
											filters.room_id ? (
												<IconButton id="clear-room-filter" size="small" className="mr-16">
													<Close
														onClick={() => {
															setFilters({
																...filters,
																room_id: '',
																room_name: '',
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
										{rooms.length ? (
											rooms.map((room) => {
												return (
													<MenuItem key={room.id} value={room} id={room.id}>
														{room.name}
													</MenuItem>
												);
											})
										) : (
											<MenuItem disabled>Loading...</MenuItem>
										)}
									</Select>
								</FormControl>
							</div>
							<div className="mx-10 student-date-field" style={{ width: 160 }}>
								<CustomDatePicker
									id="date-from"
									label="Date"
									value={filters.date}
									// disabled={!filters.room_id}
									setValue={(Date) => {
										setFilters({ ...filters, date: Date?.format('YYYY-MM-DD') || '' });
									}}
									disableFuture
								/>
							</div>
							<div className="mx-8">
								<FormControl>
									<InputLabel id="interval">Interval</InputLabel>
									<Select
										name="interval"
										className="interval-select interval-time"
										labelId="interval"
										id="interval"
										label="Time Interval"
										value={filters.interval}
										onChange={handleFilters}
										style={{ width: 160 }}
										endAdornment={
											filters.interval ? (
												<div className="flex">
													<IconButton id="clear-room-filter" size="small" className="mr-16">
														<Close
															onClick={() => {
																setFilters({
																	...filters,
																	interval: '',
																});
															}}
															fontSize="small"
														/>
													</IconButton>
												</div>
											) : (
												''
											)
										}
									>
										<MenuItem value="fifteen">15 Minute</MenuItem>
										<MenuItem value="thirty">30 Minute</MenuItem>
										<MenuItem value="sixty">1 Hour</MenuItem>
									</Select>
								</FormControl>
							</div>
						</div>

						<div className="self-end">
							<span>
								<span className="mx-4">
									<CustomButton
										variant="secondary"
										height="43"
										width="140px"
										fontSize="15px"
										disabled={
											!filters.room_id || !filters.date || !filters.interval || !filters.room_name
										}
										onClick={() => {
											ApplyFilters();
										}}
									>
										Apply
									</CustomButton>
								</span>
							</span>
						</div>
					</div>
				</div>

				{/* table  */}
				<TableContainer id="Scrollable-table" component={Paper} className="student-table-cont">
					<div style={{ display: 'none' }}>
						<div ref={roomratioRef} className="p-32">
							<div className="flex flex-row justify-between">
								<div>
									<img src="assets/images/logos/logo.png" alt="" />
								</div>
								<div style={{ textAlign: 'right' }}>
									<Typography
										variant="subtitle1"
										style={{
											maxWidth: '220px',
										}}
									>
										<span style={{ display: 'block', marginBottom: '5px', writingMode: '' }}>
											{user?.data?.school?.address}
										</span>
									</Typography>
									<Typography variant="subtitle1">+ {user?.data?.phone}</Typography>
									<Typography variant="subtitle1">{user?.data?.email}</Typography>
								</div>
							</div>
							<div style={{ marginBottom: '20px' }}>
								<span>
									<strong>Date: </strong>
								</span>
								<span>{moment().format('dddd, DD MMMM YYYY')}</span>
							</div>
							<div className="pdf-heading">
								<h1 className="font-extrabold">Ratio</h1>
							</div>

							<Table stickyHeader className="enrolledtudent-table" style={{ width: '100%' }}>
								<TableHead>
									<TableRow>
										<TableCell style={{ width: '30%' }} className="bg-white studentTableHeader">
											Time
										</TableCell>
										<TableCell style={{ width: '30%' }} className="bg-white studentTableHeader">
											Student Count
										</TableCell>
										<TableCell style={{ width: '30%' }} className="bg-white studentTableHeader">
											Staff Count
										</TableCell>
										<TableCell style={{ width: '15%' }} className="bg-white studentTableHeader">
											Ratio
										</TableCell>
									</TableRow>
								</TableHead>
								<TableBody className="">
									{isLoading ? (
										<TableRow>
											<TableCell align="center" colSpan={8}>
												<CircularProgress size={35} />
											</TableCell>
										</TableRow>
									) : !rows.length && !firstLoad ? (
										<TableRow>
											<TableCell align="center" colSpan={8}>
												No Check-ins Check-outs
											</TableCell>
										</TableRow>
									) : (
										rows?.map((row) => (
											<TableRow key={row.id}>
												<TableCell>
													<div className="ratio-numbers">
														{row?.start_time.split(':').slice(0, 2).join(':')}&nbsp;-&nbsp;
														{row?.end_time.split(':').slice(0, 2).join(':')}
													</div>
												</TableCell>
												<TableCell>
													<div className="ratio-numbers">{row?.student_count}</div>
												</TableCell>
												<TableCell>
													<div className="ratio-numbers">{row?.staff_count}</div>
												</TableCell>
												<TableCell>
													<div className="ratio-numbers">
														{row?.student_count}&nbsp;:&nbsp;{row?.staff_count}
													</div>
												</TableCell>
											</TableRow>
										))
									)}
								</TableBody>
							</Table>
						</div>
					</div>
					<Table stickyHeader className="enrolledtudent-table" style={{ width: '100%' }}>
						<TableHead>
							<TableRow>
								<TableCell style={{ width: '30%' }} className="bg-white studentTableHeader">
									Time
								</TableCell>
								<TableCell style={{ width: '30%' }} className="bg-white studentTableHeader">
									Student Count
								</TableCell>
								<TableCell style={{ width: '30%' }} className="bg-white studentTableHeader">
									Staff Count
								</TableCell>
								<TableCell style={{ width: '15%' }} className="bg-white studentTableHeader">
									Ratio
								</TableCell>
							</TableRow>
						</TableHead>
						<TableBody className="">
							{firstLoad ? (
								<TableRow>
									<TableCell align="center" colSpan={8}>
										Generate your report
									</TableCell>
								</TableRow>
							) : isLoading ? (
								<TableRow>
									<TableCell align="center" colSpan={8}>
										<CircularProgress size={35} />
									</TableCell>
								</TableRow>
							) : !rows.length && !firstLoad ? (
								<TableRow>
									<TableCell align="center" colSpan={8}>
										No Check-ins Check-outs
									</TableCell>
								</TableRow>
							) : (
								rows?.map((row) => (
									<TableRow key={row.id}>
										<TableCell>
											<div className="ratio-numbers">
												{row?.start_time.split(':').slice(0, 2).join(':')}&nbsp;-&nbsp;
												{row?.end_time.split(':').slice(0, 2).join(':')}
											</div>
										</TableCell>
										<TableCell>
											<div className="ratio-numbers">{row?.student_count}</div>
										</TableCell>
										<TableCell>
											<div className="ratio-numbers">{row?.staff_count}</div>
										</TableCell>
										<TableCell>
											<div className="ratio-numbers">
												{row?.student_count}&nbsp;:&nbsp;{row?.staff_count}
											</div>
										</TableCell>
									</TableRow>
								))
							)}
						</TableBody>
					</Table>
				</TableContainer>
			</div>
		</FuseAnimate>
	);
}
