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
import './companyReport.css';
import moment from 'moment';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload } from '@fortawesome/free-solid-svg-icons';
import SearchIcon from '@material-ui/icons/Search';
import { getAllergiesBySchool, getAllSchools, getRoomsfilter } from 'app/services/CompanyReports/companyReports';
import { Close } from '@material-ui/icons';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useReactToPrint } from 'react-to-print';
import dayjs from 'dayjs';
import { generateAgeString } from 'utils/utils';

export default function Allergy() {
	const dispatch = useDispatch();
	const user = useSelector(({ auth }) => auth.user);
	const [rows, setRows] = useState([]);
	const [isLoading, setIsLoading] = useState(false);
	const [hasMore, setHasMore] = useState(false);
	const [firstLoad, setFirstLoad] = useState(true);
	const [fetchingMore, setFetchingMore] = useState(false);
	const allergyReportRef = useRef(null);
	const [page, setPage] = useState(1);
	const [filters, setFilters] = useState({
		school_id: '',
		room_id: '',
		status: ''
	});

	const [rooms, setRooms] = useState([]);
	const [schools, setSchools] = useState([]);
	const [allSchoolPage, setAllSchoolPage] = useState(1);
	const [date, setDate] = useState(new Date());
	const [roomPage, setRoomPage] = useState(1);
	const [searchQuery, setSearchQuery] = useState('');
	const [isLoadingExport, setIsLoadingExport] = useState(false);

	const handleSearch = e => {
		setSearchQuery(e.target.value);
	};

	const handlePrint = useReactToPrint({
		content: () => allergyReportRef.current
	});

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
		getAllSchools('', '', '', allSchoolPage, '')
			.then(res => {
				setSchools([...schools, ...res.data.data]);
				if (res.data.current_page < res.data.last_page) {
					setAllSchoolPage(allSchoolPage + 1);
				}
			})
			.catch(err => {
				dispatch(
					Actions.showMessage({
						message: 'Failed to get schools.',
						autoHideDuration: 1500,
						variant: 'error'
					})
				);
			});
	}, [allSchoolPage, dispatch]);

	// useEffect(() => {
	// 	const id = setTimeout(
	// 		() => {
	// 			setIsLoading(true);
	// 			setFirstLoad(false);
	// 			getAllergiesBySchool(filters, 1, searchQuery)
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
				getAllergiesBySchool(filters, 1, searchQuery)
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
		getAllergiesBySchool(filters, page, searchQuery)
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
		if (name === 'school_id') {
			setRooms([]);
			setRoomPage(1);
		}
		setFilters({ ...filters, [name]: value });
	};

	const handleExport = () => {
		setIsLoadingExport(true);
		getAllergiesBySchool(filters, 1, searchQuery, 1)
			.then(res => {
				const blob = new Blob([res.data], {
					type: 'text/csv'
				});
				const link = document.createElement('a');
				link.setAttribute('target', '_blank');
				link.href = window.URL.createObjectURL(blob);
				link.setAttribute('download', `Allergy_report_${new Date().getTime()}.csv`);
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
							<span className="text-xl self-end font-bold mr-28"> Allergy</span>
						</h1>
						<p>Detailed data of student allergy information</p>
					</div>
					<div className="flex justify-between">
						<div className="flex">
							<div className="self-end btn-aller">
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
									<InputLabel id="schoolLabel">School</InputLabel>
									<Select
										name="school_id"
										onChange={handleFilters}
										value={filters.school_id}
										labelId="schoolLabel"
										label="School"
										style={{ width: 150 }}
										endAdornment={
											filters?.school_id ? (
												<IconButton size="small" className="mr-16">
													<Close
														onClick={() => {
															setFilters({
																...filters,
																school_id: ''
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
											schools?.map(school => {
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

						<div className="self-end">
							<span>
								<span className="mx-4">
									<CustomButton
										disabled={
											!filters.status && !filters.room_id && !filters.school_id && !searchQuery
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
						<div ref={allergyReportRef} className="p-32">
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
										<span style={{ display: 'block', marginBottom: '-0.7em', writingMode: '' }}>
											{user?.data?.school?.address}
										</span>
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
								<h1 className="font-extrabold">Allergy</h1>
							</div>

							<Table stickyHeader className="student-table" style={{ width: '100%' }}>
								<TableHead>
									<TableRow>
										<TableCell style={{ width: '25%' }} className="bg-white studentTableHeader">
											Student
										</TableCell>
										<TableCell style={{ width: '25%' }} className="bg-white studentTableHeader">
											School Name
										</TableCell>
										<TableCell style={{ width: '25%' }} className="bg-white studentTableHeader">
											Allergies / Medical Condition
										</TableCell>
										<TableCell style={{ width: '25%' }} className="bg-white studentTableHeader">
											Emergency Medication
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
										rows?.map(row => {
											return (
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
													<div className="flex cursor-pointer">
														<Avatar className="mr-6" alt="student-face" src={row?.photo} />
														<div className="flex flex-col items-start">
															<div className="allergy-homeroom truncate break-word">
																{row?.home_room?.name}
															</div>
															<div className="report-staff truncate break-word">
																{row?.full_name}
															</div>
															<div className="font-normal  student-age-font" style={{width:'90px'}}>
																{generateAgeString(row.date_of_birth)}
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
													<div className="report-staff">{row?.school?.name}</div>
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
													<div className="report-staff">{row?.allergies}</div>
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
													className="bg-white report-staff"
												>
													{row?.medicine?.length > 0
														? row?.medicine?.map(
															(item, index) =>
																`${item?.name}${index !== row?.medicine?.length - 1 ? ', ' : ''
																}`
														)
														: '----'}
												</TableCell>
											</TableRow>
											);



										})
									)}
								</TableBody>
							</Table>
						</div>
					</div>
					<Table stickyHeader className="student-table" style={{ width: '100%' }}>
						<TableHead>
							<TableRow>
								<TableCell style={{ width: '15%' }} className="bg-white studentTableHeader">
									Student
								</TableCell>
								<TableCell style={{ width: '30%' }} className="bg-white studentTableHeader">
									School Name
								</TableCell>

								<TableCell style={{ width: '23%' }} className="bg-white studentTableHeader">
									Allergies / Medical Condition
								</TableCell>
								<TableCell style={{ width: '0%' }} className="bg-white studentTableHeader"></TableCell>
								<TableCell style={{ width: '15%' }} className="bg-white studentTableHeader">
									Emergency Medication
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
								rows?.map(row => {
									return (
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
												<div className="flex cursor-pointer">
													<Avatar className="mr-6" alt="student-face" src={row?.photo} />
													<div className="flex flex-col items-start">
														<div className="allergy-homeroom truncate break-word">
															{row?.home_room?.name}
														</div>
														<div className="report-staff truncate break-word">
															{row?.full_name}
														</div>
														<div className="font-normal  student-age-font" style={{width:'90px'}}>
															{generateAgeString(row.date_of_birth)}
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
												<div className="report-staff">{row?.school?.name}</div>
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
												<div className="report-staff">{row?.allergies}</div>
											</TableCell>
											<TableCell></TableCell>
											<TableCell
												// style={{
												// 	fontSize: '13px',
												// 	maxWidth: '100px',
												// 	fontWeight: 'bold',
												// 	overflow: 'hidden',
												// 	textOverflow: 'ellipsis',
												// 	whiteSpace: 'nowrap'
												// }}
												className="bg-white report-staff"
											>
												{row?.medicine?.length > 0
													? row?.medicine?.map(
														(item, index) =>
															`${item?.name}${index !== row?.medicine?.length - 1 ? ', ' : ''
															}`
													)
													: '----'}
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
