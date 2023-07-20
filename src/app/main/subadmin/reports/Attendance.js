/* eslint-disable jsx-a11y/anchor-is-valid */
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
	InputLabel,
	MenuItem,
	FormControl,
	Avatar,
	Typography
} from '@material-ui/core';
import Select from '@material-ui/core/Select';
import Close from '@material-ui/icons/Close';
import { getAttendanceReport, getStudents } from 'app/services/reports/reports';
import FuseAnimate from '@fuse/core/FuseAnimate';
import { useDispatch, useSelector } from 'react-redux';
import * as Actions from 'app/store/actions';
import CustomButton from 'app/customComponents/CustomButton/CustomButton';
import { getRooms } from 'app/services/reports/reports';
import './Reports.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload } from '@fortawesome/free-solid-svg-icons';
import CustomDatePicker from 'app/customComponents/CustomDatePicker/CustomDatePicker';
import dayjs from 'dayjs';
import { getEventStudent } from 'app/services/events/events';
import axios from 'axios';
import moment from 'moment';
import { useReactToPrint } from 'react-to-print';
import InfiniteScroll from 'react-infinite-scroll-component';

function Attendance() {
	const dispatch = useDispatch();
	const user = useSelector(({ auth }) => auth.user);
	const [rows, setRows] = useState([]);
	const [isLoading, setIsLoading] = useState(false);
	const [firstLoad, setFirstLoad] = useState(true);
	const [fetchingMore, setFetchingMore] = useState(false);
	const [filters, setFilters] = useState({
		export_id: 0,
		default: true,
		room_id: '',
		student_id: '',
		student_status: '',
		start_date: '',
		end_date: ''
	});
	const [rooms, setRooms] = useState([]);
	const [page, setPage] = useState(1);
	const [roomPage, setRoomPage] = useState(1);
	const [students, setStudents] = useState([]);
	const [studentPage, setStudentPage] = useState(1);
	const [allStdPage, setAllStdPage] = useState(1);
	const attendanceReportRef = useRef(null);
	const [date, setDate] = useState(new Date());
	const [defaultUser, setDefaultUser] = useState(false);
	const [hasMore, setHasMore] = useState(false);
	const [refresh, setRefresh] = useState(false);
	const [isLoadingExport, setIsLoadingExport] = useState(false);

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

	useEffect(() => {
		getStudents('', allStdPage).then(res => {
			if (!filters.room_id) {
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
		if (filters.room_id) {
			getEventStudent(studentPage, filters.room_id === 'All' ? '' : filters.room_id).then(res => {
				// if (filters.room_id === res?.data?.data[0]?.home_room?.id) {
				setStudents(students.concat(res.data.data));
				if (res.data.current_page < res.data.last_page) {
					setStudentPage(studentPage + 1);
				}
				// }
			});
		}
	}, [studentPage]);

	useEffect(() => {
		if (filters.room_id) {
			getEventStudent(1, filters.room_id === 'All' ? '' : filters.room_id).then(res => {
				// if (filters.room_id === res?.data?.data[0]?.home_room?.id) {
				setStudents(res.data.data);
				if (res.data.current_page < res.data.last_page) {
					setStudentPage(studentPage + 1);
				}
				// }
			});
		}
	}, [filters.room_id]);

	// useEffect(() => {
	// 	const timeout = setTimeout(
	// 		() => {
	// 			setFetchingMore(true);
	// 			getAttendanceReport(
	// 				filters.export_id,
	// 				filters.default,
	// 				filters.room_id,
	// 				filters.student_id,
	// 				filters.student_status,
	// 				filters.start_date,
	// 				filters.end_date,
	// 				1
	// 			)
	// 				.then(res => {
	// 					setFirstLoad(false);
	// 					setRows(res.data.data, ...res.data.data.map(v => ({ ...v, viewAll: false })));
	// 					setHasMore(res.data.to < res.data.total);
	// 					setPage(res.data.current_page + 1);
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
	// 	return () => {
	// 		clearTimeout(timeout);
	// 	};
	// 	// eslint-disable-next-line
	// }, [refresh]);

	const handleLoadMore = () => {
		setFetchingMore(true);
		getAttendanceReport(
			filters.export_id,
			filters.default,
			filters.room_id === 'All' ? '' : filters.room_id,
			filters.student_id,
			filters.student_status,
			filters.start_date,
			filters.end_date,
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

	const handleFilters = ev => {
		const { name, value } = ev.target;
		setFilters({ ...filters, [name]: value });
		if (name === 'room_id') {
			setStudents([]);
			setStudentPage(1);
		}
		setDefaultUser(false);
	};

	const ApplyFilters = () => {
		setRows([]);
		setIsLoading(true);
		setFirstLoad(false);
		const timeout = setTimeout(
			() => {
				setIsLoading(true);
				getAttendanceReport(
					filters.export_id,
					defaultUser,
					filters.room_id === 'All' ? '' : filters.room_id,
					filters.student_id,
					filters.student_status,
					filters.start_date,
					filters.end_date,
					1
				)
					.then(res => {
						setRows(res.data.data, ...res.data.data.map(v => ({ ...v, viewAll: false })));
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

	const handleExport = () => {
		setIsLoadingExport(true);
		getAttendanceReport(
			1,
			filters.default,
			filters.room_id === 'All' ? '' : filters.room_id,
			filters.student_id,
			filters.student_status,
			filters.start_date,
			filters.end_date,
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
					setIsLoadingExport(false);
				});
			})
			.catch(err => {
				dispatch(
					Actions.showMessage({
						message: 'Failed to Export',
						variant: 'error'
					})
				);
				setIsLoadingExport(false);
			})
			.finally(() => {
				setIsLoadingExport(false);
			});
	};

	const handlePrint = useReactToPrint({
		content: () => attendanceReportRef.current
	});

	return (
		<FuseAnimate animation="transition.slideLeftIn" duration={600}>
			<div className="mx-auto student-cont">
				<div className="flex items-center flex-nowrap justify-between">
					<div className="schoolReport-topdiv">
						<h1 className="text-2xl self-end font-extrabold mr-28">
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
							<span className="text-xl self-end font-bold mr-28">Daily Attendance Summary</span>
						</h1>
						<p>Understand how many days students were present in select date range</p>
					</div>
					<div className="flex justify-between">
						<div className="flex">
							<div className="self-end">
								<span>
									{!isLoadingExport ? (
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
										variant="secondary"
										height="40px"
										width="100px"
										onClick={() => handlePrint()}
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
									<InputLabel id="roomLabel">Room</InputLabel>
									<Select
										name="room_id"
										onChange={handleFilters}
										value={filters.room_id}
										labelId="roomLabel"
										id="room_id"
										label="Room"
										style={{ width: 150 }}
										endAdornment={
											filters.room_id ? (
												<IconButton id="clear-room-filter" size="small" className="mr-16">
													<Close
														onClick={() => {
															setStudents([]);
															setStudentPage(1);
															setAllStdPage(1);
															setDefaultUser(true);
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
												<IconButton size="small" className="mr-16">
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
									id="start_date"
									label="Date From"
									value={filters.start_date}
									setValue={d => {
										setFilters({ ...filters, start_date: d?.format('YYYY-MM-DD') || '' });
									}}
									maxDate={filters.end_date || undefined}
									disableFuture
								/>
							</div>
						</div>
						<div className="mx-8">
							<div className="mr-20 ml-10 student-date-field" style={{ width: '90%' }}>
								<CustomDatePicker
									id="end_date"
									label="Date To"
									value={filters.end_date}
									setValue={d => {
										setFilters({ ...filters, end_date: d?.format('YYYY-MM-DD') || '' });
									}}
									minDate={filters.start_date || undefined}
									disableFuture
								/>
							</div>
						</div>
						<div className="self-end">
							<span>
								<span className="mx-4">
									<CustomButton
										disabled={
											!filters.room_id &&
											!filters.start_date &&
											!filters.end_date &&
											!filters.student_status &&
											!filters.student_id
										}
										variant="secondary"
										height="40px"
										width="100px"
										id="submit-roster-btn"
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
				<TableContainer id="Scrollable-table" component={Paper} className="student-table-cont">
					<div style={{ display: 'none' }}>
						<div ref={attendanceReportRef} className="p-32">
							<div className="flex flex-row justify-between">
								<div>
									<img src="assets/images/logos/logo.png" />
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
								<h1 className="font-extrabold">Daily Attendance Summary</h1>
							</div>
							<Table stickyHeader className="student-table" style={{ width: '100%' }}>
								<TableHead>
									<TableRow>
										<TableCell
											align="left"
											style={{ width: '30%' }}
											className="bg-white attendanceReportHeader"
										>
											Student
										</TableCell>
										<TableCell
											align="left"
											style={{ width: '50%' }}
											className="bg-white attendanceReportHeader"
										>
											Total days present in any Room
										</TableCell>
										<TableCell
											align="left"
											style={{ width: '30%' }}
											className="bg-white attendanceReportHeader"
										>
											Days Attended
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
												No Record
											</TableCell>
										</TableRow>
									) : (
										rows?.map(row => (
											<TableRow key={row.id}>
												<TableCell style={{ fontWeight: 700 }} component="th" scope="row">
													<div className="flex">
														<Avatar
															className="mr-6"
															alt="student-face"
															src={row?.student ? row?.student?.photo : row?.photo}
														/>
														<div className="flex  items-center justify-content: center">
															<div className="report-std truncate">
																{row?.student
																	? row?.student?.first_name
																	: row?.first_name}{' '}
																{row?.student
																	? row?.student?.last_name
																	: row?.last_name}
															</div>
														</div>
													</div>
												</TableCell>
												<TableCell align="left">
													<div style={{ fontSize: 12, fontWeight: '700' }}>
														{row.checkin_default_rooms.length +
															row.checkin_other_rooms.length}
													</div>
												</TableCell>
												<TableCell align="left">
													<div style={{ fontSize: 12, fontWeight: '700' }}>
														{row.checkin_default_rooms
															.map(item => item.date_time.split(' ')[0])
															.concat(
																row.checkin_other_rooms.map(
																	item => item.date_time.split(' ')[0]
																)
															)
															.sort()
															.map((r, i, a) => (
																<div key={i} className="flex flex-col">
																	{a.length
																		? moment
																				.utc(r)
																				.local()
																				.format('L')
																		: '-'}
																</div>
															))}
														{row.checkin_default_rooms.length +
															row.checkin_other_rooms.length >
														0
															? ''
															: '---'}
													</div>
												</TableCell>
											</TableRow>
										))
									)}
								</TableBody>
							</Table>
						</div>
					</div>
					<Table stickyHeader className="student-table" style={{ width: '100%' }}>
						<TableHead>
							<TableRow>
								<TableCell
									align="left"
									style={{ width: '30%' }}
									className="bg-white attendanceReportHeader"
								>
									Student
								</TableCell>
								<TableCell
									align="left"
									style={{ width: '50%' }}
									className="bg-white attendanceReportHeader"
								>
									Total days present in any Room
								</TableCell>
								<TableCell
									align="left"
									style={{ width: '30%' }}
									className="bg-white attendanceReportHeader"
								>
									Days Attended
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
								rows?.map((row, rowIndex) => (
									<TableRow key={row.id}>
										<TableCell style={{ fontWeight: 700 }} component="th" scope="row">
											<div className="flex">
												<Avatar
													className="mr-6"
													alt="student-face"
													src={row?.student ? row?.student?.photo : row?.photo}
												/>
												<div className="flex  items-center justify-content: center">
													<div className="report-std truncate">
														{row?.student ? row?.student?.first_name : row?.first_name}{' '}
														{row?.student ? row?.student?.last_name : row?.last_name}
													</div>
												</div>
											</div>
										</TableCell>
										<TableCell align="left">
											<div style={{ fontSize: 12, fontWeight: '700' }}>
												{row.checkin_default_rooms.length + row.checkin_other_rooms.length}
											</div>
										</TableCell>
										<TableCell align="left">
											<div style={{ fontSize: 12, fontWeight: '700' }}>
												{row.checkin_default_rooms
													.map(item => item.date_time.split(' ')[0])
													.concat(
														row.checkin_other_rooms.map(
															item => item.date_time.split(' ')[0]
														)
													)
													.sort().length > 3 && !row.viewAll ? (
													<>
														{row.checkin_default_rooms
															.map(item => item.date_time.split(' ')[0])
															.concat(
																row.checkin_other_rooms.map(
																	item => item.date_time.split(' ')[0]
																)
															)
															.sort()
															?.slice(0, 3)
															.map((r, i) => (
																<div key={i} className="flex flex-col">
																	{moment
																		.utc(r)
																		.local()
																		.format('L')}
																</div>
															))}
														<a
															className="cursor-pointer"
															onClick={() => {
																const newData = [...rows];
																newData[rowIndex].viewAll = true;
																setRows(newData);
															}}
														>
															View All
														</a>
													</>
												) : (
													row.checkin_default_rooms
														.map(item => item.date_time.split(' ')[0])
														.concat(
															row.checkin_other_rooms.map(
																item => item.date_time.split(' ')[0]
															)
														)
														.sort()
														.map((r, i, a) => (
															<div key={i} className="flex flex-col">
																{a.length
																	? moment
																			.utc(r)
																			.local()
																			.format('L')
																	: '-'}
															</div>
														))
												)}
												{row.checkin_default_rooms.length + row.checkin_other_rooms.length > 0
													? ''
													: '---'}
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
					dataLength={rows.length}
					next={handleLoadMore}
					hasMore={hasMore}
					scrollableTarget="Scrollable-table"
				/>
			</div>
		</FuseAnimate>
	);
}
export default Attendance;
