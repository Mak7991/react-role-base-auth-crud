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
	Tooltip
} from '@material-ui/core';
import FuseAnimate from '@fuse/core/FuseAnimate';
import { useDispatch, useSelector } from 'react-redux';
import * as Actions from 'app/store/actions';
import CustomButton from 'app/customComponents/CustomButton/CustomButton';
import dayjs from 'dayjs';
import moment from 'moment';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload } from '@fortawesome/free-solid-svg-icons';
import CustomDatePicker from 'app/customComponents/CustomDatePicker/CustomDatePicker';
import SearchIcon from '@material-ui/icons/Search';
import { getMedications } from 'app/services/reports/reports';
import { Close } from '@material-ui/icons';
import { useReactToPrint } from 'react-to-print';
import { getRooms } from 'app/services/reports/reports';
import InfiniteScroll from 'react-infinite-scroll-component';
import { generateAgeString } from 'utils/utils';
// import ProfileInfoCard from './ProfileInfoCard';

export default function Medications() {
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
	const [fromDate, setFromDate] = useState('');
	const [toDate, setToDate] = useState('');
	const [fromDate1, setFromDate1] = useState();
	const [toDate1, setToDate1] = useState();
	const [page, setPage] = useState(1);
	const [filters, setFilters] = useState({
		room_id: '',
		status: '',
		fromDate: '',
		toDate: '',
		school_id: user.school?.id || user.data?.school?.id
	});

	const [schools, setSchool] = useState([]);
	const [rooms, setRooms] = useState([]);
	const [contact, setContact] = useState('');
	const [allStdPage, setAllStdPage] = useState(1);
	const [studentPage, setStudentPage] = useState(1);
	const [date, setDate] = useState(new Date());
	const [roomPage, setRoomPage] = useState(1);
	const [defaultUser, setDefaultUser] = useState(false);
	const [searchQuery, setSearchQuery] = useState('');

	const handleSearch = e => {
		setSearchQuery(e.target.value);
	};

	const handlePrint = useReactToPrint({
		content: () => checkInReportRef.current
	});

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

	// useEffect(() => {
	// 	const id = setTimeout(
	// 		() => {
	// 			setIsLoading(true);
	// 			setFirstLoad(false);
	// 			getMedications(filters, 1, searchQuery)
	// 				.then(res => {
	// 					if (res.data.last_page > res.data.current_page) {
	// 						setHasMore(true);
	// 					} else {
	// 						setHasMore(false);
	// 					}
	// 					setPage(res.data.current_page + 1);
	// 					setRows(res.data.data);
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
	// 					setIsLoading(false);
	// 				});
	// 		},
	// 		firstLoad ? 0 : 1000
	// 	);

	// 	return _ => {
	// 		clearTimeout(id);
	// 	};
	// 	// eslint-disable-next-line
	// }, []);

	const ApplyFilters = () => {
		setRows([]);
		setIsLoading(true);
		setFirstLoad(false);
		const timeout = setTimeout(
			() => {
				getMedications(filters, 1, searchQuery)
					.then(res => {
						setFirstLoad(false);
						setRows(res.data.data);
						if (res.data.last_page > res.data.current_page) {
							setHasMore(true);
						} else {
							setHasMore(false);
						}
						setPage(res.data.current_page + 1);
						setContact(filters?.contact_type);
						dispatch(
							Actions.showMessage({
								message: 'Report has been generated',
								variant: 'success'
							})
						);
						// setPage(res.data.current_page + 1);
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
		setFetchingMore(true);
		getMedications(filters, page, searchQuery)
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
	};

	const handleExport = () => {
		// setFetchingMore(true);
		// ssetIsLoading(true);
		// const tempLink = document.createElement('a');
		// tempLink.href = `http://localhost:5000/api/v1/medications?export=1&name=${searchQuery}&room_id=${
		// 	filters?.room_id == 'All' ? '' : filters?.room_id
		// }&status=${filters?.status}&date_from=${filters?.fromDate}&date_to=${filters?.toDate}`;
		// tempLink.click();

		ssetIsLoading(true);
		getMedications(filters, 1, searchQuery, 1)
			.then(res => {
				const blob = new Blob([res.data], {
					type: 'text/csv'
				});
				const link = document.createElement('a');
				link.setAttribute('target', '_blank');
				link.href = window.URL.createObjectURL(blob);
				link.setAttribute('download', `Medication_report_${new Date().getTime()}.csv`);
				document.body.appendChild(link);
				link.click();
				// Clean up and remove the link
				link.parentNode.removeChild(link);
				ssetIsLoading(false);
			})
			.catch(err => {
				dispatch(
					Actions.showMessage({
						message: 'Failed to Export',
						variant: 'error'
					})
				);
				ssetIsLoading(false);
			})
			.finally(() => {
				ssetIsLoading(false);
			});
	};

	// const handleProfileCard = (row, self) => {
	// 	dispatch(
	// 		Actions.openDialog({
	// 			children: <ProfileInfoCard row={row} self={self} />
	// 		})
	// 	);
	// };

	// useEffect(() => {
	// 	if (fromDate1) {
	// 		if (dayjs(fromDate1).format('YYYY-MM-DD') === fromDate) {
	// 			return;
	// 		}
	// 		setFromDate(dayjs(fromDate1).format('YYYY-MM-DD'));
	// 	}
	// 	if (toDate1) {
	// 		if (dayjs(toDate1).format('YYYY-MM-DD') === toDate) {
	// 			return;
	// 		}
	// 		setToDate(dayjs(toDate1).format('YYYY-MM-DD'));
	// 	}
	// }, [fromDate1, toDate1]);
	return (
		<FuseAnimate animation="transition.slideLeftIn" duration={600}>
			<div className="mx-auto allergy-cont">
				<div className="flex items-center flex-nowrap justify-between">
					<div className="reports-topDiv">
						<h1 className="">
							{' '}
							<span className="icon-color">
								<IconButton
									onClick={() => {
										history.push('/reports');
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
							<span className="text-xl self-end font-bold mr-28">Medical</span>
						</h1>
						<p>Student medical by classroom or for your entire school.</p>
					</div>
					<div className="flex justify-between">
						<div className="flex">
							<div className="self-end btn-aller">
								<span>
									{!iisLoading ? (
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
									className="mr-10"
									onChange={handleSearch}
									id="search-input"
									value={searchQuery}
									label="Search by Student"
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
										)
									}}
								/>
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
							<div className="mx-10 student-date-field" style={{ width: 150 }}>
								<CustomDatePicker
									id="date-from"
									label="Date From"
									value={filters.fromDate}
									setValue={Date => {
										setFilters({ ...filters, fromDate: Date?.format('YYYY-MM-DD') || '' });
									}}
									maxDate={filters.toDate}
								/>
							</div>
							<div className="mr-20 ml-10 student-date-field" style={{ width: 150 }}>
								<CustomDatePicker
									id="date-to"
									label="Date To"
									value={filters.toDate}
									setValue={Date => {
										setFilters({ ...filters, toDate: Date?.format('YYYY-MM-DD') || '' });
									}}
									minDate={filters.fromDate}
								/>
							</div>
						</div>

						<div className="self-end">
							<span>
								<span className="mx-4">
									<CustomButton
										disabled={
											!filters.fromDate &&
											!filters.toDate &&
											!filters.status &&
											!filters.room_id &&
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
								<h1 className="font-extrabold">Medical Report</h1>
							</div>

							<Table stickyHeader className="student-table" style={{ width: '100%' }}>
								<TableHead>
									<TableRow>
										<TableCell style={{ width: '27%' }} className="bg-white studentTableHeader">
											Student
										</TableCell>
										<TableCell style={{ width: '25%' }} className="bg-white studentTableHeader">
											Parents
										</TableCell>

										<TableCell style={{ width: '15%' }} className="bg-white studentTableHeader">
											Medication
										</TableCell>
										<TableCell style={{ width: '10%' }} className="bg-white studentTableHeader">
											Frquency
										</TableCell>
										<TableCell style={{ width: '30%' }} className="bg-white studentTableHeader">
											Start/End Date
										</TableCell>
									</TableRow>
								</TableHead>
								<TableBody className="">
									{isLoading ? (
										<TableRow>
											<TableCell align="center" colSpan={8}>
												{/* <CircularProgress size={35} /> */}
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
													<div
														className="flex cursor-pointer"
														// onClick={() => goTostudentInformation(row)}
													>
														<Avatar className="mr-6" alt="student-face" src={row?.photo} />
														<div className="flex flex-col items-start">
															<div className="medication-homeroom break-word">
																{row?.home_room?.name}
															</div>
															<div className="report-medication break-word">
																{row?.full_name}
															</div>
															<div className="font-normal student-age-font">
																{generateAgeString(row.date_of_birth)}
															</div>
														</div>
													</div>
												</TableCell>
												<TableCell style={{ fontWeight: 700 }}>
													<div className="flex flex-col">
														{row?.contacts
															.map((parent, index) => (
																<div
																	className="flex items-center cursor-pointer mb-10"
																	key={index}
																	// onClick={() => handleProfileCard(row, row.parent)}
																>
																	<Avatar
																		className="mr-4"
																		alt="parent-face"
																		src={parent?.photo}
																	/>
																	<div className="flex flex-col items-center">
																		<div className="medication-parent-name break-word">
																			{parent?.first_name} {parent?.last_name}
																		</div>
																		<div className="medication-parent-relation self-start ">
																			{parent?.relation_with_child}
																		</div>
																	</div>
																</div>
															))
															.splice(0, 2)}
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
													{row?.medicine?.map((item, index) => (
														<div className="report-medication">{item?.name}</div>
													))}
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
													{row?.medicine?.map((item, index) => (
														<div className="report-medication">{item?.frequency}</div>
													))}
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
													{row?.medicine?.map((item, index) => (
														<div className="">
															{/* <div className="report-medication">{item?.start_date}</div>
													<div className="report-medication">{item?.end_date}</div> */}
															<div className="report-medication">{`${moment(
																item?.start_date
															).format('MM/DD/YY')} - ${moment(item?.end_date).format(
																'MM/DD/YY'
															)}`}</div>
														</div>
													))}
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
								<TableCell style={{ width: '25%' }} className="bg-white studentTableHeader">
									Student
								</TableCell>
								<TableCell style={{ width: '35%' }} className="bg-white studentTableHeader">
									Parents
								</TableCell>

								<TableCell style={{ width: '13%' }} className="bg-white studentTableHeader">
									Medication
								</TableCell>
								<TableCell style={{ width: '13%' }} className="bg-white studentTableHeader">
									Frquency
								</TableCell>
								<TableCell style={{ width: '13%' }} className="bg-white studentTableHeader">
									Start/End Date
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
								rows?.map(row => (
									<TableRow key={row.id}>
										<TableCell className="bg-white">
											<div
												className="flex cursor-pointer"
												// onClick={() => goTostudentInformation(row)}
											>
												<Avatar className="mr-6" alt="student-face" src={row?.photo} />
												<div className="flex flex-col items-start">
													<div className="medication-homeroom break-word font-bold">
														{row?.home_room?.name}
													</div>
													<div className="report-medication break-word">{row?.full_name}</div>
													<div className="font-normal student-age-font">
														{generateAgeString(row.date_of_birth)}
													</div>
												</div>
											</div>
										</TableCell>
										<TableCell style={{ fontWeight: 700 }}>
											<div className="flex overflow-auto">
												{row?.contacts
													.map((parent, index) => (
														<div
															className="flex items-center cursor-pointer"
															key={index}
															// onClick={() => handleProfileCard(row, row.parent)}
														>
															<Avatar
																className="mr-4"
																alt="parent-face"
																src={parent?.photo}
															/>
															<div className="flex flex-col items-center">
																<div className="medication-parent-name break-word">
																	{parent?.first_name} {parent?.last_name}
																</div>
																<div className="medication-parent-relation self-start">
																	{parent?.relation_with_child}
																</div>
															</div>
														</div>
													))
													.splice(0, 2)}
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
											className="bg-white"
										>
											{row?.medicine?.map((item, index) => (
												<div className="report-medication">{item?.name}</div>
											))}
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
											className="bg-white"
										>
											{row?.medicine?.map((item, index) => (
												<div className="report-medication">{item?.frequency}</div>
											))}
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
											{row?.medicine?.map((item, index) => (
												<div className="">
													{/* <div className="report-medication">{item?.start_date}</div>
													<div className="report-medication">{item?.end_date}</div> */}
													<div className="report-medication">{`${moment(
														item?.start_date
													).format('MM/DD/YY')} - ${moment(item?.end_date).format(
														'MM/DD/YY'
													)}`}</div>
												</div>
											))}
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
