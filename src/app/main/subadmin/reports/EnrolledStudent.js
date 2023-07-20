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
	Typography,
	TextField,
	InputAdornment
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
import { getEnrolledStudents, getRooms } from 'app/services/reports/reports';
import { Close } from '@material-ui/icons';
import { useReactToPrint } from 'react-to-print';
import InfiniteScroll from 'react-infinite-scroll-component';
import dayjs from 'dayjs';
import { generateAgeString } from 'utils/utils';

export default function EnrolledStudent() {
	const dispatch = useDispatch();
	const user = useSelector(({ auth }) => auth.user);
	const [rows, setRows] = useState([]);
	const [isLoading, setIsLoading] = useState(false);
	const [firstLoad, setFirstLoad] = useState(true);
	const [fetchingMore, setFetchingMore] = useState(false);
	const [hasMore, setHasMore] = useState(false);
	const enrolledStudentRef = useRef(null);
	const [page, setPage] = useState(1);
	const [filters, setFilters] = useState({
		school_id: user?.school?.id || user?.data?.school?.id,
		name: '',
		room_id: '',
		status: '',
		date_from: '',
		date_to: ''
	});

	const [rooms, setRooms] = useState([]);
	const date = new Date();
	const [roomPage, setRoomPage] = useState(1);
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

	const handleLoadMore = () => {
		setFetchingMore(true);
		getEnrolledStudents(
			0,
			filters.name,
			filters.school_id,
			filters.room_id === 'All' ? '' : filters.room_id,
			filters.status,
			filters.date_from,
			filters.date_to,
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
		setIsLoadingExport(true);
		getEnrolledStudents(
			1,
			filters.name,
			filters.school_id,
			filters.room_id === 'All' ? '' : filters.room_id,
			filters.status,
			filters.date_from,
			filters.date_to
		)
			.then(res => {
				const blob = new Blob([res.data], {
					type: 'text/csv'
				});
				const link = document.createElement('a');
				link.setAttribute('target', '_blank');
				link.href = window.URL.createObjectURL(blob);
				link.setAttribute('download', `StudentEnrollment_report_${new Date().getTime()}.csv`);
				document.body.appendChild(link);
				link.click();
				// Clean up and remove the link
				link.parentNode.removeChild(link);
				setIsLoadingExport(false);
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

	const ApplyFilters = () => {
		setRows([]);
		setIsLoading(true);
		setFirstLoad(false);
		const timeout = setTimeout(
			() => {
				getEnrolledStudents(
					0,
					filters.name,
					filters.school_id,
					filters.room_id === 'All' ? '' : filters.room_id,
					filters.status,
					filters.date_from,
					filters.date_to,
					1
				)
					.then(res => {
						setFirstLoad(false);
						setRows(res.data.data);
						if (res.data.last_page > res.data.current_page) {
							setHasMore(true);
						} else {
							setHasMore(false);
						}
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
		setPage(1);
		return () => {
			clearTimeout(timeout);
		};
	};

	const handlePrint = useReactToPrint({
		content: () => enrolledStudentRef.current
	});

	const handleFilters = ev => {
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
							<span className="text-xl self-end font-bold mr-28">Enrolled Students</span>
						</h1>
						<p>Detailed data of Enrolled student information</p>
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
								<TextField
									className="mr-10"
									onChange={handleFilters}
									id="search-input"
									name="name"
									value={filters.name}
									label="Search by Student"
									style={{ width: 160 }}
									InputProps={{
										endAdornment: (
											<InputAdornment>
												<IconButton
													id="search-icon"
													onClick={() => {
														document.getElementById('search-input').focus();
													}}
												>
													<img
														alt="search-icon"
														src="assets/images/search-icon.svg"
														height="80%"
														width="80%"
													/>
												</IconButton>
											</InputAdornment>
										)
									}}
								/>
							</div>
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
										style={{ width: 120 }}
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
									<InputLabel id="status">Status</InputLabel>
									<Select
										name="status"
										labelId="status"
										id="status"
										label="Filter By Status"
										value={filters.status}
										onChange={handleFilters}
										style={{ width: 120 }}
										endAdornment={
											filters.status ? (
												<IconButton id="clear-room-filter" size="small" className="mr-16">
													<Close
														onClick={() => {
															setFilters({
																...filters,
																status: ''
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
							<div className="mx-10 student-date-field" style={{ width: 125 }}>
								<CustomDatePicker
									id="date-from"
									label="Date From"
									value={filters.date_from}
									setValue={Date => {
										setFilters({ ...filters, date_from: Date?.format('YYYY-MM-DD') || '' });
									}}
									maxDate={filters.date_to || undefined}
									disableFuture
								/>
							</div>
							<div className="mr-20 ml-10 student-date-field" style={{ width: 125 }}>
								<CustomDatePicker
									id="date-to"
									label="Date To"
									value={filters.date_to}
									setValue={Date => {
										setFilters({ ...filters, date_to: Date?.format('YYYY-MM-DD') || '' });
									}}
									minDate={filters.date_from || undefined}
									disableFuture
								/>
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
											!filters.name &&
											!filters.room_id &&
											!filters.status &&
											!filters.date_from &&
											!filters.date_to
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
						<div ref={enrolledStudentRef} className="p-32">
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
								<h1 className="font-extrabold">Enrolled Students</h1>
							</div>

							<Table stickyHeader className="enrolledtudent-table" style={{ width: '100%' }}>
								<TableHead>
									<TableRow>
										<TableCell style={{ width: '25%' }} className="bg-white studentTableHeader">
											Student
										</TableCell>
										<TableCell style={{ width: '30%' }} className="bg-white studentTableHeader">
											Parent
										</TableCell>
										<TableCell style={{ width: '20%' }} className="bg-white studentTableHeader">
											Contact Info
										</TableCell>
										<TableCell style={{ width: '20%' }} className="bg-white studentTableHeader">
											Status
										</TableCell>
										<TableCell style={{ width: '20%' }} className="bg-white studentTableHeader">
											Enrollment Date And Time
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
												No Record Found
											</TableCell>
										</TableRow>
									) : (
										rows?.map(row => {
											return (
												<TableRow key={row?.id}>
													<TableCell>
														<div className="flex">
															<Avatar className="mr-6" alt="student-face" src={row?.photo} />
															<div className="flex-col items-start">
																<div className="student-homeroom break-word">
																	{row?.home_room?.name}
																</div>
																<div className="student-name break-word">
																	{row?.first_name} {row?.last_name}
																</div>
																<div className="student-age-font " style={{ width: '90px' }}>
																	{generateAgeString(row.date_of_birth)}
																</div>
															</div>
														</div>
													</TableCell>
													<TableCell>
														<div className="flex items-center parent-column">
															<Avatar
																className="mr-6"
																alt="parent-face"
																src={row?.contacts[0]?.photo}
															/>
															<div className="flex-col ">
																<div className="parent-name break-word">
																	{row?.contacts[0]?.first_name}{' '}
																	{row?.contacts[0]?.last_name}
																</div>
																<div className="parent-relation">
																	{row?.contacts[0]?.relation_with_child}
																</div>
															</div>
														</div>
													</TableCell>
													<TableCell>
														<div className="flex-col">
															<div className="contact-email break-word">
																{row?.contacts[0]?.email}
															</div>
															<div className="contact-phone">{row?.contacts[0]?.phone}</div>
														</div>
													</TableCell>
													<TableCell>
														<div className={row.status ? 'active-label' : 'disable-label'}>
															{row.status ? 'Active' : 'Inactive'}
														</div>
													</TableCell>
													<TableCell>
														<div className="flex-col">
															<div className="enroll-date">
																{moment
																	.utc(row?.created_at)
																	.local()
																	.format('L')}
															</div>
															<div className="student-enroll-date">
																{moment
																	.utc(row?.created_at)
																	.local()
																	.format('LT')}
															</div>
														</div>
													</TableCell>
												</TableRow>
											);
										})
									)}
								</TableBody>
							</Table>
						</div>
					</div>
					<Table stickyHeader className="enrolledtudent-table" style={{ width: '100%' }}>
						<TableHead>
							<TableRow>
								<TableCell style={{ width: '20%' }} className="bg-white studentTableHeader">
									Student
								</TableCell>
								<TableCell style={{ width: '20%' }} className="bg-white studentTableHeader">
									Parent
								</TableCell>
								<TableCell style={{ width: '20%' }} className="bg-white studentTableHeader">
									Contact Info
								</TableCell>
								<TableCell style={{ width: '20%' }} className="bg-white studentTableHeader">
									Status
								</TableCell>
								<TableCell style={{ width: '20%' }} className="bg-white studentTableHeader">
									Enrollment Date And Time
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
										No Record Found
									</TableCell>
								</TableRow>
							) : (
								rows?.map(row => {
									return (
										<TableRow key={row?.id}>
											<TableCell>
												<div className="flex">
													<Avatar className="mr-6" alt="student-face" src={row?.photo} />
													<div className="flex-col items-start">
														<div className="student-homeroom break-word">
															{row?.home_room?.name}
														</div>
														<div className="student-name break-word">
															{row?.first_name} {row?.last_name}
														</div>
														<div className="student-age-font " style={{ width: '90px' }}>
															{generateAgeString(row.date_of_birth)}
														</div>
													</div>
												</div>
											</TableCell>
										<TableCell>
											<div className="flex items-center parent-column">
												<Avatar
													className="mr-6"
													alt="parent-face"
													src={row?.contacts[0]?.photo}
												/>
												<div className="flex-col ">
													<div className="parent-name break-word">
														{row?.contacts[0]?.first_name} {row?.contacts[0]?.last_name}
													</div>
													<div className="parent-relation">
														{row?.contacts[0]?.relation_with_child}
													</div>
												</div>
											</div>
										</TableCell>
										<TableCell>
											<div className="flex-col">
												<div className="contact-email break-word">{row?.contacts[0]?.email}</div>
												<div className="contact-phone">{row?.contacts[0]?.phone}</div>
											</div>
										</TableCell>
										<TableCell>
											<div className={row.status ? 'active-label' : 'disable-label'}>
												{row.status ? 'Active' : 'Inactive'}
											</div>
										</TableCell>
										<TableCell>
											<div className="flex-col">
												<div className="enroll-date">
													{moment
														.utc(row?.created_at)
														.local()
														.format('L')}
												</div>
												<div className="student-enroll-date">
													{moment
														.utc(row?.created_at)
														.local()
														.format('LT')}
												</div>
											</div>
										</TableCell>
									</TableRow>
									);
								})
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
