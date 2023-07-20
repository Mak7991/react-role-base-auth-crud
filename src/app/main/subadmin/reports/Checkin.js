/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
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
	Avatar,
	InputLabel,
	Select,
	MenuItem,
	FormControl,
	Typography
} from '@material-ui/core';
import FuseAnimate from '@fuse/core/FuseAnimate';
import { useDispatch, useSelector } from 'react-redux';
import * as Actions from 'app/store/actions';
import CustomButton from 'app/customComponents/CustomButton/CustomButton';
import { getReports, getStudents } from 'app/services/reports/reports';
import dayjs from 'dayjs';
import './Reports.css';
import moment from 'moment';
import momentTime from 'moment-timezone';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload } from '@fortawesome/free-solid-svg-icons';
import CustomDatePicker from 'app/customComponents/CustomDatePicker/CustomDatePicker';
import { useReactToPrint } from 'react-to-print';
import { getEventStudent } from 'app/services/events/events';
import axios from 'axios';
import { getRooms } from 'app/services/reports/reports';
import { Close } from '@material-ui/icons';
import InfiniteScroll from 'react-infinite-scroll-component';

function Checkin() {
	const dispatch = useDispatch();
	const user = useSelector(({ auth }) => auth.user);
	const [rows, setRows] = useState([]);
	const [isLoading, setIsLoading] = useState(false);
	const [iisLoading, ssetIsLoading] = useState(false);
	const [hasMore, setHasMore] = useState(false);
	const [firstLoad, setFirstLoad] = useState(true);
	const [fetchingMore, setFetchingMore] = useState(false);
	const [refresh, setRefresh] = useState(false);
	const checkInReportRef = useRef(null);
	const [page, setPage] = useState(1);
	const [filters, setFilters] = useState({
		export_id: 0,
		student_status: '',
		student_id: '',
		fromDate: '',
		toDate: '',
		roomId: ''
	});

	const [rooms, setRooms] = useState([]);
	const [students, setStudents] = useState([]);
	const [allStdPage, setAllStdPage] = useState(1);
	const [studentPage, setStudentPage] = useState(1);
	const [date, setDate] = useState(new Date());
	const [roomPage, setRoomPage] = useState(1);

	const [filterPage, setFilterPage] = useState(1);
	const [defaultUser, setDefaultUser] = useState(false);

	const timeZone = momentTime.tz.guess();
	console.log('................', timeZone);

	const handleFilters = ev => {
		const { name, value } = ev.target;
		setFilters({ ...filters, [name]: value });
		if (name === 'roomId') {
			setStudents([]);
			setStudentPage(1);
		}
		setDefaultUser(false);
		setFilterPage(1);
	};

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

	const handleLoadMore = () => {
		setFetchingMore(true);
		getReports(
			filters.export_id,
			timeZone,
			filters.student_status,
			filters.student_id,
			filters.fromDate,
			filters.toDate,
			filters.roomId === 'All' ? '' : filters.roomId,
			page
		)
			.then(res => {
				if (res.data.last_page > res.data.current_page) {
					setHasMore(true);
				} else {
					setHasMore(false);
				}
				setPage(res.data.current_page + 1);
				setRows(rows.concat(res.data.data));
				setFetchingMore(false);
			})
			.catch(err => {
				setFetchingMore(false);
				dispatch(
					Actions.showMessage({
						message: 'Failed to fetch data, please refresh',
						variant: 'error'
					})
				);
			});
	};

	const handleExport = () => {
		// setFetchingMore(true);
		ssetIsLoading(true);
		getReports(
			1,
			timeZone,
			filters.student_status,
			filters.student_id,
			filters.fromDate,
			filters.toDate,
			filters.roomId === 'All' ? '' : filters.roomId,
			1
		)
			.then(res => {
				const config = {
					method: 'get',
					url: res.data.link,
					responseType: 'blob'
				};
				const newAxios = axios.create({});
				delete newAxios.defaults.headers.common.Authorization;
				newAxios(config).then(resp => {
					const blob = new Blob([resp.data], {
						type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
					});
					const link = document.createElement('a');
					link.setAttribute('target', '_blank');
					link.href = window.URL.createObjectURL(blob);
					link.setAttribute('download', `checkin_report_${new Date().getTime()}.xlsx`);
					document.body.appendChild(link);
					link.click();
					// Clean up and remove the link
					link.parentNode.removeChild(link);
				});
			})
			.catch(err => {
				dispatch(
					Actions.showMessage({
						message: 'Failed to Export',
						variant: 'error'
					})
				);
			})
			.finally(() => {
				ssetIsLoading(false);
			});
	};

	const handlePrint = useReactToPrint({
		content: () => checkInReportRef.current
	});

	// useEffect(() => {
	// 	const timeout = setTimeout(
	// 		() => {
	// 			setFetchingMore(true);
	// 			getReports(
	// 				filters.export_id,
	// 				timeZone,
	// 				filters.student_status,
	// 				filters.student_id,
	// 				filters.fromDate,
	// 				filters.toDate,
	// 				filters.roomId,
	// 				page
	// 			)
	// 				.then(res => {
	// 					setRows([...rows, ...res.data.data]);
	// 					if (res.data.current_page < res.data.last_page) {
	// 						setPage(page + 1);
	// 					}
	// 				})
	// 				.catch(err => {
	// 					dispatch(
	// 						Actions.showMessage({
	// 							message: 'Failed to fetch data, please refresh',
	// 							variant: 'error'
	// 						})
	// 					);
	// 				})
	// 				.finally(() => {
	// 					setFetchingMore(false);
	// 				});
	// 		},
	// 		firstLoad ? 0 : 1000
	// 	);
	// 	return _ => {
	// 		clearTimeout(timeout);
	// 	};
	// 	// eslint-disable-next-line
	// }, [page, refresh]);

	const ApplyFilters = () => {
		setRows([]);
		setIsLoading(true);
		setFirstLoad(false);
		const timeout = setTimeout(
			() => {
				setIsLoading(true);
				getReports(
					filters.export_id,
					timeZone,
					filters.student_status,
					filters.student_id,
					filters.fromDate,
					filters.toDate,
					filters.roomId === 'All' ? '' : filters.roomId,
					1
				)
					.then(res => {
						setFirstLoad(false);
						setRows(res.data.data);
						setHasMore(res.data.to < res.data.total);
						setPage(res.data.current_page + 1);
						dispatch(
							Actions.showMessage({
								message: 'Report has been generated',
								variant: 'success'
							})
						);
					})
					.catch(err => {
						dispatch(
							Actions.showMessage({
								message: 'Failed to fetch data, please refresh',
								variant: 'error'
							})
						);
					})
					.finally(() => {
						setIsLoading(false);
					});
			},
			firstLoad ? 0 : 1000
		);
		return () => {
			clearTimeout(timeout);
		};
	};

	useEffect(() => {
		getStudents('', allStdPage).then(res => {
			if (!filters.roomId) {
				setStudents([...students, ...res.data.data]);
				if (res.data.current_page < res.data.last_page) {
					setAllStdPage(allStdPage + 1);
				}
			}
		});
	}, [allStdPage]);

	useEffect(() => {
		if (studentPage === 1) {
			return;
		}
		if (filters.roomId) {
			getEventStudent(studentPage, filters.roomId === 'All' ? '' : filters.roomId).then(res => {
				// if (filters.roomId === res?.data?.data[0]?.home_room?.id) {
				setStudents(students.concat(res.data.data));
				if (res.data.current_page < res.data.last_page) {
					setStudentPage(studentPage + 1);
				}
				// }
			});
		}
	}, [studentPage]);

	useEffect(() => {
		if (filters.roomId) {
			getEventStudent(1, filters.roomId === 'All' ? '' : filters.roomId).then(res => {
				// if (filters.roomId === res?.data?.data[0]?.home_room?.id) {
				setStudents(res.data.data);
				if (res.data.current_page < res.data.last_page) {
					setStudentPage(studentPage + 1);
				}
				// }
			});
		}
	}, [filters.roomId]);

	return (
		<FuseAnimate animation="transition.slideLeftIn" duration={600}>
			<div className="mx-auto student-cont">
				<div className="flex items-center justify-between">
					<div className="schoolReport-topdiv">
						<h1 className="">
							{' '}
							<span className="">
								<IconButton
									onClick={() => {
										history.push('/Reports');
									}}
								>
									<img src="assets/images/arrow-long.png" alt="filter" width="24px" className="" />
								</IconButton>
							</span>{' '}
							<span className="text-xl self-end font-bold mr-28">Check In</span>
						</h1>
						<p>Detail data from student when he check in and check out who pick the students</p>
					</div>
					<div className="flex justify-between">
						<div className="flex">
							<div className="self-end ">
								<span>
									{!iisLoading ? (
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
									{/* <div className="help-btn cursor-pointer">
										<img src="assets/images/CENTER.png" />
										Help Center
									</div> */}
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
									<InputLabel id="roomLabel">Room</InputLabel>
									<Select
										name="roomId"
										onChange={handleFilters}
										value={filters.roomId}
										labelId="roomLabel"
										id="roomId"
										label="Room"
										style={{ width: 150 }}
										endAdornment={
											filters.roomId ? (
												<IconButton id="clear-room-filter" size="small" className="mr-16">
													<Close
														onClick={() => {
															setStudents([]);
															setStudentPage(1);
															setAllStdPage(1);
															// setPage(0);
															setDefaultUser(true);
															setFilters({
																...filters,
																roomId: ''
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
										<MenuItem className={`${!filters.room_id && 'hidden'}`} value={0}>
											Clear filter
										</MenuItem>
										<MenuItem value="All">All</MenuItem>
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
								</FormControl>
							</div>
							<div className="mx-8">
								<FormControl>
									<InputLabel id="roomLabel">Status</InputLabel>
									<Select
										name="student_status"
										labelId="student_status"
										id="student_status"
										label="student_status"
										value={filters.student_status}
										onChange={handleFilters}
										style={{ width: 150 }}
										endAdornment={
											filters.student_status ? (
												<IconButton id="clear-room-filter" size="small" className="mr-16">
													<Close
														onClick={() => {
															setDefaultUser(true);
															setFilters({
																...filters,
																student_status: ''
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
										<MenuItem value="1">Active</MenuItem>
										<MenuItem value="0">Inactive</MenuItem>
									</Select>
								</FormControl>
							</div>

							<div className="mx-8">
								<FormControl>
									<InputLabel id="student_id">Student</InputLabel>
									<Select
										name="student_id"
										onChange={handleFilters}
										labelId="student_id"
										id="student_id"
										label="Student"
										value={filters.student_id}
										style={{ width: 150 }}
										endAdornment={
											filters.student_id ? (
												<IconButton id="clear-room-filter" size="small" className="mr-16">
													<Close
														onClick={() => {
															setDefaultUser(true);

															setFilters({
																...filters,
																student_id: ''
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
										{students.length ? (
											students.map(student => {
												return (
													<MenuItem key={student.id} value={student.id}>
														<span
															id={`student-${student.id}`}
														>{`${student.first_name} ${student.last_name}`}</span>
													</MenuItem>
												);
											})
										) : (
											<MenuItem disabled>Loading...</MenuItem>
										)}
									</Select>
								</FormControl>
							</div>
						</div>

						<div className="mx-8">
							<div className="mx-10 student-date-field" style={{ width: '90%' }}>
								<CustomDatePicker
									id="date-from"
									label="Date From"
									value={filters.fromDate}
									setValue={Date => {
										setFilters({ ...filters, fromDate: Date?.format('YYYY-MM-DD') || '' });
									}}
									maxDate={filters.toDate || undefined}
									disableFuture
								/>
							</div>
						</div>
						<div className="mx-8">
							<div className="mr-20 ml-10 student-date-field" style={{ width: '90%' }}>
								<CustomDatePicker
									id="date-to"
									label="Date To"
									value={filters.toDate}
									setValue={Date => {
										setFilters({ ...filters, toDate: Date?.format('YYYY-MM-DD') || '' });
									}}
									minDate={filters.fromDate || undefined}
									disableFuture
								/>
							</div>
						</div>
						<div className="self-end">
							<span>
								<span className="mx-4">
									<CustomButton
										disabled={
											!filters.roomId &&
											!filters.fromDate &&
											!filters.toDate &&
											!filters.student_status &&
											!filters.student_id
										}
										variant="secondary"
										height="43"
										width="140px"
										fontSize="15px"
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
						<div ref={checkInReportRef} className="p-32">
							<div className="flex flex-row justify-between">
								<div>
									<img src="assets/images/logos/logo.png" alt="" />
								</div>
								<div style={{ textAlign: 'right' }}>
									<Typography
										variant="subtitle1"
										style={{
											maxWidth: '220px'
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
								<span>{moment(date).format('dddd, DD MMMM YYYY')}</span>
							</div>
							<div className="pdf-heading">
								<h1 className="font-extrabold">Check In</h1>
							</div>

							<Table stickyHeader className="student-table" style={{ width: '100%' }}>
								<TableHead>
									<TableRow>
										<TableCell style={{ width: '20%' }} className="bg-white studentTableHeader">
											Student
										</TableCell>
										<TableCell style={{ width: '12%' }} className="bg-white studentTableHeader">
											Room
										</TableCell>
										<TableCell style={{ width: '16%' }} className="bg-white studentTableHeader">
											Check In
										</TableCell>
										<TableCell style={{ width: '16%' }} className="bg-white studentTableHeader">
											Check In By
										</TableCell>
										<TableCell style={{ width: '16%' }} className="bg-white studentTableHeader">
											Check Out
										</TableCell>
										<TableCell style={{ width: '18%' }} className="bg-white studentTableHeader">
											Check Out By
										</TableCell>
										<TableCell style={{ width: '8%' }} className="bg-white studentTableHeader">
											Total Hrs
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
												No Student detail
											</TableCell>
										</TableRow>
									) : (
										rows?.map(row => (
											<TableRow key={row.id}>
												<TableCell className="bg-white ">
													<div className="flex flex-col">
														<div className="flex">
															<Avatar
																className="mr-6"
																alt="student-face"
																src={row.student.photo}
															/>
															<div className="flex  items-center justify-content: center">
																<div className="report-std " style={{ width: '70px' }}>
																	{row.student.first_name} {row.student.last_name}
																</div>
															</div>
														</div>
													</div>
												</TableCell>
												<TableCell
													// style={{
													// 	fontSize: '13px',
													// 	maxWidth: '100px',
													// 	fontWeight: 'bold',
													// 	overflow: 'hidden',
													// 	textOverflow: 'ellipsis',
													// 	whiteSpace: 'nowrap'
													// }}
													className="bg-white "
												>
													<div className="flex">
														{/* <Avatar className='mr-6' alt="student-face" src={row.photo} /> */}
														<div className="flex  items-center justify-content: center">
															<div className="report-std " style={{ width: '70px' }}>
																{row.room.name}
															</div>
														</div>
													</div>
												</TableCell>
												<TableCell className="bg-white">
													{/* <div className="flex">
														<div className="flex  items-center justify-content: center">
															<div className="report-std">
																{row?.datetime ? (
																	<>
																		{dayjs(`${row?.datetime}z`).format(
																			'MMMM[ ] D[,] YYYY[,]'
																		)}
																		&nbsp;
																		{moment(row?.datetime?.split('_')[0]).format(
																			'LT'
																		)}
																	</>
																) : (
																	'-'
																)}
															</div>
														</div>
													</div> */}
													<div className="flex flex-col">
														{row?.datetime ? (
															<>
																<div className="report-std">
																	{moment(row?.datetime).format('MM/DD/YY')}
																</div>
																<div
																	className="report-checkin-time"
																	style={{ color: 'gray' }}
																>
																	{moment(row?.datetime).format('hh:mm A')}
																</div>
															</>
														) : (
															'-'
														)}
													</div>
												</TableCell>
												<TableCell className="bg-white">
													<div className="flex">
														<div className="flex  items-center justify-content: center">
															<div className="report-std-email">
																{row?.attendance_role?.email || row?.school?.name}
															</div>
														</div>
													</div>
												</TableCell>
												<TableCell className="bg-white">
													{/* <div className="flex ">
														<div className="flex  items-center justify-content: center ">
															<div className="report-std">
																{row?.checkout ? (
																	<>
																		{dayjs(`${row?.checkout?.datetime}z`).format(
																			'MMMM[ ] D[,] YYYY[,]'
																		)}
																		&nbsp;
																		{moment(
																			row?.checkout?.datetime?.split('_')[0]
																		).format('LT')}
																	</>
																) : (
																	'-'
																)}
															</div>
														</div>
													</div> */}
													<div className="flex flex-col">
														{row?.checkout ? (
															<>
																<div className="report-std">
																	{moment(row?.checkout?.datetime).format('MM/DD/YY')}
																</div>
																<div
																	className="report-checkin-time"
																	style={{ color: 'gray' }}
																>
																	{moment(row?.checkout?.datetime).format('hh:mm A')}
																</div>
															</>
														) : (
															'-'
														)}
													</div>
												</TableCell>
												<TableCell
													// style={{
													// 	fontSize: '13px',
													// 	maxWidth: '100px',
													// 	fontWeight: 'bold',
													// 	overflow: 'hidden',
													// 	textOverflow: 'ellipsis',
													// 	whiteSpace: 'nowrap'
													// }}
													className="bg-white "
												>
													<div className="flex">
														<div className="flex  items-center justify-content: center">
															<div
																className="report-std-email"
																// style={{ width: '85px' }}
															>
																{row?.checkout
																	? row?.checkout.attendance_role?.email
																	: '-'}
															</div>
														</div>
													</div>
												</TableCell>

												<TableCell
													style={{
														fontSize: '13px',
														maxWidth: '100px',
														fontWeight: 'bold',
														overflow: 'hidden',
														textOverflow: 'ellipsis',
														whiteSpace: 'nowrap'
													}}
													className="bg-white truncate"
												>
													<div className="flex">
														<div className="flex  items-center justify-content: center">
															<div className="report-std truncate email-width">
																{row?.checkout ? row?.total_hours : '-'}
															</div>
														</div>
													</div>
												</TableCell>
											</TableRow>
										))
									)}
									{/* {fetchingMore ? (
										<TableRow>
											<TableCell align="center" colSpan={8}>
												<CircularProgress size={35} />
											</TableCell>
										</TableRow>
									) : (
										<></>
									)} */}
								</TableBody>
							</Table>
						</div>
					</div>

					<Table stickyHeader className="student-table" style={{ width: '100%' }}>
						<TableHead>
							<TableRow>
								<TableCell style={{ width: '20%' }} className="bg-white studentTableHeader">
									Student
								</TableCell>
								<TableCell style={{ width: '12%' }} className="bg-white studentTableHeader">
									Room
								</TableCell>
								<TableCell style={{ width: '10%' }} className="bg-white studentTableHeader">
									Check In
								</TableCell>
								<TableCell style={{ width: '16%' }} className="bg-white studentTableHeader">
									Check In By
								</TableCell>
								<TableCell style={{ width: '10%' }} className="bg-white studentTableHeader">
									Check Out
								</TableCell>
								<TableCell style={{ width: '16%' }} className="bg-white studentTableHeader">
									Check Out By
								</TableCell>
								<TableCell style={{ width: '8%' }} className="bg-white studentTableHeader">
									Total Hrs
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
										No record found
									</TableCell>
								</TableRow>
							) : (
								rows?.map(row => (
									<TableRow key={row.id}>
										<TableCell
											style={{
												fontSize: '13px',
												maxWidth: '100px',
												fontWeight: 'bold',
												overflow: 'hidden',
												textOverflow: 'ellipsis',
												whiteSpace: 'nowrap'
											}}
											className="bg-white truncate"
										>
											<div className="flex flex-col">
												<div className="flex">
													<Avatar
														className="mr-6"
														alt="student-face"
														src={row.student.photo}
													/>
													<div className="flex  items-center justify-content: center">
														<div className="report-std truncate width-name">
															{row.student.first_name} {row.student.last_name}
														</div>
													</div>
												</div>
											</div>
										</TableCell>
										<TableCell
											// style={{
											// 	fontSize: '13px',
											// 	maxWidth: '100px',
											// 	fontWeight: 'bold',
											// 	overflow: 'hidden',
											// 	textOverflow: 'ellipsis',
											// 	whiteSpace: 'nowrap'
											// }}
											className="bg-white "
										>
											<div className="flex">
												{/* <Avatar className='mr-6' alt="student-face" src={row.photo} /> */}
												<div className="flex  items-center justify-content: center">
													<div className="report-std ">{row.room.name}</div>
												</div>
											</div>
										</TableCell>
										<TableCell
											// style={{
											// 	fontSize: '13px',
											// 	maxWidth: '100px',
											// 	fontWeight: 'bold',
											// 	overflow: 'hidden',
											// 	textOverflow: 'ellipsis',
											// 	whiteSpace: 'nowrap'
											// }}
											className="bg-white "
										>
											{/* <div className="flex">
												<div className="flex  items-center justify-content: center">
													<div className="report-std ">
														{row?.datetime ? (
															<>
																{dayjs(`${row?.datetime}z`).format(
																	'MMMM[ ] D[,] YYYY[,]'
																)}
																&nbsp;
																{moment(row?.datetime?.split('_')[0]).format('LT')}
															</>
														) : (
															'-'
														)}
													</div>
												</div>
											</div> */}
											<div className="flex flex-col">
												{row?.datetime ? (
													<>
														<div className="report-std">
															{moment(row?.datetime).format('MM/DD/YY')}
														</div>
														<div className="report-checkin-time" style={{ color: 'gray' }}>
															{moment(row?.datetime).format('hh:mm A')}
														</div>
													</>
												) : (
													'-'
												)}
											</div>
										</TableCell>
										<TableCell
											// style={{
											// 	fontSize: '13px',
											// 	maxWidth: '100px',
											// 	fontWeight: 'bold',
											// 	overflow: 'hidden',
											// 	textOverflow: 'ellipsis',
											// 	whiteSpace: 'nowrap'
											// }}
											className="bg-white "
										>
											<div className="flex">
												<div className="flex  items-center justify-content: center">
													<div className="report-std-email  email-width">
														{row?.attendance_role?.email || row?.school?.name}
													</div>
												</div>
											</div>
										</TableCell>
										<TableCell
											// style={{
											// 	fontSize: '13px',
											// 	maxWidth: '100px',
											// 	fontWeight: 'bold',
											// 	overflow: 'hidden',
											// 	textOverflow: 'ellipsis',
											// 	whiteSpace: 'nowrap'
											// }}
											className="bg-white "
										>
											{/* <div className="flex ">
												<div className="flex  items-center justify-content: center ">
													<div className="report-std ">
														{row?.checkout ? (
															<>
																{dayjs(`${row?.checkout?.datetime}z`).format(
																	'MMMM[ ] D[,] YYYY[,]'
																)}
																&nbsp;
																{moment(row?.checkout?.datetime?.split('_')[0]).format(
																	'LT'
																)}
															</>
														) : (
															'-'
														)}
													</div>
												</div>
											</div> */}
											<div className="flex flex-col">
												{row?.checkout ? (
													<>
														<div className="report-std">
															{moment(row?.checkout?.datetime).format('MM/DD/YY')}
														</div>
														<div className="report-checkin-time" style={{ color: 'gray' }}>
															{moment(row?.checkout?.datetime).format('hh:mm A')}
														</div>
													</>
												) : (
													'-'
												)}
											</div>
										</TableCell>
										<TableCell
											// style={{
											// 	fontSize: '13px',
											// 	maxWidth: '100px',
											// 	fontWeight: 'bold',
											// 	overflow: 'hidden',
											// 	textOverflow: 'ellipsis',
											// 	whiteSpace: 'nowrap'
											// }}
											className="bg-white "
										>
											<div className="flex">
												<div className="flex  items-center justify-content: center">
													<div className="report-std-email email-width">
														{/* {row.attendance_role.email ? row.attendance_role.email : '-'} */}
														{row?.checkout ? row?.checkout.attendance_role?.email : '-'}
													</div>
												</div>
											</div>
										</TableCell>

										<TableCell
											style={{
												fontSize: '13px',
												maxWidth: '100px',
												fontWeight: 'bold',
												overflow: 'hidden',
												textOverflow: 'ellipsis',
												whiteSpace: 'nowrap'
											}}
											className="bg-white truncate"
										>
											<div className="flex">
												<div className="flex  items-center justify-content: center">
													<div className="report-std truncate email-width">
														{row?.checkout ? row?.total_hours : '-'}
													</div>
												</div>
											</div>
										</TableCell>
									</TableRow>
								))
							)}
							{fetchingMore ? (
								<TableRow>
									<TableCell align="center" colSpan={8}>
										<CircularProgress size={35} />
									</TableCell>
								</TableRow>
							) : (
								<></>
							)}
						</TableBody>
					</Table>
				</TableContainer>
				<InfiniteScroll
					dataLength={rows?.length}
					next={handleLoadMore}
					hasMore={hasMore}
					scrollableTarget="Scrollable-table"
				/>
			</div>
		</FuseAnimate>
	);
}
export default Checkin;
