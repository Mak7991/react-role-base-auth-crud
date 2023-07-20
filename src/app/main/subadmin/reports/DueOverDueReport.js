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
import { getImmunizationsReport, getRooms } from 'app/services/reports/reports';
import { getImmunizations } from 'app/services/immunizations/Immunization';
import { Close } from '@material-ui/icons';
import dayjs from 'dayjs';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useReactToPrint } from 'react-to-print';
import { generateAgeString, getAgeDetails } from 'utils/utils';

let memo = {};

function ImmunizationReport() {
	const dispatch = useDispatch();
	const user = useSelector(({ auth }) => auth.user);
	let positiveRecords = 0;
	const [rows, setRows] = useState([]);
	const [isLoading, setIsLoading] = useState(false);
	const [hasMore, setHasMore] = useState(false);
	const [firstLoad, setFirstLoad] = useState(true);
	const [fetchingMore, setFetchingMore] = useState(false);
	const [fromDate1, setFromDate1] = useState();
	const [toDate1, setToDate1] = useState();
	const [page, setPage] = useState(1);
	const [filters, setFilters] = useState({
		school_id: user?.school?.id || user?.data?.school?.id,
		name: '',
		room_id: '',
		status: '',
		date_from: '',
		date_to: '',
		export: 0,
	});
	const [rooms, setRooms] = useState([]);
	const [roomPage, setRoomPage] = useState(1);
	const [isLoadingExport, setIsLoadingExport] = useState(false);
	const [immunizationsList, setImmunizationsList] = useState([]);
	const date = new Date();
	const studentAgeRef = useRef(null);

	const handlePrint = useReactToPrint({
		content: () => studentAgeRef.current,
	});

	const handleFilters = (ev) => {
		const { name, value } = ev.target;
		setFilters({ ...filters, [name]: value });
	};

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
		getImmunizations().then((res) => setImmunizationsList(res.data));
	}, [roomPage, dispatch]);

	const handleExport = () => {
		setIsLoadingExport(true);
		getImmunizationsReport(
			1,
			filters.name,
			filters.school_id,
			filters.room_id === 'All' ? '' : filters.room_id,
			filters.status,
			filters.date_from === '5yearsorabove' ? '' : filters.date_from,
			filters.date_to === '0' ? '' : filters.date_to,
			'', // no page in export
			1 // 1 for due overdue format change
		)
			.then((res) => {
				const blob = new Blob([res.data], {
					type: 'text/csv',
				});
				const link = document.createElement('a');
				link.setAttribute('target', '_blank');
				link.href = window.URL.createObjectURL(blob);
				link.setAttribute('download', `student-immunization-report-${new Date().getTime()}.csv`);
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

	const ApplyFilters = () => {
		memo = {};
		setRows([]);
		setIsLoading(true);
		setFirstLoad(false);
		getImmunizationsReport(
			0, // Zero for export
			filters.name,
			filters.school_id,
			filters.room_id === 'All' ? '' : filters.room_id,
			filters.status,
			filters.date_from === '5yearsorabove' ? '' : filters.date_from,
			filters.date_to === '0' ? '' : filters.date_to,
			1
		)
			.then((res) => {
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

	const handleLoadMore = () => {
		setFetchingMore(true);
		getImmunizationsReport(
			0, // Zero for export
			filters.name,
			filters.school_id,
			filters.room_id === 'All' ? '' : filters.room_id,
			filters.status,
			filters.date_from === '5yearsorabove' ? '' : filters.date_from,
			filters.date_to === '0' ? '' : filters.date_to,
			page
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

	const findNextDoseIndex = (im, age, memoizedData) => {
		const doses = im.meta;
		if (memoizedData[im.id]) {
			return memoizedData[im.id];
		}
		// console.log(doses);
		// console.log(age);
		for (let i = 0; i < doses.length; i += 1) {
			if (!doses[i].date && !doses[i].skip) {
				// console.log('No date and not skipped');
				if (!Number(doses[i].is_recurring)) {
					// console.log('Not recurring');
					if (
						age.allMonths >= Number(doses[i].min_duration) - 1 &&
						age.allMonths <= Number(doses[i].max_duration) - 1
					) {
						// console.log('Age is in range');
						memo[im.id] = i;
						return i;
					}
					// console.log('Age is not in range');
				} else if (age.allMonths % Number(doses[i].min_duration) === Number(doses[i].min_duration) - 1) {
					// console.log('recurring and 1 month before');
					memo[im.id] = i;
					return i;
				}
			}
		}
		memo[im.id] = -1;
		return -1;
	};

	const findOverdueIn30Days = (dose, age) => {
		if (!Number(dose.is_recurring) && age.allMonths === Number(dose.max_duration) - 1) {
			return true;
		}
		return false;
	};

	const getFilterValue = (months) => {
		const d = new Date();
		// subtract months from d
		d.setMonth(d.getMonth() - months);
		return dayjs(d).format('YYYY-MM-DD');
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
							<span className="text-xl self-end font-bold mr-28">Immunization Due/Over Due </span>
						</h1>
						<p>
							Use a CDC schedules and information about Immunization form each student profile to
							calculate which shots are upcoming and overdue
						</p>
					</div>
					<div className="flex justify-between">
						<div className="flex">
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
							<CustomButton onClick={() => handlePrint()} variant="secondary" height="40px" width="100px">
								<i className="fa fa-print" aria-hidden="true" /> Print
							</CustomButton>
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
									label="Search"
									name="name"
									style={{ width: 150 }}
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
									<InputLabel id="status">Student's Status</InputLabel>
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
																status: '',
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
									value={filters.date_to}
									onChange={(ev) => {
										if (ev.target.value === '0') {
											setFilters({
												...filters,
												date_to: '0',
											});
										} else {
											setFilters({
												...filters,
												date_to: ev.target.value,
											});
										}
									}}
									style={{ width: 150 }}
									endAdornment={
										filters.date_to ? (
											<IconButton id="date_to" size="small" className="mr-16">
												<Close
													onClick={() => {
														setFilters({
															...filters,
															date_to: '',
														});
														setToDate1('');
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
									<MenuItem value={getFilterValue(6)}>6 month</MenuItem>
									<MenuItem value={getFilterValue(1 * 12)}>1 years</MenuItem>
									<MenuItem value={getFilterValue(1.5 * 12)}>1.5 years</MenuItem>
									<MenuItem value={getFilterValue(2 * 12)}>2 years</MenuItem>
									<MenuItem value={getFilterValue(2.5 * 12)}>2.5 years</MenuItem>
									<MenuItem value={getFilterValue(3 * 12)}>3 years</MenuItem>
									<MenuItem value={getFilterValue(3.5 * 12)}>3.5 years</MenuItem>
									<MenuItem value={getFilterValue(4 * 12)}>4 years</MenuItem>
									<MenuItem value={getFilterValue(4.5 * 12)}>4.5 years</MenuItem>
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
									onChange={(ev) => {
										if (ev.target.value === '5yearsorabove') {
											setFilters({
												...filters,
												date_from: '5yearsorabove',
											});
										} else {
											setFilters({
												...filters,
												date_from: ev.target.value,
											});
										}
									}}
									style={{ width: 150 }}
									endAdornment={
										filters.date_from ? (
											<IconButton id="date_from" size="small" className="mr-16">
												<Close
													onClick={() => {
														setFilters({
															...filters,
															date_from: '',
														});
														setFromDate1('');
													}}
													fontSize="small"
												/>
											</IconButton>
										) : (
											''
										)
									}
								>
									<MenuItem value={getFilterValue(6)}>6 month</MenuItem>
									<MenuItem value={getFilterValue(1 * 12)}>1 years</MenuItem>
									<MenuItem value={getFilterValue(1.5 * 12)}>1.5 years</MenuItem>
									<MenuItem value={getFilterValue(2 * 12)}>2 years</MenuItem>
									<MenuItem value={getFilterValue(2.5 * 12)}>2.5 years</MenuItem>
									<MenuItem value={getFilterValue(3 * 12)}>3 years</MenuItem>
									<MenuItem value={getFilterValue(3.5 * 12)}>3.5 years</MenuItem>
									<MenuItem value={getFilterValue(4 * 12)}>4 years</MenuItem>
									<MenuItem value={getFilterValue(4.5 * 12)}>4.5 years</MenuItem>
									<MenuItem value="5yearsorabove">5 years or above</MenuItem>
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
						<div style={{ marginBottom: '10px' }}>
							<span>
								<strong>Date: </strong>
							</span>
							<span>{moment(date).format('dddd, DD MMMM YYYY')}</span>
						</div>
						<div className="pdf-heading">
							<h1 className="font-extrabold">Immunization Due / Overdue Report</h1>
						</div>
						<div className="rounded-lg bg-white w-full mt-12 overflow-auto">
							<div className="mx-32 border-b">
								<div className="grid grid-cols-11 dueoverdueHeader">
									<div className="p-16 pl-0 col-span-2">Student</div>
									<div className="p-16 px-8 border-l col-span-3 flex justify-center">
										Due With in Next 30 Days
									</div>
									<div className="p-16 px-8 border-l col-span-3 flex justify-center">
										CDC Recommendation
									</div>
									<div className="p-16 px-8 border-l col-span-3 flex justify-center">
										Overdue With in Next 30 Days
									</div>
								</div>
							</div>
							{firstLoad ? (
								<div className="flex flex-row justify-center items-center" style={{ height: '70%' }}>
									Please Generate Your Report
								</div>
							) : isLoading ? (
								<div className="flex justify-center items-center" style={{ height: '70%' }}>
									<CircularProgress />
								</div>
							) : rows.length > 0 ? (
								<>
									{rows
										.filter(
											(row) =>
												row.immunizations.filter((i) => i.is_enabled && !i.is_exempted).length
										)
										.map((row) => {
											const age = getAgeDetails(dayjs(row.date_of_birth), dayjs());
											const imms = row.immunizations.filter(
												(i) => i.is_enabled && !i.is_exempted
											);
											let flag = false;
											for (let i = 0; i < imms.length; i += 1) {
												const nextDoseIndex = findNextDoseIndex(imms[i], age, memo);
												console.log(nextDoseIndex);
												if (nextDoseIndex !== -1) {
													flag = true;
													positiveRecords++;
													break;
												}
											}
											console.log(flag);
											if (flag) {
												return (
													<div className="mx-32 grid grid-cols-11 overflow-auto border-b">
														<div
															className="flex col-span-2 py-16"
															// onClick={() => goTostudentInformation(row)}
														>
															<Avatar
																className="mr-6"
																alt="student-face"
																src={row?.photo}
															/>
															<div className="flex flex-col items-start">
																<div className="allergy-homeroom truncate break-word font-bold">
																	{row?.home_room?.name}
																</div>
																<div className="report-staff truncate break-word">
																	{row?.full_name}
																</div>
																<div
																	className="font-normal student-age-font"
																	style={{ width: '90px' }}
																>
																	{generateAgeString(row.date_of_birth)}
																</div>
															</div>
														</div>
														{row.immunizations
															.filter((i) => i.is_enabled && !i.is_exempted)
															.map((immunization, i, arr) => {
																const nextDoseIndex = findNextDoseIndex(
																	immunization,
																	age,
																	memo
																);
																if (nextDoseIndex === -1) {
																	return '';
																}
																const overduein30days = findOverdueIn30Days(
																	immunization.meta[nextDoseIndex],
																	age
																);
																return (
																	nextDoseIndex !== -1 && (
																		<>
																			<div
																				className={`dueoverdueText col-span-3 flex flex-col py-16 border-l ${
																					overduein30days
																						? 'bg-red-100'
																						: 'bg-green-100'
																				} ${
																					i !== arr.length - 1
																						? 'border-b'
																						: ''
																				}`}
																				style={{
																					placeContent: 'center',
																					placeItems: 'center',
																				}}
																			>
																				<div>
																					{
																						immunizationsList
																							.filter(
																								(im) =>
																									immunization.immunization_id ===
																									im.id
																							)[0]
																							?.name.split('-')[0]
																					}
																				</div>
																				<div className="dose-number">
																					Dose {nextDoseIndex + 1}
																				</div>
																			</div>
																			<div
																				className={`dueoverdueText flex col-span-3 py-16 border-l ${
																					overduein30days
																						? 'bg-red-100'
																						: 'bg-green-100'
																				} ${
																					i !== arr.length - 1
																						? 'border-b'
																						: ''
																				}`}
																				style={{
																					placeContent: 'center',
																					placeItems: 'center',
																				}}
																			>
																				{
																					immunization.meta[nextDoseIndex]
																						.duration_text
																				}
																			</div>
																			<div
																				className={`dueoverdueText flex col-span-3 py-16 border-l ${
																					overduein30days
																						? 'bg-red-100'
																						: 'bg-green-100'
																				} ${
																					i !== arr.length - 1
																						? 'border-b'
																						: ''
																				}`}
																				style={{
																					placeContent: 'center',
																					placeItems: 'center',
																				}}
																			>
																				{overduein30days ? 'Yes' : 'No'}
																			</div>
																			<div className="col-span-2" />
																		</>
																	)
																);
															})}
													</div>
												);
											}
											return '';
										})}
									{positiveRecords === 0 && (
										<div className="flex justify-center items-center" style={{ height: '70%' }}>
											<Typography variant="h6">No upcoming due immunization</Typography>
										</div>
									)}
									{fetchingMore && (
										<div className="flex justify-center items-center">
											<CircularProgress size={35} />
										</div>
									)}
								</>
							) : (
								<div className="flex justify-center items-center" style={{ height: '70%' }}>
									<Typography variant="h6">No data found</Typography>
								</div>
							)}
						</div>
					</div>
				</div>
				<div
					id="Scrollable-table"
					className="due-overdue-table-wrapper rounded-lg bg-white w-full mt-12 overflow-auto"
				>
					<div className="mx-32 border-b">
						<div className="grid grid-cols-11 dueoverdueHeader">
							<div className="p-16 pl-0 col-span-2">Student</div>
							<div className="p-16 px-8 border-l col-span-3 flex justify-center">
								Due With in Next 30 Days
							</div>
							<div className="p-16 px-8 border-l col-span-3 flex justify-center">CDC Recommendation</div>
							<div className="p-16 px-8 border-l col-span-3 flex justify-center">
								Overdue With in Next 30 Days
							</div>
						</div>
					</div>
					{firstLoad ? (
						<div className="flex flex-row justify-center items-center" style={{ height: '70%' }}>
							Please Generate Your Report
						</div>
					) : isLoading ? (
						<div className="flex justify-center items-center" style={{ height: '70%' }}>
							<CircularProgress />
						</div>
					) : rows.length > 0 ? (
						<>
							{rows
								.filter((row) => row.immunizations.filter((i) => i.is_enabled && !i.is_exempted).length)
								.map((row) => {
									const age = getAgeDetails(dayjs(row.date_of_birth), dayjs());
									const imms = row.immunizations.filter((i) => i.is_enabled && !i.is_exempted);
									let flag = false;
									for (let i = 0; i < imms.length; i += 1) {
										const nextDoseIndex = findNextDoseIndex(imms[i], age, memo);
										if (nextDoseIndex !== -1) {
											flag = true;
											break;
										}
									}
									if (flag) {
										return (
											<div className="mx-32 grid grid-cols-11 overflow-auto border-b">
												<div
													className="flex col-span-2 py-16"
													// onClick={() => goTostudentInformation(row)}
												>
													<Avatar className="mr-6" alt="student-face" src={row?.photo} />
													<div className="flex flex-col items-start">
														<div className="allergy-homeroom truncate break-word font-bold">
															{row?.home_room?.name}
														</div>
														<div className="report-staff truncate break-word">
															{row?.full_name}
														</div>
														<div
															className="font-normal student-age-font"
															style={{ width: '90px' }}
														>
															{generateAgeString(row.date_of_birth)}
														</div>
													</div>
												</div>
												{row.immunizations
													.filter((i) => i.is_enabled && !i.is_exempted)
													.map((immunization, i, arr) => {
														const nextDoseIndex = findNextDoseIndex(
															immunization,
															age,
															memo
														);
														if (nextDoseIndex === -1) {
															return '';
														}
														const overduein30days = findOverdueIn30Days(
															immunization.meta[nextDoseIndex],
															age
														);
														return (
															nextDoseIndex !== -1 && (
																<>
																	<div
																		className={`dueoverdueText col-span-3 flex flex-col py-16 border-l ${
																			overduein30days
																				? 'bg-red-100'
																				: 'bg-green-100'
																		} ${i !== arr.length - 1 ? 'border-b' : ''}`}
																		style={{
																			placeContent: 'center',
																			placeItems: 'center',
																		}}
																	>
																		<div>
																			{
																				immunizationsList
																					.filter(
																						(im) =>
																							immunization.immunization_id ===
																							im.id
																					)[0]
																					?.name.split('-')[0]
																			}
																		</div>
																		<div className="dose-number">
																			Dose {nextDoseIndex + 1}
																		</div>
																	</div>
																	<div
																		className={`dueoverdueText flex col-span-3 py-16 border-l ${
																			overduein30days
																				? 'bg-red-100'
																				: 'bg-green-100'
																		} ${i !== arr.length - 1 ? 'border-b' : ''}`}
																		style={{
																			placeContent: 'center',
																			placeItems: 'center',
																		}}
																	>
																		{immunization.meta[nextDoseIndex].duration_text}
																	</div>
																	<div
																		className={`dueoverdueText flex col-span-3 py-16 border-l ${
																			overduein30days
																				? 'bg-red-100'
																				: 'bg-green-100'
																		} ${i !== arr.length - 1 ? 'border-b' : ''}`}
																		style={{
																			placeContent: 'center',
																			placeItems: 'center',
																		}}
																	>
																		{overduein30days ? 'Yes' : 'No'}
																	</div>
																	<div className="col-span-2" />
																</>
															)
														);
													})}
											</div>
										);
									}
									return '';
								})}
							{positiveRecords === 0 && (
								<div className="flex justify-center items-center" style={{ height: '70%' }}>
									<Typography variant="h6">No upcoming due immunization</Typography>
								</div>
							)}
							{fetchingMore && (
								<div className="flex justify-center items-center">
									<CircularProgress size={35} />
								</div>
							)}
						</>
					) : (
						<div className="flex justify-center items-center" style={{ height: '70%' }}>
							<Typography variant="h6">No data found</Typography>
						</div>
					)}
				</div>
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
export default ImmunizationReport;
