/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
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
	Typography,
	TextField,
	InputAdornment,
} from '@material-ui/core';
import FuseAnimate from '@fuse/core/FuseAnimate';
import { useDispatch, useSelector } from 'react-redux';
import * as Actions from 'app/store/actions';
import CustomButton from 'app/customComponents/CustomButton/CustomButton';
import './companyReport.css';
import moment from 'moment';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload } from '@fortawesome/free-solid-svg-icons';
import CustomDatePicker from 'app/customComponents/CustomDatePicker/CustomDatePicker';
import { useReactToPrint } from 'react-to-print';
import { Close } from '@material-ui/icons';
import { getParentsInformation, getSchools } from 'app/services/reports/reports';
import InfiniteScroll from 'react-infinite-scroll-component';
import { getRoomsfilter } from 'app/services/CompanyReports/companyReports';
import dayjs from 'dayjs';
import { getAgeDetails } from 'utils/utils';

export default function ParentReports() {
	const dispatch = useDispatch();
	const [rows, setRows] = useState([]);
	const [isLoading, setIsLoading] = useState(false);
	const [hasMore, setHasMore] = useState(false);
	const [firstLoad, setFirstLoad] = useState(true);
	const [fetchingMore, setFetchingMore] = useState(false);
	const checkInReportRef = useRef(null);
	const [page, setPage] = useState(1);
	const [filters, setFilters] = useState({
		name: '',
		room_id: '',
		school_id: '',
		package_type: '',
		date_from: '',
		date_to: '',
		export_id: '',
	});

	const [date, setDate] = useState(new Date());
	const [roomPage, setRoomPage] = useState(1);
	const [schools, setSchool] = useState([]);
	const [rooms, setRooms] = useState([]);
	const user = useSelector(({ auth }) => auth.user);
	const [searchQuery, setSearchQuery] = useState('');
	const [isExporting, setIsExporting] = useState(false);
	const [roomId, setRoomid] = useState();

	const handleSearch = (e) => {
		setSearchQuery(e.target.value);
	};

	const handleFilters = (ev) => {
		const { name, value } = ev.target;
		if (name === 'school_id') {
			setFilters({ ...filters, [name]: value, room_id: '' });
			setRooms([]);
			setRoomPage(1);
		} else {
			setFilters({ ...filters, [name]: value });
		}
	};

	useEffect(() => {
		getSchools().then((res) => {
			setSchool(res?.data?.data);
		});
	}, []);

	useEffect(() => {
		getRoomsfilter(roomPage, filters?.school_id == 'All' ? '' : filters?.school_id)
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
	}, [roomPage, filters?.school_id, dispatch]);

	const handleLoadMore = () => {
		setFetchingMore(true);
		getParentsInformation(
			searchQuery,
			filters.room_id === 'All' ? '' : filters.room_id,
			filters.room_id === 'All'
				? filters.school_id
				: filters.room_id
				? rooms.filter((room) => room.id == filters.room_id)[0].school_id
				: filters.school_id === 'All'
				? ''
				: filters.school_id,
			filters.package_type,
			filters.date_from,
			filters.date_to,
			page,
			0
		)
			.then((res) => {
				if (res.data.last_page > res.data.current_page) {
					setHasMore(true);
				} else {
					setHasMore(false);
				}
				setPage(res.data.current_page + 1);
				setRows(rows.concat(res.data.data));
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

	const handlemore = (row) => {
		dispatch(
			Actions.openDialog({
				children: (
					<div className="bg-white student-list-card">
						<div className="flex justify-between student-list-header">
							<div>
								<h1>Students</h1>
							</div>
							<div>
								<i
									style={{ cursor: 'pointer' }}
									className="fas fa-times"
									onClick={() => dispatch(Actions.closeDialog())}
								/>
							</div>
						</div>
						{roomId ? (
							<div id="scrollable-list" className="student-list-cont w-full">
								{roomId === 'All' ? (
									<>
										{row.parent?.family_child
											?.filter((child) => child.school_id === row.school_id)
											?.slice(2)
											.map((child, i) => (
												<div className="flex items-center " style={{ padding: 14 }} key={i}>
													<Avatar className="mr-6" alt="student-face" src={child.photo} />
													<div className="flex flex-col items-start">
														<div className="student-name  break-word">
															{child.first_name} {child.last_name}
														</div>
													</div>
												</div>
											))}
									</>
								) : (
									<>
										{row.parent?.family_child
											?.filter((child) => child.home_room.id === roomId)
											?.slice(2)
											?.map((child, i) => (
												<div className="flex items-center " style={{ padding: 14 }} key={i}>
													<Avatar className="mr-6" alt="student-face" src={child.photo} />
													<div className="flex flex-col items-start">
														<div className="student-name  break-word">
															{child.first_name} {child.last_name}
														</div>
													</div>
												</div>
											))}
									</>
								)}
							</div>
						) : (
							<div id="scrollable-list" className="student-list-cont w-full">
								{row.parent?.family_child
									?.filter((child) => child.school_id === row.school_id)
									?.slice(2)
									?.map((child, i) => (
										<div className="flex items-center " style={{ padding: 14 }} key={i}>
											<Avatar className="mr-6" alt="student-face" src={child.photo} />
											<div className="flex flex-col items-start">
												<div className="student-name  break-word">
													{child.first_name} {child.last_name}
												</div>
											</div>
										</div>
									))}
							</div>
						)}
					</div>
				),
			})
		);
	};

	const ApplyFilters = () => {
		setRows([]);
		setIsLoading(true);
		setFirstLoad(false);
		getParentsInformation(
			searchQuery,
			filters.room_id === 'All' ? '' : filters.room_id,
			filters.room_id === 'All'
				? filters.school_id
				: filters.room_id
				? rooms.filter((room) => room.id == filters.room_id)[0].school_id
				: filters.school_id === 'All'
				? ''
				: filters.school_id,
			// filters.school_id === 'All' ? '' : filters.school_id,
			filters.package_type,
			filters.date_from,
			filters.date_to,
			1,
			0
		)
			.then((res) => {
				setRows(res.data.data);
				if (res.data.last_page > res.data.current_page) {
					setHasMore(true);
				} else {
					setHasMore(false);
				}
				setPage(res.data.current_page + 1);
				setRoomid(filters.room_id);
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
		setPage(1);
	};

	const handlePrint = useReactToPrint({
		content: () => checkInReportRef.current,
	});

	const handleExport = () => {
		setIsExporting(true);
		getParentsInformation(
			searchQuery,
			filters.room_id === 'All' ? '' : filters.room_id,
			filters.room_id === 'All'
				? filters.school_id
				: filters.room_id
				? rooms.filter((room) => room.id == filters.room_id)[0].school_id
				: filters.school_id === 'All'
				? ''
				: filters.school_id,
			filters.package_type,
			filters.date_from,
			filters.date_to,
			1,
			1
		)
			.then((res) => {
				const blob = new Blob([res.data], {
					type: 'text/csv',
				});
				const link = document.createElement('a');
				link.setAttribute('target', '_blank');
				link.href = window.URL.createObjectURL(blob);
				link.setAttribute('download', `parent_subscription_report_${new Date().getTime()}.csv`);
				document.body.appendChild(link);
				link.click();
				// Clean up and remove the link
				link.parentNode.removeChild(link);
			})
			.catch((err) => {
				dispatch(
					Actions.showMessage({
						message: 'Failed to Export',
						variant: 'error',
					})
				);
			})
			.finally(() => {
				setIsExporting(false);
			});
	};

	return (
		<FuseAnimate animation="transition.slideLeftIn" duration={600}>
			<div className="mx-auto allergy-cont">
				<div className="flex items-center flex-nowrap justify-between">
					<div className="reports-topDiv">
						<h1 className="">
							{' '}
							<span className="">
								<IconButton
									onClick={() => {
										history.push('/company-reports');
									}}
								>
									<img src="assets/images/arrow-long.png" alt="filter" width="24px" className="" />
								</IconButton>
							</span>{' '}
							<span className="text-xl self-end font-bold mr-28">Parent Subscription Report</span>
						</h1>
						<p>Detailed data of parent subscription information </p>
					</div>
					<div className="flex justify-between">
						<div className="flex">
							<div className="self-end btn-aller">
								<span>
									{!isExporting ? (
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
								<TextField
									className="mr-10 width-set-for-small-screen-search"
									onChange={handleSearch}
									id="search-input"
									value={searchQuery}
									label="Search by Parent"
									style={{ width: 170 }}
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
										),
									}}
								/>
							</div>
							<div className="mx-8">
								<FormControl>
									<InputLabel id="schoolLabel">School</InputLabel>
									<Select
										name="school_id"
										onChange={handleFilters}
										value={filters.school_id}
										labelId="schoolLabel"
										label="School"
										style={{ width: 150 }}
										className="width-set-for-small-screen"
										endAdornment={
											filters?.school_id ? (
												<IconButton size="small" className="mr-16">
													<Close
														onClick={() => {
															setFilters({
																...filters,
																school_id: '',
																room_id: '',
															});
															setRooms([]);
															setRoomPage(1);
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
										{schools?.length ? (
											schools?.map((school) => {
												return (
													<MenuItem key={school?.id} value={school?.id} id={school?.id}>
														<div style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
															{school?.name}
														</div>
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
									<InputLabel id="room_id">Room</InputLabel>
									<Select
										name="room_id"
										onChange={handleFilters}
										value={filters.room_id}
										labelId="roomLabel"
										id="room_id"
										label="Room"
										style={{ width: 150 }}
										className="width-set-for-small-screen"
										endAdornment={
											filters.room_id ? (
												<IconButton id="clear-room-filter" size="small" className="mr-16">
													<Close
														onClick={() => {
															setFilters({
																...filters,
																room_id: '',
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
									<InputLabel id="package_type">Package Type</InputLabel>
									<Select
										name="package_type"
										labelId="package_type"
										id="package_type"
										label="Package Type"
										value={filters.package_type}
										onChange={handleFilters}
										style={{ width: 150 }}
										className="width-set-for-small-screen"
										endAdornment={
											filters.package_type ? (
												<IconButton id="clear-room-filter" size="small" className="mr-16">
													<Close
														onClick={() => {
															setFilters({
																...filters,
																package_type: '',
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
										<MenuItem value="1">Included</MenuItem>
										<MenuItem value="2">Premium</MenuItem>
										<MenuItem value="3">Ultimate</MenuItem>
									</Select>
								</FormControl>
							</div>
							<div className="mx-10 student-date-field width-set-for-small-screen" style={{ width: 150 }}>
								<CustomDatePicker
									id="date-from"
									label="Date From"
									value={filters.date_from}
									setValue={(date) => {
										setFilters({ ...filters, date_from: date?.format('YYYY-MM-DD') || '' });
									}}
									maxDate={filters.toDate || new Date()}
								/>
							</div>
							<div
								className="mr-20 ml-10 student-date-field width-set-for-small-screen"
								style={{ width: 150 }}
							>
								<CustomDatePicker
									id="date-to"
									label="Date To"
									value={filters.date_to}
									setValue={(date) => {
										setFilters({ ...filters, date_to: date?.format('YYYY-MM-DD') || '' });
									}}
									maxDate={new Date()}
									minDate={filters.fromDate}
								/>
							</div>
						</div>

						<div className="self-end">
							<span>
								<span className="mx-4">
									<CustomButton
										disabled={
											!filters.package_type &&
											!filters.room_id &&
											!filters.school_id &&
											!filters.date_from &&
											!filters.date_to &&
											!searchQuery
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
				<TableContainer id="Scrollable-table" component={Paper} className="allergy-table-cont">
					<div style={{ display: 'none' }}>
						<div ref={checkInReportRef} className="p-32">
							<div className="flex flex-row justify-between">
								<div>
									<img src="assets/images/logos/logo.png" alt="" />
								</div>
								<div style={{ textAlign: 'right' }}>
									<Typography variant="subtitle1">
										<span style={{ display: 'block', marginBottom: '-0.7em', writingMode: '' }}>
											{user?.data?.school?.address}
										</span>{' '}
										{/* <span>Hom Lake, Orlando, FL 38637</span> */}
									</Typography>
									<Typography variant="subtitle1">{user?.data?.phone}</Typography>
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
								<h1 className="font-extrabold">Parent Subscription Report</h1>
							</div>

							<Table stickyHeader className="student-table" style={{ width: '100%' }}>
								<TableHead>
									<TableRow>
										<TableCell style={{ width: '20%' }} className="bg-white studentTableHeader">
											Parent
										</TableCell>
										<TableCell style={{ width: '30%' }} className="bg-white studentTableHeader">
											Students
										</TableCell>
										<TableCell style={{ width: '30%' }} className="bg-white studentTableHeader">
											School Name
										</TableCell>
										<TableCell style={{ width: '4%' }} className="bg-white studentTableHeader">
											Package Type
										</TableCell>
										<TableCell style={{ width: '4%' }} className="bg-white studentTableHeader">
											Amount
										</TableCell>
										<TableCell style={{ width: '7%' }} className="bg-white studentTableHeader">
											Date
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
									) : !rows.length && !isLoading ? (
										<TableRow>
											<TableCell align="center" colSpan={8}>
												No record found
											</TableCell>
										</TableRow>
									) : (
										rows?.map((row) => (
											<TableRow key={row.id} className="mb-12">
												<TableCell style={{ fontWeight: 700 }} component="th" scope="row">
													<div id={`student-${row.id}`} className="flex">
														<Avatar
															className="mr-6"
															alt="student-face"
															src={row?.parent?.photo}
														/>
														<div className="flex items-center">
															<div className="student-name  break-word">
																{row?.parent?.first_name} {row?.parent?.last_name}
															</div>
														</div>
													</div>
												</TableCell>
												{roomId ? (
													<TableCell align="left">
														{roomId === 'All' ? (
															<div className="flex items-center justify-between">
																<div className="flex flex-col items-center">
																	{row.parent?.family_child.filter(
																		(child) => child.school_id === row.school_id
																	).length > 2
																		? row.parent?.family_child
																				.filter(
																					(child) =>
																						child.school_id ===
																						row.school_id
																				)
																				.map((child, i) => {
																					const age = getAgeDetails(
																						dayjs(child?.date_of_birth),
																						dayjs()
																					);

																					return (
																						<div
																							className="flex items-center parent-column"
																							style={{ marginRight: 20 }}
																							key={i}
																						>
																							<Avatar
																								className="mr-6"
																								alt="student-face"
																								src={child.thumb}
																							/>
																							<div className="flex flex-col items-start">
																								<div
																									className="student-name  break-word "
																									style={{
																										width: '90px',
																										color: '#6387d4',
																										fontSize:
																											'12px',
																										fontWeight:
																											'700',
																									}}
																								>
																									{
																										child?.home_room
																											?.name
																									}
																								</div>
																								<div
																									className="student-name  break-word"
																									style={{
																										width: '90px',
																									}}
																								>
																									{child.first_name}{' '}
																									{child.last_name}
																								</div>
																								<div
																									className="font-normal student-age-font"
																									style={{
																										width: '90px',
																									}}
																								>
																									{age.years !== 0
																										? `${age.years} year`
																										: ''}
																									{age.years > 1
																										? 's'
																										: ''}
																									{age.months !== 0
																										? ` ${age.months} month`
																										: ''}
																									{age.months > 1
																										? 's'
																										: ''}
																									{age.days !== 0
																										? ` ${age.days} day`
																										: ''}
																									{age.days > 1
																										? 's'
																										: ''}
																								</div>
																							</div>
																						</div>
																					);
																				})
																		: row.parent?.family_child
																				.filter(
																					(child) =>
																						child.school_id ===
																						row.school_id
																				)
																				.map((child, i) => {
																					const age = getAgeDetails(
																						dayjs(child?.date_of_birth),
																						dayjs()
																					);

																					return (
																						<div
																							className="flex items-center parent-column"
																							key={i}
																							style={{ marginRight: 20 }}
																						>
																							<Avatar
																								className="mr-6"
																								alt="student-face"
																								src={child.thumb}
																							/>
																							<div className="flex flex-col items-start">
																								<div
																									className="student-name  break-word "
																									style={{
																										width: '90px',
																										color: '#6387d4',
																									}}
																								>
																									{
																										child?.home_room
																											?.name
																									}
																								</div>
																								<div
																									className="student-name  break-word "
																									style={{
																										width: '90px',
																									}}
																								>
																									{child.first_name}{' '}
																									{child.last_name}
																								</div>
																								<div
																									className="font-normal student-age-font"
																									style={{
																										width: '90px',
																									}}
																								>
																									{age.years !== 0
																										? `${age.years} year`
																										: ''}
																									{age.years > 1
																										? 's'
																										: ''}
																									{age.months !== 0
																										? ` ${age.months} month`
																										: ''}
																									{age.months > 1
																										? 's'
																										: ''}
																									{age.days !== 0
																										? ` ${age.days} day`
																										: ''}
																									{age.days > 1
																										? 's'
																										: ''}
																								</div>
																							</div>
																						</div>
																					);
																				})}
																</div>
																<div />
															</div>
														) : (
															<div className="flex items-center justify-between">
																<div className="flex flex-col items-center">
																	{row.parent?.family_child.filter(
																		(child) => child.home_room.id === roomId
																	).length > 2
																		? row.parent?.family_child
																				.filter(
																					(child) =>
																						child.home_room.id === roomId
																				)
																				?.map((child, i) => {
																					const age = getAgeDetails(
																						dayjs(child?.date_of_birth),
																						dayjs()
																					);

																					return (
																						<div
																							className="flex items-center parent-column"
																							style={{ marginRight: 20 }}
																							key={i}
																						>
																							<Avatar
																								className="mr-6"
																								alt="student-face"
																								src={child.thumb}
																							/>
																							<div className="flex flex-col items-start">
																								<div
																									className="student-name  break-word "
																									style={{
																										width: '90px',
																										color: '#6387d4',
																										fontSize:
																											'12px',
																										fontWeight:
																											'700',
																									}}
																								>
																									{
																										child?.home_room
																											?.name
																									}
																								</div>
																								<div
																									className="student-name  break-word"
																									style={{
																										width: '90px',
																									}}
																								>
																									{child.first_name}{' '}
																									{child.last_name}
																								</div>
																								<div
																									className="font-normal student-age-font"
																									style={{
																										width: '90px',
																									}}
																								>
																									{age.years !== 0
																										? `${age.years} year`
																										: ''}
																									{age.years > 1
																										? 's'
																										: ''}
																									{age.months !== 0
																										? ` ${age.months} month`
																										: ''}
																									{age.months > 1
																										? 's'
																										: ''}
																									{age.days !== 0
																										? ` ${age.days} day`
																										: ''}
																									{age.days > 1
																										? 's'
																										: ''}
																								</div>
																							</div>
																						</div>
																					);
																				})
																		: row.parent?.family_child
																				.filter(
																					(child) =>
																						child.home_room.id === roomId
																				)
																				?.map((child, i) => {
																					const age = getAgeDetails(
																						dayjs(child?.date_of_birth),
																						dayjs()
																					);

																					return (
																						<div
																							className="flex items-center parent-column"
																							key={i}
																							style={{ marginRight: 20 }}
																						>
																							<Avatar
																								className="mr-6"
																								alt="student-face"
																								src={child.thumb}
																							/>
																							<div className="flex flex-col items-start">
																								<div
																									className="student-name  break-word "
																									style={{
																										width: '90px',
																										color: '#6387d4',
																									}}
																								>
																									{
																										child?.home_room
																											?.name
																									}
																								</div>
																								<div
																									className="student-name  break-word "
																									style={{
																										width: '90px',
																									}}
																								>
																									{child.first_name}{' '}
																									{child.last_name}
																								</div>
																								<div
																									className="font-normal student-age-font"
																									style={{
																										width: '90px',
																									}}
																								>
																									{age.years !== 0
																										? `${age.years} year`
																										: ''}
																									{age.years > 1
																										? 's'
																										: ''}
																									{age.months !== 0
																										? ` ${age.months} month`
																										: ''}
																									{age.months > 1
																										? 's'
																										: ''}
																									{age.days !== 0
																										? ` ${age.days} day`
																										: ''}
																									{age.days > 1
																										? 's'
																										: ''}
																								</div>
																							</div>
																						</div>
																					);
																				})}
																</div>
																<div />
															</div>
														)}
													</TableCell>
												) : (
													<TableCell align="left">
														<div className="flex items-center justify-between">
															<div className="flex flex-col items-center">
																{row.parent?.family_child.filter(
																	(child) => child.school_id === row.school_id
																).length > 2
																	? row.parent?.family_child
																			.filter(
																				(child) =>
																					child.school_id === row.school_id
																			)
																			?.map((child, i) => {
																				const age = getAgeDetails(
																					dayjs(child?.date_of_birth),
																					dayjs()
																				);

																				return (
																					<div
																						className="flex items-center parent-column"
																						style={{ marginRight: 20 }}
																						key={i}
																					>
																						<Avatar
																							className="mr-6"
																							alt="student-face"
																							src={child.thumb}
																						/>
																						<div className="flex flex-col items-start">
																							<div
																								className="student-name  break-word "
																								style={{
																									width: '90px',
																									color: '#6387d4',
																									fontSize: '12px',
																									fontWeight: '700',
																								}}
																							>
																								{child?.home_room?.name}
																							</div>
																							<div
																								className="student-name  break-word"
																								style={{
																									width: '90px',
																								}}
																							>
																								{child.first_name}{' '}
																								{child.last_name}
																							</div>
																							<div
																								className="font-normal student-age-font"
																								style={{
																									width: '90px',
																								}}
																							>
																								{age.years !== 0
																									? `${age.years} year`
																									: ''}
																								{age.years > 1
																									? 's'
																									: ''}
																								{age.months !== 0
																									? ` ${age.months} month`
																									: ''}
																								{age.months > 1
																									? 's'
																									: ''}
																								{age.days !== 0
																									? ` ${age.days} day`
																									: ''}
																								{age.days > 1
																									? 's'
																									: ''}
																							</div>
																						</div>
																					</div>
																				);
																			})
																	: row.parent?.family_child
																			.filter(
																				(child) =>
																					child.school_id === row.school_id
																			)
																			?.map((child, i) => {
																				const age = getAgeDetails(
																					dayjs(child?.date_of_birth),
																					dayjs()
																				);

																				return (
																					<div
																						className="flex items-center parent-column"
																						key={i}
																						style={{ marginRight: 20 }}
																					>
																						<Avatar
																							className="mr-6"
																							alt="student-face"
																							src={child.thumb}
																						/>
																						<div className="flex flex-col items-start">
																							<div
																								className="student-name  break-word "
																								style={{
																									width: '90px',
																									color: '#6387d4',
																								}}
																							>
																								{child?.home_room?.name}
																							</div>
																							<div
																								className="student-name  break-word "
																								style={{
																									width: '90px',
																								}}
																							>
																								{child.first_name}{' '}
																								{child.last_name}
																							</div>
																							<div
																								className="font-normal student-age-font"
																								style={{
																									width: '90px',
																								}}
																							>
																								{age.years !== 0
																									? `${age.years} year`
																									: ''}
																								{age.years > 1
																									? 's'
																									: ''}
																								{age.months !== 0
																									? ` ${age.months} month`
																									: ''}
																								{age.months > 1
																									? 's'
																									: ''}
																								{age.days !== 0
																									? ` ${age.days} day`
																									: ''}
																								{age.days > 1
																									? 's'
																									: ''}
																							</div>
																						</div>
																					</div>
																				);
																			})}
															</div>
															<div />
														</div>
													</TableCell>
												)}
												<TableCell>
													<div
														style={{ fontSize: '12px', fontWeight: '700' }}
														className="break-word"
													>
														{row?.school?.name}
													</div>
												</TableCell>
												<TableCell align="left">
													<div style={{ fontSize: '12px', fontWeight: '700' }}>
														{row?.package?.title.split('Subscription')}
													</div>
												</TableCell>
												<TableCell align="left">
													<div style={{ fontSize: 12, fontWeight: '700' }}>
														${row.package_price}
													</div>
												</TableCell>

												<TableCell>
													<div className="flex flex-col">
														<div
															style={{
																fontSize: '12px',
																fontWeight: '700',
																color: '#000',
															}}
														>
															{moment.utc(row?.created_at).local().format('L')}
														</div>
														<div className="subscribe-date" style={{ fontSize: '10px' }}>
															{moment.utc(row?.created_at).local().format('LT')}
														</div>
													</div>
												</TableCell>
											</TableRow>
										))
									)}
									{/* {fetchingMore ? (
								<TableRow>
									<TableCell align="center" colSpan={8}>
										<CircularProgress />
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
								<TableCell style={{ width: '15%' }} className="bg-white studentTableHeader">
									Parent
								</TableCell>
								<TableCell style={{ width: '25%' }} className="bg-white studentTableHeader">
									Students
								</TableCell>
								<TableCell className="bg-white userTableHeader" style={{ width: '15%', padding: 0 }} />
								<TableCell style={{ width: '15%' }} className="bg-white studentTableHeader">
									School Name
								</TableCell>
								<TableCell style={{ width: '15%' }} className="bg-white studentTableHeader">
									Package Type
								</TableCell>
								<TableCell style={{ width: '10%' }} className="bg-white studentTableHeader">
									Amount
								</TableCell>
								<TableCell style={{ width: '10%' }} className="bg-white studentTableHeader">
									Date
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
							) : !rows.length && !isLoading ? (
								<TableRow>
									<TableCell align="center" colSpan={8}>
										No record found
									</TableCell>
								</TableRow>
							) : (
								rows?.map((row) => (
									<TableRow key={row.id}>
										<TableCell style={{ fontWeight: 700 }} component="th" scope="row">
											<div id={`student-${row.id}`} className="flex">
												<Avatar className="mr-6" alt="student-face" src={row?.parent?.photo} />
												<div className="flex items-center">
													<div className="student-name  break-word">
														{row?.parent?.first_name} {row?.parent?.last_name}
													</div>
												</div>
											</div>
										</TableCell>

										{roomId ? (
											<>
												<TableCell style={{ fontWeight: 700 }}>
													<div className="flex items-center justify-between">
														{roomId === 'All' ? (
															<>
																{row?.parent?.family_child
																	.filter(
																		(child) => child.school_id === row.school_id
																	)
																	?.map((child, i) => {
																		const age = getAgeDetails(
																			dayjs(child?.date_of_birth),
																			dayjs()
																		);

																		return (
																			<div
																				className="flex items-center parent-column"
																				style={{ marginRight: 20 }}
																				key={i}
																			>
																				<Avatar
																					className="mr-6"
																					alt="student-face"
																					src={child.thumb}
																				/>
																				<div className="flex flex-col items-start">
																					<div
																						className="student-name  break-word "
																						style={{
																							width: '90px',
																							color: '#6387d4',
																							fontSize: '12px',
																							fontWeight: '700',
																						}}
																					>
																						{child?.home_room?.name}
																					</div>
																					<div
																						className="student-name  break-word"
																						style={{ width: '90px' }}
																					>
																						{child.first_name}{' '}
																						{child.last_name}
																					</div>
																					<div
																						className="font-normal  student-age-font"
																						style={{ fontSize: 10 }}
																					>
																						<div
																							className="font-normal student-age-font"
																							style={{ width: '90px' }}
																						>
																							{age.years !== 0
																								? `${age.years} year`
																								: ''}
																							{age.years > 1 ? 's' : ''}
																							{age.months !== 0
																								? ` ${age.months} month`
																								: ''}
																							{age.months > 1 ? 's' : ''}
																							{age.days !== 0
																								? ` ${age.days} day`
																								: ''}
																							{age.days > 1 ? 's' : ''}
																						</div>
																					</div>
																				</div>
																			</div>
																		);
																	})
																	.splice(0, 2)}
															</>
														) : (
															<>
																{row?.parent?.family_child
																	.filter((child) => child.home_room.id === roomId)
																	?.map((child, i) => {
																		const age = getAgeDetails(
																			dayjs(child?.date_of_birth),
																			dayjs()
																		);

																		return (
																			<div
																				className="flex items-center parent-column"
																				style={{ marginRight: 20 }}
																				key={i}
																			>
																				<Avatar
																					className="mr-6"
																					alt="student-face"
																					src={child.thumb}
																				/>
																				<div className="flex flex-col items-start">
																					<div
																						className="student-name  break-word "
																						style={{
																							width: '90px',
																							color: '#6387d4',
																						}}
																					>
																						{child?.home_room?.name}
																					</div>
																					<div
																						className="student-name  break-word"
																						style={{ width: '90px' }}
																					>
																						{child.first_name}{' '}
																						{child.last_name}
																					</div>
																					<div
																						className="font-normal student-age-font"
																						style={{ width: '90px' }}
																					>
																						{age.years !== 0
																							? `${age.years} year`
																							: ''}
																						{age.years > 1 ? 's' : ''}
																						{age.months !== 0
																							? ` ${age.months} month`
																							: ''}
																						{age.months > 1 ? 's' : ''}
																						{age.days !== 0
																							? ` ${age.days} day`
																							: ''}
																						{age.days > 1 ? 's' : ''}
																					</div>
																				</div>
																			</div>
																		);
																	})
																	.splice(0, 2)}
															</>
														)}
													</div>
												</TableCell>
												<TableCell style={{ paddingLeft: '64px' }}>
													<div>
														{roomId === 'All' ? (
															<>
																{row.parent?.family_child.filter(
																	(child) => child.school_id === row.school_id
																).length > 2 ? (
																	<h5
																		className="child-num cursor-pointer"
																		onClick={() => handlemore(row)}
																	>
																		&nbsp; +
																		{row.parent?.family_child.filter(
																			(child) => child.school_id === row.school_id
																		).length > 2 &&
																			`${
																				row.parent?.family_child.filter(
																					(child) =>
																						child.school_id ===
																						row.school_id
																				).length - 2
																			} Others`}{' '}
																	</h5>
																) : (
																	<></>
																)}
															</>
														) : (
															<>
																{row?.parent?.family_child.filter(
																	(child) => child.home_room.id === roomId
																)?.length > 2 ? (
																	<>
																		<div
																			onClick={() => handlemore(row)}
																			style={{
																				cursor: 'pointer',
																				fontSize: '11px',
																				color: '#008dff',
																				fontWeight: 700,
																				marginLeft: -12,
																			}}
																		>
																			{' '}
																			+
																			{`${
																				row?.parent?.family_child.filter(
																					(child) =>
																						child.home_room.id === roomId
																				)?.length - 2
																			} Others`}
																		</div>
																	</>
																) : (
																	''
																)}
															</>
														)}
													</div>
												</TableCell>
											</>
										) : (
											<>
												<TableCell style={{ fontWeight: 700 }}>
													<div className="flex items-center justify-between">
														{row?.parent?.family_child
															.filter((child) => child.school_id === row.school_id)
															?.map((child, i) => {
																const age = getAgeDetails(
																	dayjs(child?.date_of_birth),
																	dayjs()
																);

																return (
																	<div
																		className="flex items-center parent-column"
																		style={{ marginRight: 20 }}
																		key={i}
																	>
																		<Avatar
																			className="mr-6"
																			alt="student-face"
																			src={child.thumb}
																		/>
																		<div className="flex flex-col items-start">
																			<div
																				className="student-name  break-word "
																				style={{
																					width: '90px',
																					color: '#6387d4',
																					fontSize: '12px',
																					fontWeight: '700',
																				}}
																			>
																				{child?.home_room?.name}
																			</div>
																			<div
																				className="student-name  break-word"
																				style={{ width: '90px' }}
																			>
																				{child.first_name} {child.last_name}
																			</div>
																			<div
																				className="font-normal student-age-font"
																				style={{ width: '90px' }}
																			>
																				{age.years !== 0
																					? `${age.years} year`
																					: ''}
																				{age.years > 1 ? 's' : ''}
																				{age.months !== 0
																					? ` ${age.months} month`
																					: ''}
																				{age.months > 1 ? 's' : ''}
																				{age.days !== 0
																					? ` ${age.days} day`
																					: ''}
																				{age.days > 1 ? 's' : ''}
																			</div>
																		</div>
																	</div>
																);
															})
															.splice(0, 2)}
													</div>
												</TableCell>
												<TableCell style={{ paddingLeft: '64px' }}>
													{row.parent?.family_child.filter(
														(child) => child.school_id === row.school_id
													).length > 2 ? (
														<h5
															className="child-num cursor-pointer"
															onClick={() => handlemore(row)}
														>
															&nbsp; +
															{row.parent?.family_child.filter(
																(child) => child.school_id === row.school_id
															).length > 2 &&
																`${
																	row.parent?.family_child.filter(
																		(child) => child.school_id === row.school_id
																	).length - 2
																} Others`}{' '}
														</h5>
													) : (
														<></>
													)}
												</TableCell>
											</>
										)}
										<TableCell>
											<div style={{ fontSize: '12px', fontWeight: '700' }} className="break-word">
												{row?.school?.name}
											</div>
										</TableCell>
										<TableCell align="left">
											<div style={{ fontSize: '12px', fontWeight: '700' }}>
												{row?.package?.title.split('Subscription')}
											</div>
										</TableCell>
										<TableCell align="left">
											<div style={{ fontSize: 12, fontWeight: '700' }}>${row.package_price}</div>
										</TableCell>
										<TableCell>
											<div className="flex flex-col">
												<div style={{ fontSize: '12px', fontWeight: '700', color: '#000' }}>
													{moment.utc(row?.created_at).local().format('L')}
												</div>
												<div className="subscribe-date" style={{ fontSize: '10px' }}>
													{moment.utc(row?.created_at).local().format('LT')}
												</div>
											</div>
										</TableCell>
									</TableRow>
								))
							)}
							{fetchingMore ? (
								<TableRow>
									<TableCell align="center" colSpan={8}>
										<CircularProgress />
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
