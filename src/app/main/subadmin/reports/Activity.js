/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
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
	makeStyles,
} from '@material-ui/core';
import FuseAnimate from '@fuse/core/FuseAnimate';
import { useDispatch } from 'react-redux';
import * as Actions from 'app/store/actions';
import InfiniteScroll from 'react-infinite-scroll-component';
import CustomButton from 'app/customComponents/CustomButton/CustomButton';
import { getActivities, getStudents, getStudentActivityReport } from 'app/services/reports/reports';
import dayjs from 'dayjs';
import './Reports.css';
import CustomDatePicker from 'app/customComponents/CustomDatePicker/CustomDatePicker';
import { getEventStudent } from 'app/services/events/events';
import axios from 'axios';
import { getAllRooms } from 'app/services/rooms/rooms';
import { Close, Check } from '@material-ui/icons';
import momentTime from 'moment-timezone';
import MediaRenderer from './MediaRenderer';
import ViewActivity from './ViewActivity';

const useStyles = makeStyles({
	table: {
		minWidth: 650,
	},
	studentColSticky: {
		position: 'sticky',
		left: 0,
		background: 'white',
	},
	statusColSticky: {
		position: 'sticky',
		right: 112,
		background: 'white',
	},
	reportColSticky: {
		position: 'sticky',
		right: 0,
		background: 'white',
	},
	activityColSticky: {
		position: 'sticky',
		left: 253,
		background: 'white',
	},
});
function Activity() {
	const classes = useStyles();
	const dispatch = useDispatch();
	const [isLoading, setIsLoading] = useState(false);
	const [hasMore, setHasMore] = useState(false);
	const [firstLoad, setFirstLoad] = useState(true);
	const [fetchingMore, setFetchingMore] = useState(false);
	const [activeStudent, setActiveStudent] = useState(null);
	const [page, setPage] = useState(1);
	const [data, setData] = useState('');
	const [activitiesList, setActivitiesList] = useState([]);
	const [studentActivity, setStudentActivity] = useState({});
	const pdfRef = useRef(null);
	const [filters, setFilters] = useState({
		room: history?.location?.state?.room || '',
		student_status: '',
		date: history?.location?.state?.date || '',
	});
	const [rooms, setRooms] = useState([]);

	const timeZone = momentTime.tz.guess();
	const getStudentActivity = (currentUser) => {
		getStudentActivityReport(currentUser?.id, filters.date)
			.then((response) => {
				setStudentActivity(response?.data[0]);
				dispatch(
					Actions.openDialog({
						children: (
							<ViewActivity
								student={currentUser}
								studentActivity={response?.data[0]}
								loader={false}
								pdfRef={pdfRef}
								date={filters.date}
							/>
						),
					})
				);
			})
			.catch((error) => {
				dispatch(Actions.showMessage({ message: error.message }));
			});
	};
	const handleFilters = (ev) => {
		const { name, value } = ev.target;
		setFilters({ ...filters, [name]: value });
	};
	const handleLoadMore = () => {
		setFetchingMore(true);
		getActivities({ ...filters, timezone_offset: timeZone }, page)
			.then((res) => {
				if (isLoading) {
					return 'loading';
				}
				if (res.data.last_page > res.data.current_page) {
					setHasMore(true);
				} else {
					setHasMore(false);
				}
				setPage(res.data.current_page + 1);
				setData(data.concat(res.data.data));
				setFetchingMore(false);
			})
			.catch((err) => {
				setFetchingMore(false);
				dispatch(
					Actions.showMessage({
						message: 'Failed to fetch data, please refresh',
						variant: 'error',
					})
				);
			});
	};

	useEffect(() => {
		let mounted = true;
		axios.get(`/api/v1/school/activities`).then((res) => {
			if (mounted) {
				setActivitiesList(res.data.data);
			}
		});
		getAllRooms().then((res) => {
			if (mounted) {
				setRooms(res.data);
			}
		});
		if (filters.room && filters.date) {
			ApplyFilters();
		}
		return () => {
			mounted = false;
		};
	}, []);

	const ApplyFilters = () => {
		setData([]);
		setIsLoading(true);
		setFirstLoad(false);
		getActivities({ ...filters, timezone_offset: timeZone }, 1)
			.then((res) => {
				setFirstLoad(false);
				setData(res.data.data);
				setHasMore(res.data.to < res.data.total);
				setPage(res.data.current_page + 1);
				dispatch(
					Actions.showMessage({
						message: 'Report has been generated',
						variant: 'success',
					})
				);
			})
			.catch((err) => {
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

	const dialogueopen = (student) => {
		// setToggle(true);
		setActiveStudent(student);
		dispatch(
			Actions.openDialog({
				children: (
					<div className="p-8">
						<CircularProgress size={30} />
					</div>
				),
			})
		);
		getStudentActivity(student);
	};

	return (
		<>
			<FuseAnimate animation="transition.slideLeftIn" duration={600}>
				<div className="mx-auto student-cont">
					<div className="flex items-center flex-nowrap justify-between">
						<div className="schoolReport-topdiv">
							<h1 className="text-2xl self-end font-extrabold mr-28">
								{' '}
								<span className="mr-7 icon-color">
									<IconButton
										onClick={() => {
											history.push('/Reports');
										}}
									>
										<img
											src="assets/images/arrow-long.png"
											alt="filter"
											width="24px"
											className="fiterimg"
										/>
									</IconButton>
								</span>
								<span className="text-xl self-end font-bold mr-28">Activity</span>
							</h1>
							<p>Activity logged by classroom or daily report of activities logged across classroom</p>
						</div>
						{/* <div className="flex justify-between">
						<div className="flex">
							<div className="self-end btn-mar">
								<span>
									<div className="help-btn cursor-pointer">
										<i className="fa fa-question-circle" aria-hidden="true" /> Help Center
									</div>
								</span>
							</div>
						</div>
					</div> */}
					</div>

					<div className="flex items-center flex-nowrap justify-between">
						<span className="text-2xl self-end font-extrabold mr-28" />
						<div className="flex justify-between">
							<div className="flex">
								<div className="mx-8">
									<FormControl>
										<InputLabel id="roomLabel">Room</InputLabel>
										<Select
											name="room"
											onChange={handleFilters}
											value={filters.room}
											labelId="roomLabel"
											id="room"
											label="Room"
											style={{ width: 150 }}
											endAdornment={
												filters.room ? (
													<IconButton id="clear-room-filter" size="small" className="mr-16">
														<Close
															onClick={() =>
																setFilters({
																	...filters,
																	room: '',
																})
															}
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
												rooms.map((room) => {
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
															onClick={() =>
																setFilters({
																	...filters,
																	student_status: '',
																})
															}
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
							</div>

							<div className="mx-8">
								<div className="mx-10 student-date-field" style={{ width: '90%' }}>
									<CustomDatePicker
										id="date"
										label="Date"
										value={filters.date}
										setValue={(date) => {
											setFilters({ ...filters, date: date?.format('YYYY-MM-DD') || '' });
										}}
										maxDate={new Date()}
									/>
								</div>
							</div>
							<div className="self-end">
								<span>
									<span className="mx-4">
										<CustomButton
											disabled={!filters.room && !filters.date && !filters.student_status}
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

					<TableContainer id="Scrollable-table" component={Paper} className="activity-table-cont">
						<Table
							stickyHeader
							className="student-table"
							style={{ width: activitiesList.length > 0 ? '150%' : '', tableLayout: 'fixed' }}
						>
							{activitiesList.length > 0 ? (
								<>
									<TableHead>
										<TableRow>
											<TableCell
												style={{
													width: '15%',
													borderRight: '1px',
													borderStyle: 'solid',
													borderColor: 'lightgray',
													zIndex: 3,
													// position: 'initial'
												}}
												className={['bg-white studentTableHeader', classes.studentColSticky]}
											>
												Student
											</TableCell>
											{activitiesList.map((activity, i) => {
												return (
													<TableCell
														style={{
															width: '5%',
															borderRight: '1px',
															borderStyle: 'solid',
															borderColor: 'lightgray',
															// position: 'initial'
														}}
														// className="bg-white studentTableHeaderActivity"
														className={[
															'bg-white studentTableHeaderActivity',
															classes.activityColSticky,
														]}
													>
														<img
															style={{ margin: '0px auto', width: '30px' }}
															src={activity.thumb}
															alt={activity.name}
														/>
														{activity.name}
													</TableCell>
												);
											})}
											<TableCell
												style={{
													width: '7.9%',
													textAlign: 'center',
													borderRight: '1px',
													borderStyle: 'solid',
													borderColor: 'lightgray',
													// position: 'unset'
												}}
												// className="bg-white studentTableHeader"
												className={['bg-white studentTableHeader', classes.statusColSticky]}
											>
												Status
											</TableCell>
											<TableCell
												style={{ width: '7%', textAlign: 'center' }}
												// className="bg-white studentTableHeader"
												className={['bg-white studentTableHeader', classes.reportColSticky]}
											>
												Daily Report
											</TableCell>
										</TableRow>
									</TableHead>
									<TableBody>
										{firstLoad ? (
											<TableRow>
												<TableCell align="center" colSpan={15}>
													Generate your report
												</TableCell>
											</TableRow>
										) : isLoading ? (
											<TableRow>
												<TableCell align="center" colSpan={15}>
													<CircularProgress size={35} />
												</TableCell>
											</TableRow>
										) : !data.length && !firstLoad ? (
											<TableRow>
												<TableCell align="center" colSpan={15}>
													No record found
												</TableCell>
											</TableRow>
										) : data.length ? (
											data.map((student, i) => {
												return (
													<TableRow>
														<TableCell
															style={{
																fontWeight: 700,
																borderWidth: '0px 1px 1px 0px',
																borderStyle: 'solid',
																borderColor: 'lightgray',
															}}
															className={classes.studentColSticky}
															component="th"
															scope="row"
														>
															<div className="flex">
																<div className="flex  items-center justify-content: center">
																	<div
																		className="report-std truncate "
																		style={{
																			display: 'flex',
																			alignItems: 'center',
																		}}
																	>
																		<Avatar
																			style={{ width: '40px', height: '40px' }}
																			src={student.photo}
																		/>
																		<span style={{ marginLeft: '10px' }}>
																			{student.first_name} {student.last_name}
																		</span>
																	</div>
																</div>
															</div>
														</TableCell>
														{student.count_activity.map((res, index) => {
															return (
																<TableCell
																	style={{
																		fontWeight: 700,
																		borderWidth: '0px 1px 1px 0px',
																		borderStyle: 'solid',
																		borderColor: 'lightgray',
																		textAlign: 'center',
																	}}
																>
																	<div
																		className="flex"
																		style={{ justifyContent: 'center' }}
																	>
																		<div className="flex  items-center">
																			<div className="report-std truncate ">
																				{res.total}
																			</div>
																		</div>
																	</div>
																</TableCell>
															);
														})}
														<TableCell
															style={{
																fontWeight: 700,
																borderWidth: '0px 1px 1px 0px',
																borderStyle: 'solid',
																borderColor: 'lightgray',
															}}
															className={classes.statusColSticky}
															component="th"
															scope="row"
														>
															<div
																className="flex"
																style={{
																	justifyContent: 'center',
																}}
															>
																<div className="flex  items-center">
																	<div
																		className="report-std truncate "
																		style={{
																			color:
																				student.status === 'Active'
																					? '#04c01c'
																					: '#ff4b4b',
																		}}
																	>
																		{student.status === 'Active'
																			? 'Active'
																			: 'Inactive'}
																	</div>
																</div>
															</div>
														</TableCell>

														<TableCell
															style={{
																fontWeight: 700,
																borderWidth: '0px 0px 1px 0px',
																borderStyle: 'solid',
																borderColor: 'lightgray',
															}}
															className={classes.reportColSticky}
															component="th"
															scope="row"
														>
															<div className="flex" style={{ justifyContent: 'center' }}>
																<div className="flex  items-center">
																	<div
																		className="report-std truncate "
																		onClick={() => dialogueopen(student)}
																		style={{ cursor: 'pointer', color: '#5b81f0' }}
																	>
																		View
																	</div>
																</div>
															</div>
														</TableCell>
													</TableRow>
												);
											})
										) : (
											<>hello</>
										)}
									</TableBody>
								</>
							) : (
								<TableCell align="center">
									<CircularProgress size={35} />
								</TableCell>
							)}
						</Table>
					</TableContainer>
					<InfiniteScroll
						dataLength={data.length}
						next={handleLoadMore}
						hasMore={hasMore}
						scrollableTarget="Scrollable-table"
					/>
				</div>
			</FuseAnimate>
			{!!activeStudent && !!studentActivity && (
				<div className="flex justify-between bg-white w-full h-full mt-32" style={{ display: 'none' }}>
					<div
						style={{
							width: '100%',
							backgroundColor: 'white',
							// display: 'none'
						}}
						ref={pdfRef}
					>
						<div className="bg-white p-16" style={{ backgroundColor: '#5b81f0', height: 96 }}>
							<div
								className="flex flex-col"
								style={{
									gap: 'auto',
									height: 105,
								}}
							>
								<div className="flex items-center flex-nowrap justify-between">
									<span className="text-xl self-end font-bold mr-28">
										<div
											className="report-std truncate "
											style={{ display: 'flex', alignItems: 'center' }}
										>
											<Avatar
												style={{ width: '40px', height: '40px' }}
												src={activeStudent.photo}
											/>
											<span style={{ marginLeft: '10px', color: '#fff' }}>
												{activeStudent.first_name} {activeStudent.last_name}
											</span>
										</div>
									</span>
									<div className="flex justify-between">
										<div className="flex">
											<div className="flex">
												<div
													className="flex flex-col items-end"
													style={{ color: '#fff', marginRight: '22px' }}
												>
													<div>Daily Report</div>
													<div> {dayjs(filters.date).format('MMMM DD, YYYY')}</div>
												</div>
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>
						<div>
							<>
								<div className="flex flex-col-reverse mt-10">
									<div className="box-padding">
										<div className="text-xl self-end font-bold mr-28 my-4">
											<div className="flex">
												<div className="checkin-tick-icon">
													<Check color="white" />
												</div>
												<div
													className="flex flex-col items-start"
													style={{ marginLeft: '14px' }}
												>
													<div style={{ fontSize: '13px', paddingBottom: '4px' }}>
														Checked in at{' '}
														{dayjs(`${studentActivity.checkin}Z`).format('hh:mm A')}
													</div>
												</div>
											</div>
										</div>
									</div>
									{studentActivity?.activities?.map((activity, index) => {
										return (
											<div className="box-padding">
												<div className="text-xl self-end font-bold mr-28">
													<div className="flex border-b pb-10">
														<Avatar src={activity.activity.photo} />
														<div
															className="flex flex-col items-start"
															style={{ marginLeft: '14px' }}
														>
															<div style={{ fontSize: '13px', paddingBottom: '4px' }}>
																{activity.activity.name} at{' '}
																{dayjs(activity.created_at).format('hh:mm A')}
															</div>
															<div
																style={{
																	fontSize: '13px',
																	paddingBottom: '4px',
																	color: '#676767',
																}}
															>
																{activity.activity.name}
																{activity?.activities?.types
																	? ` - ${activity?.activities?.types}`
																	: ''}
																{activity.package ? ` - ${activity.package}` : ''}
																{activity?.start_time
																	? ` - ${activity?.start_time
																			.split(' ')
																			.slice(1, 3)
																			.join(' ')}`
																	: ''}
																{activity?.end_time
																	? ` to ${activity?.end_time
																			.split(' ')
																			.slice(1, 3)
																			.join(' ')}`
																	: ''}
																{activity?.activities?.bullet_comments
																	? ` - ${activity?.activities?.bullet_comments}`
																	: ''}
																{activity?.activities?.quick_comments
																	? ` - ${activity?.activities?.quick_comments}`
																	: ''}
																{activity.other_comment
																	? ` - ${activity.other_comment}`
																	: ''}
																{activity.activity_id === 10 &&
																activity.activity_supplies.length > 0
																	? `: ${activity?.activity_supplies
																			?.map((supply) => supply.supply_name)
																			.join(' - ')}`
																	: ''}
															</div>
															{(activity.photo ||
																activity.media.length > 0 ||
																activity.video) && (
																<MediaRenderer
																	media={activity.media}
																	photo={activity.photo}
																	video={activity.video}
																	videoThumbnail={activity.video_thumb}
																/>
															)}
														</div>
													</div>
												</div>
											</div>
										);
									})}
									{studentActivity?.checkout && (
										<div className="box-padding">
											<div className="text-xl self-end font-bold mr-28">
												<div className="flex">
													<div className="checkin-tick-icon">
														<Check color="white" />
													</div>
													<div
														className="flex flex-col items-start"
														style={{ marginLeft: '14px' }}
													>
														<div style={{ fontSize: '13px', paddingBottom: '4px' }}>
															Checked out at{' '}
															{dayjs(`${studentActivity.checkout}Z`).format('hh:mm A')}
														</div>
													</div>
												</div>
											</div>
										</div>
									)}
								</div>
							</>
						</div>
					</div>
				</div>
			)}
		</>
	);
}

export default Activity;
