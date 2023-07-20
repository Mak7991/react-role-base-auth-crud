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
	TextField,
	InputAdornment,
	Typography
} from '@material-ui/core';
import FuseAnimate from '@fuse/core/FuseAnimate';
import { useDispatch, useSelector } from 'react-redux';
import * as Actions from 'app/store/actions';
import CustomButton from 'app/customComponents/CustomButton/CustomButton';
import './Reports.css';
import moment from 'moment';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload } from '@fortawesome/free-solid-svg-icons';
import { getStudentsAge, getRooms } from 'app/services/reports/reports';
import { Close } from '@material-ui/icons';
import dayjs from 'dayjs';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useReactToPrint } from 'react-to-print';
import { generateAgeString } from 'utils/utils';

function Age() {
	const dispatch = useDispatch();
	const user = useSelector(({ auth }) => auth.user);
	const [rows, setRows] = useState([]);
	const [isLoading, setIsLoading] = useState(false);
	const [hasMore, setHasMore] = useState(false);
	const [firstLoad, setFirstLoad] = useState(true);
	const [fetchingMore, setFetchingMore] = useState(false);
	const [fromDate1, setFromDate1] = useState();
	const [toDate1, setToDate1] = useState();
	const [page, setPage] = useState(1);
	const [filters, setFilters] = useState({
		export_id: 0,
		name: '',
		school_id: user?.school?.id || user?.data?.school?.id,
		room_id: '',
		status: '',
		date_from: '',
		date_to: ''
	});
	const [rooms, setRooms] = useState([]);
	const [roomPage, setRoomPage] = useState(1);
	const [isLoadingExport, setIsLoadingExport] = useState(false);
	const date = new Date();
	const studentAgeRef = useRef(null);
	console.log(toDate1);

	const handlePrint = useReactToPrint({
		content: () => studentAgeRef.current
	});

	const handleFilters = ev => {
		const { name, value } = ev.target;
		setFilters({ ...filters, [name]: value });
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

	const handleExport = () => {
		if (filters.date_from === '0') {
			const dateTo = new Date();
			dateTo.setMonth(dateTo.getMonth() - filters.date_to);
			setToDate1(dateTo);
			setIsLoadingExport(true);
			getStudentsAge(
				1,
				filters.name,
				filters.school_id,
				filters.room_id === 'All' ? '' : filters.room_id,
				filters.status,
				'',
				dayjs(dateTo).format('YYYY-MM-DD')
			)
				.then(res => {
					const blob = new Blob([res.data], {
						type: 'text/csv'
					});
					const link = document.createElement('a');
					link.setAttribute('target', '_blank');
					link.href = window.URL.createObjectURL(blob);
					link.setAttribute('download', `StudentAge_report_${new Date().getTime()}.csv`);
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
		} else if (filters.date_from === '' && filters.date_to === '') {
			setIsLoadingExport(true);
			getStudentsAge(
				1,
				filters.name,
				filters.school_id,
				filters.room_id === 'All' ? '' : filters.room_id,
				filters.status,
				'',
				''
			)
				.then(res => {
					const blob = new Blob([res.data], {
						type: 'text/csv'
					});
					const link = document.createElement('a');
					link.setAttribute('target', '_blank');
					link.href = window.URL.createObjectURL(blob);
					link.setAttribute('download', `StudentAge_report_${new Date().getTime()}.csv`);
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
		} else {
			const dateTo = new Date();
			dateTo.setMonth(dateTo.getMonth() - filters.date_to);
			setToDate1(dateTo);

			const dateFrom = new Date();
			dateFrom.setMonth(dateFrom.getMonth() - filters.date_from);
			setFromDate1(dateFrom);
			setIsLoadingExport(true);
			getStudentsAge(
				1,
				filters.name,
				filters.school_id,
				filters.room_id === 'All' ? '' : filters.room_id,
				filters.status,
				dayjs(dateFrom).format('YYYY-MM-DD'),
				dayjs(dateTo).format('YYYY-MM-DD')
			)
				.then(res => {
					const blob = new Blob([res.data], {
						type: 'text/csv'
					});
					const link = document.createElement('a');
					link.setAttribute('target', '_blank');
					link.href = window.URL.createObjectURL(blob);
					link.setAttribute('download', `StudentAge_report_${new Date().getTime()}.csv`);
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
		}
	};

	const ApplyFilters = () => {
		if (filters.date_from === '0') {
			setRows([]);
			setIsLoading(true);
			setFirstLoad(false);
			const dateTo = new Date();
			dateTo.setMonth(dateTo.getMonth() - filters.date_to);
			setToDate1(dateTo);
			const timeout = setTimeout(
				() => {
					getStudentsAge(
						filters.export_id,
						filters.name,
						filters.school_id,
						filters.room_id === 'All' ? '' : filters.room_id,
						filters.status,
						'',
						dayjs(dateTo).format('YYYY-MM-DD'),
						1
					)
						.then(res => {
							setFirstLoad(false);
							setRows(res.data.data || []);
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
		}
		if (filters.date_from === '' && filters.date_to === '') {
			setRows([]);
			setIsLoading(true);
			setFirstLoad(false);
			const timeout = setTimeout(
				() => {
					getStudentsAge(
						filters.export_id,
						filters.name,
						filters.school_id,
						filters.room_id === 'All' ? '' : filters.room_id,
						filters.status,
						'',
						'',
						1
					)
						.then(res => {
							setFirstLoad(false);
							setRows(res.data.data || []);
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
		}
		setRows([]);
		setIsLoading(true);
		setFirstLoad(false);

		const dateTo = new Date();
		dateTo.setMonth(dateTo.getMonth() - filters.date_to);
		setToDate1(dateTo);

		const dateFrom = new Date();
		dateFrom.setMonth(dateFrom.getMonth() - filters.date_from);
		setFromDate1(dateFrom);

		const timeout = setTimeout(
			() => {
				getStudentsAge(
					filters.export_id,
					filters.name,
					filters.school_id,
					filters.room_id === 'All' ? '' : filters.room_id,
					filters.status,
					dayjs(dateFrom).format('YYYY-MM-DD'),
					dayjs(dateTo).format('YYYY-MM-DD'),
					1
				)
					.then(res => {
						setFirstLoad(false);
						setRows(res.data.data || []);
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

	const handleLoadMore = () => {
		if (filters.date_from === '0') {
			const dateTo = new Date();
			dateTo.setMonth(dateTo.getMonth() - filters.date_to);
			setToDate1(dateTo);
			setFetchingMore(true);
			getStudentsAge(
				filters.export_id,
				filters.name,
				filters.school_id,
				filters.room_id === 'All' ? '' : filters.room_id,
				filters.status,
				'',
				dayjs(dateTo).format('YYYY-MM-DD'),
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
		} else if (filters.date_from === '' && filters.date_to === '') {
			setFetchingMore(true);
			getStudentsAge(
				filters.export_id,
				filters.name,
				filters.school_id,
				filters.room_id === 'All' ? '' : filters.room_id,
				filters.status,
				'',
				'',
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
		} else {
			const dateTo = new Date();
			dateTo.setMonth(dateTo.getMonth() - filters.date_to);
			setToDate1(dateTo);

			const dateFrom = new Date();
			dateFrom.setMonth(dateFrom.getMonth() - filters.date_from);
			setFromDate1(dateFrom);
			setFetchingMore(true);
			getStudentsAge(
				filters.export_id,
				filters.name,
				filters.school_id,
				filters.room_id === 'All' ? '' : filters.room_id,
				filters.status,
				dayjs(dateFrom).format('YYYY-MM-DD'),
				dayjs(dateTo).format('YYYY-MM-DD'),
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
		}
	};

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
							<span className="text-xl self-end font-bold mr-28">Age</span>
						</h1>
						<p>
							Calulate the age, Students will be on a future date and filter students by current age or
							future age{' '}
						</p>
					</div>
					<div className="flex justify-between">
						<div className="flex">
							<div className="self-end ">
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
									value={filters.name}
									label="Search by Student"
									name="name"
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
									<InputLabel id="roomId">Room</InputLabel>
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
										label="status"
										value={filters.status}
										onChange={handleFilters}
										style={{ width: 150 }}
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
						</div>
						<div className="mx-8">
							<FormControl>
								<InputLabel id="date_to_min">Min Age</InputLabel>
								<Select
									id="date_to_select"
									name="date_to"
									labelId="date_to_age"
									label="Min Age"
									onChange={handleFilters}
									value={filters.date_to}
									style={{ width: 150 }}
									endAdornment={
										filters.date_to ? (
											<IconButton id="date_to" size="small" className="mr-16">
												<Close
													onClick={() => {
														setFilters({
															...filters,
															date_to: ''
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
									<MenuItem value="0">0 month</MenuItem>
									<MenuItem value={6}>6 month</MenuItem>
									<MenuItem value={1 * 12}>1 years</MenuItem>
									<MenuItem value={1.5 * 12}>1.5 years</MenuItem>
									<MenuItem value={2 * 12}>2 years</MenuItem>
									<MenuItem value={2.5 * 12}>2.5 years</MenuItem>
									<MenuItem value={3 * 12}>3 years</MenuItem>
									<MenuItem value={3.5 * 12}>3.5 years</MenuItem>
									<MenuItem value={4 * 12}>4 years</MenuItem>
									<MenuItem value={4.5 * 12}>4.5 years</MenuItem>
								</Select>
							</FormControl>
						</div>
						<div className="mx-8">
							<FormControl>
								<InputLabel id="date_from_max">Max Age</InputLabel>
								<Select
									id="date_from_select"
									name="date_from"
									labelId="date_from_age"
									label="Max Age"
									value={filters.date_from}
									onChange={handleFilters}
									style={{ width: 150 }}
									endAdornment={
										filters.date_from ? (
											<IconButton id="date_from" size="small" className="mr-16">
												<Close
													onClick={() => {
														setFilters({
															...filters,
															date_from: ''
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
									<MenuItem value={6}>6 month</MenuItem>
									<MenuItem value={1 * 12}>1 years</MenuItem>
									<MenuItem value={1.5 * 12}>1.5 years</MenuItem>
									<MenuItem value={2 * 12}>2 years</MenuItem>
									<MenuItem value={2.5 * 12}>2.5 years</MenuItem>
									<MenuItem value={3 * 12}>3 years</MenuItem>
									<MenuItem value={3.5 * 12}>3.5 years</MenuItem>
									<MenuItem value={4 * 12}>4 years</MenuItem>
									<MenuItem value={4.5 * 12}>4.5 years</MenuItem>
									<MenuItem value="0">5 years or above</MenuItem>
								</Select>
							</FormControl>
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
						<div ref={studentAgeRef} className="p-32">
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
								<h1 className="font-extrabold">Age</h1>
							</div>
							<Table stickyHeader className="student-table" style={{ width: '100%' }}>
								<TableHead>
									<TableRow>
										<TableCell style={{ width: '30%' }} className="bg-white studentTableHeader">
											Student
										</TableCell>
										<TableCell style={{ width: '40%' }} className="bg-white studentTableHeader">
											Date Of Birth
										</TableCell>
										<TableCell style={{ width: '30%' }} className="bg-white studentTableHeader">
											Age As Of{' '}
											{moment
												.utc(date)
												.local()
												.format('L')}
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
												<TableRow key={row.id}>
													<TableCell style={{ fontWeight: 700 }} component="th" scope="row">
														<div id={`student-${row.id}`} className="flex">
															<Avatar
																className="mr-6"
																alt="student-face"
																src={row.photo}
															/>
															<div className="flex flex-col">
																<div className="student-homeroom ">
																	{row?.home_room?.name}
																</div>
																<div className="student-name break-word">
																	{row.first_name} {row.last_name}
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
																<div className="report-std truncate">
																	{moment
																		.utc(row?.date_of_birth)
																		.local()
																		.format('L')}
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
															<div className="flex items-center justify-content: center">
																<div className="student-report-age ">
																	{generateAgeString(row.date_of_birth)}
																</div>
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
						</div>
					</div>
					<Table stickyHeader className="student-table" style={{ width: '100%' }}>
						<TableHead>
							<TableRow>
								<TableCell style={{ width: '30%' }} className="bg-white studentTableHeader">
									Student
								</TableCell>
								<TableCell style={{ width: '40%' }} className="bg-white studentTableHeader">
									Date Of Birth
								</TableCell>
								<TableCell style={{ width: '30%' }} className="bg-white studentTableHeader">
									Age As Of{' '}
									{moment
										.utc(date)
										.local()
										.format('L')}
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
										No Student Record
									</TableCell>
								</TableRow>
							) : (
								rows?.map(row => {
									return (
										<TableRow key={row.id}>
											<TableCell style={{ fontWeight: 700 }} component="th" scope="row">
												<div id={`student-${row.id}`} className="flex">
													<Avatar className="mr-6" alt="student-face" src={row.photo} />
													<div className="flex flex-col">
														<div className="student-homeroom">{row?.home_room?.name}</div>
														<div className="student-name break-word">
															{row.first_name} {row.last_name}
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
														<div className="report-std truncate">
															{moment
																.utc(row?.date_of_birth)
																.local()
																.format('L')}
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
													<div className="flex items-center justify-content: center">
														<div className="student-report-age">
															{generateAgeString(row.date_of_birth)}
														</div>
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
					dataLength={rows.length}
					next={handleLoadMore}
					hasMore={hasMore}
					scrollableTarget="Scrollable-table"
				/>
			</div>
		</FuseAnimate>
	);
}
export default Age;
