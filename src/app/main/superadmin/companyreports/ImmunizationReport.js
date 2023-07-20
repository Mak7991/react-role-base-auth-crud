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
import './companyReport.css';
import moment from 'moment';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload } from '@fortawesome/free-solid-svg-icons';
import { getImmunizationsReport } from 'app/services/reports/reports';
import { getRoomsfilter, getAllSchools } from 'app/services/CompanyReports/companyReports';
import { getImmunizations } from 'app/services/immunizations/Immunization';
import { Close } from '@material-ui/icons';
import dayjs from 'dayjs';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useReactToPrint } from 'react-to-print';
import { generateAgeString, getAgeDetails } from 'utils/utils';

function ImmunizationReport() {
	const dispatch = useDispatch();
	const user = useSelector(({ auth }) => auth.user);
	const [rows, setRows] = useState([]);
	const [isLoading, setIsLoading] = useState(false);
	const [hasMore, setHasMore] = useState(false);
	const [firstLoad, setFirstLoad] = useState(true);
	const [fetchingMore, setFetchingMore] = useState(false);
	const [page, setPage] = useState(1);
	const [allSchoolPage, setAllSchoolPage] = useState(1);
	const [roomPage, setRoomPage] = useState(1);
	const [schools, setSchools] = useState([]);
	const [rooms, setRooms] = useState([]);
	const [filters, setFilters] = useState({
		school_id: '',
		name: '',
		room_id: '',
		status: '',
		date_from: '',
		date_to: '',
		export: 0
	});
	const [isLoadingExport, setIsLoadingExport] = useState(false);
	const [immunizations, setImmunizations] = useState([]);
	const date = new Date();
	const studentAgeRef = useRef(null);

	const handlePrint = useReactToPrint({
		content: () => studentAgeRef.current
	});

	const handleFilters = ev => {
		const { name, value } = ev.target;
		if (name === 'school_id') {
			setRooms([]);
			setRoomPage(1);
		}
		setFilters({ ...filters, [name]: value });
	};

	useEffect(() => {
		getRoomsfilter(roomPage, filters?.school_id == 'All' ? '' : filters?.school_id)
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
	}, [roomPage, filters?.school_id, dispatch]);

	useEffect(() => {
		getAllSchools('', '', '', allSchoolPage).then(res => {
			setSchools(schools.concat(res.data.data));
			if (res.data.last_page > res.data.current_page) {
				setAllSchoolPage(res.data.current_page + 1);
			}
		});
	}, [allSchoolPage]);

	useEffect(() => {
		getImmunizations().then(res => setImmunizations(res.data));
	}, []);

	const handleExport = () => {
		setIsLoadingExport(true);
		getImmunizationsReport(
			1,
			filters.name,
			filters.school_id === 'All' ? '' : filters.school_id,
			filters.room_id === 'All' ? '' : filters.room_id,
			filters.status,
			filters.date_from === '5yearsorabove' ? '' : filters.date_from,
			filters.date_to === '0' ? '' : filters.date_to
		)
			.then(res => {
				const blob = new Blob([res.data], {
					type: 'text/csv'
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
		getImmunizationsReport(
			0, // Zero for export
			filters.name,
			filters.school_id === 'All' ? '' : filters.school_id,
			filters.room_id === 'All' ? '' : filters.room_id,
			filters.status,
			filters.date_from === '5yearsorabove' ? '' : filters.date_from,
			filters.date_to === '0' ? '' : filters.date_to,
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
		setPage(1);
	};

	const handleLoadMore = () => {
		setFetchingMore(true);
		getImmunizationsReport(
			0, // Zero for export
			filters.name,
			filters.school_id === 'All' ? '' : filters.school_id,
			filters.room_id === 'All' ? '' : filters.room_id,
			filters.status,
			filters.date_from === '5yearsorabove' ? '' : filters.date_from,
			filters.date_to === '0' ? '' : filters.date_to,
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

	const getFilterValue = months => {
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
										history.goBack();
									}}
								>
									<img src="assets/images/arrow-long.png" alt="filter" width="24px" className="" />
								</IconButton>
							</span>{' '}
							<span className="text-xl self-end font-bold mr-28">Immunization Record</span>
						</h1>
						<p>All Immunization by School, Room or Students</p>
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

				<div className="flex items-center flex-nowrap justify-end">
					<span className="text-2xl self-end font-extrabold mr-28" />
					<div className="flex justify-between">
						<div className="flex">
							<div className="mx-4">
								<TextField
									onChange={handleFilters}
									id="search-input"
									value={filters.name}
									label="Search By Student"
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
							<div className="mx-4">
								<FormControl>
									<InputLabel id="school_id">School</InputLabel>
									<Select
										name="school_id"
										onChange={handleFilters}
										labelId="school_id"
										id="school_id"
										label="School"
										value={filters.school_id}
										style={{ width: 120 }}
										endAdornment={
											filters.school_id ? (
												<IconButton id="clear-room-filter" size="small" className="mr-16">
													<Close
														onClick={() => {
															setRoomPage(1);
															setRooms([]);
															setFilters({
																...filters,
																school_id: ''
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
										{schools.length ? (
											schools.map(school => {
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
							<div className="mx-4">
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
							<div className="mx-4">
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
						<div className="mx-4">
							<FormControl>
								<InputLabel id="date_to">Min Age</InputLabel>
								<Select
									name="date_to"
									labelId="date_to"
									id="date_to"
									label="date_to"
									value={filters.date_to}
									onChange={ev => {
										if (ev.target.value === '0') {
											setFilters({
												...filters,
												date_to: '0'
											});
										} else {
											setFilters({
												...filters,
												date_to: ev.target.value
											});
										}
									}}
									style={{ width: 130 }}
									endAdornment={
										filters.date_to ? (
											<IconButton id="clear-room-filter" size="small" className="mr-16">
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
						<div className="mx-4">
							<FormControl>
								<InputLabel id="date_from">Max Age</InputLabel>
								<Select
									name="date_from"
									labelId="date_from"
									id="date_from"
									label="date_from"
									value={filters.date_from}
									onChange={ev => {
										if (ev.target.value === '5yearsorabove') {
											setFilters({
												...filters,
												date_from: '5yearsorabove'
											});
										} else {
											setFilters({
												...filters,
												date_from: ev.target.value
											});
										}
									}}
									style={{ width: 130 }}
									endAdornment={
										filters.date_from ? (
											<IconButton id="clear-room-filter" size="small" className="mr-16">
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
											!filters.date_to &&
											!filters.school_id
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
					<style type="text/css" media="print">
						{' @page { size: landscape; } '}
					</style>
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
						<div style={{ marginBottom: '10px' }}>
							<span>
								<strong>Date: </strong>
							</span>
							<span>{moment(date).format('dddd, DD MMMM YYYY')}</span>
						</div>
						<div className="pdf-heading">
							<h1 className="font-extrabold">Immunization Record</h1>
						</div>
						<div className="table-wrapper rounded-lg bg-white w-full mt-12 overflow-auto">
							<div className="mx-32 border-b">
								<div className="grid grid-cols-14 studentTableHeader">
									<div className="p-16 pl-0 col-span-3 ">Student</div>
									<div className="p-16 px-8 border-l">Dose</div>
									{immunizations.map(immu => {
										return <div className="p-16 px-8 border-l">{immu.name.split('-')[0]}</div>;
									})}
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
									{rows.map(row => {
										const age = getAgeDetails(dayjs(row.date_of_birth), dayjs());
										return (
											<div className="mx-32 grid grid-cols-14 overflow-auto border-b">
												<div
													className="flex col-span-3 pt-12"
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
														<div className="font-normal  student-age-font" style={{ width: '90px' }}>
															{generateAgeString(row.date_of_birth)}
														</div>
													</div>
												</div>
												<div className="dose flex flex-col">
													{[1, 2, 3, 4, 5].map(i => (
														<div
															style={{ placeContent: 'center' }}
															className={`flex p-6 py-12 border-l ${i !== 5 ? 'border-b' : ''
																}`}
														>
															{i}
														</div>
													))}
												</div>
												{immunizations.map(immu => {
													const im = row?.immunizations?.find(
														i => i?.immunization_id === immu.id && i.is_enabled
													);
													return (
														<div className="immu flex flex-col border-l">
															{!!im?.is_exempted && (
																<div
																	className="flex items-center justify-center flex-grow imunizationData"
																	style={{
																		backgroundColor: '#FFF8C7',
																		fontSize: '12px'
																	}}
																>
																	Exempted
																</div>
															)}
															{!im?.is_exempted &&
																im?.meta.map(dose => (
																	<div
																		style={{
																			backgroundColor: dose?.is_exempted
																				? '#4DA0EE'
																				: dose.date ||
																					dose.skip ||
																					Number(dose.is_recurring)
																					? 'white'
																					: dose.max_duration >= age.allMonths
																						? '#DFFFED'
																						: '#FFEBEA',
																			minHeight: '44.59px'
																		}}
																		className="dose flex flex-row justify-between p-6 py-12 border-b imunizationData"
																	>
																		<div>
																			{dose?.is_exempted
																				? 'Exempted'
																				: dose.skip
																					? 'Skipped'
																					: Number(dose.is_recurring)
																						? dose.duration_text
																						: dose.date
																							? dose.date
																							: dose.max_duration >= age.allMonths
																								? 'Due'
																								: 'Overdue'}
																		</div>
																	</div>
																))}
															{!im?.is_exempted &&
																Array.from(
																	Array(
																		5 -
																		row.immunizations.filter(
																			imm =>
																				imm.immunization_id === immu.id &&
																				imm.is_enabled
																		)[0]?.meta.length || 0
																	).keys()
																).map((e, i, arr) => {
																	return (
																		<div
																			className={`dose flex flex-row justify-between p-6 py-12 ${i !== arr.length - 1 ? 'border-b' : ''
																				}`}
																		>
																			<div style={{ color: 'transparent' }}>
																				due
																			</div>
																		</div>
																	);
																})}
														</div>
													);
												})}
											</div>
										);
									})}
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
					className="table-wrapper rounded-lg bg-white w-full mt-24 overflow-auto"
					style={{ height: '55vh' }}
				>
					<div className="mx-32 border-b">
						<div className="grid grid-cols-14 studentTableHeader">
							<div className="p-16 pl-0 col-span-3 ">Student</div>
							<div className="p-16 px-8 border-l">Dose</div>
							{immunizations.map(immu => {
								return <div className="p-16 px-8 border-l">{immu.name.split('-')[0]}</div>;
							})}
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
							{rows.map(row => {
								const age = getAgeDetails(dayjs(row.date_of_birth), dayjs());
								return (
									<div className="mx-32 grid grid-cols-14 overflow-auto border-b">
										<div
											className="flex col-span-3 pt-12"
										// onClick={() => goTostudentInformation(row)}
										>
											<Avatar className="mr-6" alt="student-face" src={row?.photo} />
											<div className="flex flex-col items-start">
												<div className="allergy-homeroom font-bold truncate break-word">
													{row?.home_room?.name}
												</div>
												<div className="report-staff truncate break-word">{row?.full_name}</div>
												<div className="font-normal student-age-font" style={{ width: '90px' }}>
													{generateAgeString(row.date_of_birth)}
												</div>
											</div>
										</div>
										<div className="dose flex flex-col">
											{[1, 2, 3, 4, 5].map(i => (
												<div
													style={{ placeContent: 'center' }}
													className={`flex p-6 py-12 border-l ${i !== 5 ? 'border-b' : ''}`}
												>
													{i}
												</div>
											))}
										</div>
										{immunizations.map(immu => {
											const im = row?.immunizations?.find(
												i => i?.immunization_id === immu.id && i.is_enabled
											);
											return (
												<div className="immu flex flex-col border-l">
													{!!im?.is_exempted && (
														<div
															// className="flex items-center justify-center flex-grow imunizationData"
															className="imunizationDateExempted"
														// style={{ backgroundColor: '#FFF8C7', fontSize: 12 }}
														>
															Exempted
														</div>
													)}
													{!im?.is_exempted &&
														im?.meta.map(dose => (
															<div
																style={{
																	backgroundColor: dose?.is_exempted
																		? '#4DA0EE'
																		: dose.date ||
																			dose.skip ||
																			Number(dose.is_recurring)
																			? 'white'
																			: dose.max_duration >= age.allMonths
																				? '#DFFFED'
																				: '#FFEBEA',
																	minHeight: '44.59px'
																}}
																className="dose flex flex-row justify-center p-6 py-12 border-b imunizationData"
															>
																<div
																	// style={{
																	// 	fontSize: dose.date ? 'x-small' : '',
																	// 	fontWeight: dose.date ? '800' : '',
																	// 	display: dose.date ? 'contents' : ''
																	// }}
																	className="imunizationDateComp"
																>
																	{dose?.is_exempted
																		? 'Exempted'
																		: dose.skip
																			? 'Skipped'
																			: Number(dose.is_recurring)
																				? dose.duration_text
																				: dose.date
																					? dose.date
																					: dose.max_duration >= age.allMonths
																						? 'Due'
																						: 'Overdue'}
																</div>
															</div>
														))}
													{!im?.is_exempted &&
														Array.from(
															Array(
																5 -
																row.immunizations.filter(
																	imm =>
																		imm.immunization_id === immu.id &&
																		imm.is_enabled
																)[0]?.meta.length || 0
															).keys()
														).map((e, i, arr) => {
															return (
																<div
																	className={`dose flex flex-row justify-between p-6 py-12 ${i !== arr.length - 1 ? 'border-b' : ''
																		}`}
																>
																	<div style={{ color: 'transparent' }}>due</div>
																</div>
															);
														})}
												</div>
											);
										})}
									</div>
								);
							})}
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
