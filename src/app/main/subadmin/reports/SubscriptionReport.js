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
import './Reports.css';
import moment from 'moment';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload } from '@fortawesome/free-solid-svg-icons';
import CustomDatePicker from 'app/customComponents/CustomDatePicker/CustomDatePicker';
import { getParentsSubscription, getRooms } from 'app/services/reports/reports';
import { Close } from '@material-ui/icons';
import { useReactToPrint } from 'react-to-print';
import InfiniteScroll from 'react-infinite-scroll-component';
import { generateAgeString } from 'utils/utils';

function SubscriptionReport() {
	const dispatch = useDispatch();
	const user = useSelector(({ auth }) => auth.user);
	const [rows, setRows] = useState([]);
	const [isLoading, setIsLoading] = useState(false);
	const [firstLoad, setFirstLoad] = useState(true);
	const [fetchingMore, setFetchingMore] = useState(false);
	const [hasMore, setHasMore] = useState(false);
	const subscribedParent = useRef(null);
	const [page, setPage] = useState(1);
	const [filters, setFilters] = useState({
		school_id: user?.school?.id || user?.data?.school?.id,
		name: '',
		room_id: '',
		package_type: '',
		date_from: '',
		date_to: '',
	});

	const [rooms, setRooms] = useState([]);
	const date = new Date();
	const [roomPage, setRoomPage] = useState(1);
	const [isLoadingExport, setIsLoadingExport] = useState(false);
	const [roomId, setRoomid] = useState();

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
	}, [roomPage, dispatch]);

	const handleLoadMore = () => {
		setFetchingMore(true);
		getParentsSubscription(
			0,
			filters.name,
			filters.school_id,
			filters.room_id === 'All' ? '' : filters.room_id,
			filters.package_type,
			filters.date_from,
			filters.date_to,
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

	const handleExport = () => {
		setIsLoadingExport(true);
		getParentsSubscription(
			1,
			filters.name,
			filters.school_id,
			filters.room_id === 'All' ? '' : filters.room_id,
			filters.package_type,
			filters.date_from,
			filters.date_to
		)
			.then((res) => {
				const blob = new Blob([res.data], {
					type: 'text/csv',
				});
				const link = document.createElement('a');
				link.setAttribute('target', '_blank');
				link.href = window.URL.createObjectURL(blob);
				link.setAttribute('download', `ParentSubscription_report_${new Date().getTime()}.csv`);
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
		setRows([]);
		setIsLoading(true);
		setFirstLoad(false);
		const timeout = setTimeout(
			() => {
				getParentsSubscription(
					0,
					filters.name,
					filters.school_id,
					filters.room_id === 'All' ? '' : filters.room_id,
					filters.package_type,
					filters.date_from,
					filters.date_to,
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
			},
			firstLoad ? 0 : 1000
		);
		setPage(1);
		return () => {
			clearTimeout(timeout);
		};
	};

	const handlePrint = useReactToPrint({
		content: () => subscribedParent.current,
	});

	const handleFilters = (ev) => {
		const { name, value } = ev.target;
		setFilters({ ...filters, [name]: value });
	};

	const handleClick = (row) => {
		console.log(row);
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
										{row?.parent?.family_child
											?.filter((child) => child.school_id === filters.school_id)
											.slice(2)
											.map((child, i) => (
												<div className="flex items-center " style={{ padding: 14 }} key={i}>
													<Avatar className="mr-6" alt="student-face" src={child.photo} />
													<div className="flex flex-col items-start">
														<div className="student-name truncate break-word">
															{child.first_name} {child.last_name}
														</div>
													</div>
												</div>
											))}
									</>
								) : (
									<>
										{row?.parent?.family_child
											.filter((child) => child.home_room.id === roomId)
											.slice(2)
											.map((child, i) => (
												<div className="flex items-center " style={{ padding: 14 }} key={i}>
													<Avatar className="mr-6" alt="student-face" src={child.photo} />
													<div className="flex flex-col items-start">
														<div className="student-name truncate break-word">
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
								{row?.parent?.family_child
									?.filter((child) => child.school_id === filters.school_id)
									.slice(2)
									.map((child, i) => (
										<div className="flex items-center " style={{ padding: 14 }} key={i}>
											<Avatar className="mr-6" alt="student-face" src={child.photo} />
											<div className="flex flex-col items-start">
												<div className="student-name truncate break-word">
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
							<span className="text-xl self-end font-bold mr-28">Parent Subscription Reporting</span>
						</h1>
						<p>Detail data of check parent subscription reporting information</p>
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
									label="Search by Parent"
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
										),
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
										labelId="room_id"
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
									<InputLabel id="packageLabel">Package Type</InputLabel>
									<Select
										name="package_type"
										labelId="package_type"
										id="package_type"
										label="Package Type"
										value={filters.package_type}
										onChange={handleFilters}
										style={{ width: 120 }}
										endAdornment={
											filters.package_type ? (
												<IconButton id="clear-package-filter" size="small" className="mr-16">
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
							<div className="mx-10 student-date-field" style={{ width: 125 }}>
								<CustomDatePicker
									id="date-from"
									label="Date From"
									value={filters.date_from}
									setValue={(Date) => {
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
									setValue={(Date) => {
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
											!filters.package_type &&
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
						<div ref={subscribedParent} className="p-32">
							<div className="flex flex-row justify-between">
								<div>
									<img src="assets/images/logos/logo.png" alt="" />
								</div>
								<div style={{ textAlign: 'right' }}>
									<Typography variant="subtitle1">
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
								<h1 className="font-extrabold">Subscription Report</h1>
							</div>

							<Table stickyHeader style={{ width: '100%' }}>
								<TableHead>
									<TableRow>
										<TableCell style={{ width: '20%' }} className="bg-white studentTableHeader">
											Parent
										</TableCell>
										<TableCell style={{ width: '40%' }} className="bg-white studentTableHeader">
											Students
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
									{isLoading ? (
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
										rows?.map((row) => (
											<TableRow key={row?.id}>
												<TableCell style={{ fontWeight: 700 }} component="th" scope="row">
													<div id={`parent-${row?.id}`} className="flex ">
														<Avatar
															className="mr-6"
															alt="student-face"
															src={row?.parent?.photo}
														/>
														<div className="flex items-center justify-content: center">
															<div className="student-name break-word">
																{row?.parent?.first_name} {row?.parent?.last_name}
															</div>
														</div>
													</div>
												</TableCell>
												{roomId ? (
													<TableCell style={{ fontWeight: 700 }}>
														<div className="grid grid-cols-2 auto-col-min auto-row-min">
															{roomId === 'All' ? (
																<>
																	{row?.parent?.family_child
																		.filter(
																			(child) =>
																				child.school_id === filters.school_id
																		)
																		?.map((kid, i) => {
																			return (
																				<>
																					<div
																						id={`student-${row?.id}`}
																						className="flex items-center student-div"
																						key={i}
																					>
																						<Avatar
																							className="mr-4"
																							alt="parent-face"
																							src={kid?.photo}
																						/>
																						<div className="flex flex-col items-start">
																							<div className="student-homeroom break-word">
																								{kid?.home_room?.name}
																							</div>
																							<div className="parent-name break-word">
																								{kid?.first_name}{' '}
																								{kid?.last_name}
																							</div>
																							<div className="font-normal student-age-font">
																								{kid?.age}
																							</div>
																						</div>
																					</div>
																				</>
																			);
																		})}
																</>
															) : (
																row?.parent?.family_child
																	.filter((child) => child.home_room.id === roomId)
																	?.map((kid, i) => {
																		return (
																			<>
																				<div
																					id={`student-${row?.id}`}
																					className="flex items-center student-div"
																					key={i}
																				>
																					<Avatar
																						className="mr-4"
																						alt="parent-face"
																						src={kid?.photo}
																					/>
																					<div className="flex flex-col items-start">
																						<div className="student-homeroom break-word">
																							{kid?.home_room?.name}
																						</div>
																						<div className="parent-name break-word">
																							{kid?.first_name}{' '}
																							{kid?.last_name}
																						</div>
																						<div className="font-normal student-age-font">
																							{kid?.age}
																						</div>
																					</div>
																				</div>
																			</>
																		);
																	})
															)}
														</div>
													</TableCell>
												) : (
													<TableCell style={{ fontWeight: 700 }}>
														<div className="grid grid-cols-2 auto-col-min auto-row-min">
															{row?.parent?.family_child
																?.filter(
																	(child) => child.school_id === filters.school_id
																)
																?.map((kid, i) => {
																	return (
																		<>
																			<div
																				id={`student-${row?.id}`}
																				className="flex items-center student-column"
																				key={i}
																			>
																				<Avatar
																					className="mr-4"
																					alt="parent-face"
																					src={kid?.photo}
																				/>
																				<div className="flex flex-col items-start">
																					<div className="student-homeroom break-word">
																						{kid?.home_room?.name}
																					</div>
																					<div className="parent-name break-word">
																						{kid?.first_name}{' '}
																						{kid?.last_name}
																					</div>
																					<div className="font-normal student-age-font">
																						{kid?.age}
																					</div>
																				</div>
																			</div>
																		</>
																	);
																})}
														</div>
													</TableCell>
												)}
												<TableCell>
													<div className="package-type">
														{row.package ? row.package?.title.split('Subscription') : '---'}
													</div>
												</TableCell>
												<TableCell>
													<div className="package-amount">
														${row?.package ? row.transaction?.original_amount : '---'}
													</div>
												</TableCell>
												<TableCell>
													<div className="flex flex-col">
														<div className="enroll-date">
															{moment.utc(row?.created_at).local().format('L')}
														</div>
														<div className="student-enroll-date">
															{moment.utc(row?.created_at).local().format('LT')}
														</div>
													</div>
												</TableCell>
											</TableRow>
										))
									)}
								</TableBody>
							</Table>
						</div>
					</div>
					<Table stickyHeader className="enrolledtudent-table" style={{ width: '100%' }}>
						<TableHead>
							<TableRow>
								<TableCell style={{ width: '15%' }} className="bg-white studentTableHeader">
									Parent
								</TableCell>
								<TableCell style={{ width: '25%' }} className="bg-white studentTableHeader">
									Students
								</TableCell>
								<TableCell style={{ width: '5%' }} className="bg-white studentTableHeader"></TableCell>
								<TableCell style={{ width: '15%' }} className="bg-white studentTableHeader">
									Package Type
								</TableCell>
								<TableCell style={{ width: '12%' }} className="bg-white studentTableHeader">
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
							) : !rows.length && !firstLoad ? (
								<TableRow>
									<TableCell align="center" colSpan={8}>
										No Record Found
									</TableCell>
								</TableRow>
							) : (
								rows?.map((row) => (
									<TableRow key={row?.id}>
										<TableCell style={{ fontWeight: 700 }} component="th" scope="row">
											<div id={`parent-${row?.id}`} className="flex ">
												<Avatar className="mr-6" alt="student-face" src={row?.parent?.photo} />
												<div className="flex items-center justify-content: center">
													<div className="student-name break-word">
														{row?.parent?.first_name} {row?.parent?.last_name}
													</div>
												</div>
											</div>
										</TableCell>
										{roomId ? (
											<>
												<TableCell style={{ fontWeight: 700 }}>
													<div className="flex">
														{roomId === 'All' ? (
															<>
																{row?.parent?.family_child
																	.filter(
																		(child) => child.school_id === filters.school_id
																	)
																	?.map((child, index) => (
																		<div className="flex cursor-pointer mr-10 student-div">
																			<Avatar
																				className="mr-6"
																				alt="student-face"
																				src={child?.photo}
																			/>
																			<div className="flex flex-col items-start">
																				<div className="medication-homeroom break-word">
																					{child?.home_room?.name}
																				</div>
																				<div className="report-medication break-word">
																					{`${child?.first_name} ${child?.last_name}`}{' '}
																				</div>
																				<div className="font-normal student-age-font">
																					{generateAgeString(child?.date_of_birth)}
																				</div>
																			</div>
																		</div>
																	))
																	.splice(0, 2)}
															</>
														) : (
															<>
																{row?.parent?.family_child
																	.filter((child) => child.home_room.id === roomId)
																	?.map((child, index) => (
																		<div className="flex cursor-pointer mr-10 student-div">
																			<Avatar
																				className="mr-6"
																				alt="student-face"
																				src={child?.photo}
																			/>
																			<div className="flex flex-col items-start">
																				<div className="medication-homeroom break-word">
																					{child?.home_room?.name}
																				</div>
																				<div className="report-medication break-word">
																					{`${child?.first_name} ${child?.last_name}`}{' '}
																				</div>
																				<div className="font-normal student-age-font">
																					{generateAgeString(child?.date_of_birth)}
																				</div>
																			</div>
																		</div>
																	))
																	.splice(0, 2)}
															</>
														)}
													</div>
												</TableCell>
												<TableCell style={{ padding: 0 }}>
													<div>
														{roomId === 'All' ? (
															<>
																{row?.parent?.family_child.filter(
																	(child) => child.school_id === filters.school_id
																).length > 2 ? (
																	<>
																		<div
																			onClick={() => handleClick(row)}
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
																						child.school_id ===
																						filters.school_id
																				).length - 2
																			} Others`}
																		</div>
																	</>
																) : (
																	''
																)}
															</>
														) : (
															<>
																{row?.parent?.family_child.filter(
																	(child) => child.home_room.id === roomId
																)?.length > 2 ? (
																	<>
																		<div
																			onClick={() => handleClick(row)}
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
													<div className="flex">
														{row?.parent?.family_child
															.filter((child) => child.school_id === filters.school_id)
															?.map((child, index) => (
																<div className="flex cursor-pointer mr-10 student-div">
																	<Avatar
																		className="mr-6"
																		alt="student-face"
																		src={child?.photo}
																	/>
																	<div className="flex flex-col items-start">
																		<div className="medication-homeroom break-word">
																			{child?.home_room?.name}
																		</div>
																		<div className="report-medication break-word">
																			{`${child?.first_name} ${child?.last_name}`}{' '}
																		</div>
																		<div className="font-normal student-age-font">
																			{generateAgeString(child?.date_of_birth)}
																		</div>
																	</div>
																</div>
															))
															.splice(0, 2)}
													</div>
												</TableCell>
												<TableCell style={{ padding: 0 }}>
													<div>
														{row?.parent?.family_child.filter(
															(child) => child.school_id === filters.school_id
														).length > 2 ? (
															<>
																<div
																	onClick={() => handleClick(row)}
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
																				child.school_id === filters.school_id
																		).length - 2
																	} Others`}
																</div>
															</>
														) : (
															''
														)}
													</div>
												</TableCell>
											</>
										)}
										<TableCell>
											<div className="package-type">
												{row.package ? row.package?.title.split('Subscription') : '---'}
											</div>
										</TableCell>
										<TableCell>
											<div className="package-amount">
												${row?.package ? row.transaction?.original_amount : '---'}
											</div>
										</TableCell>
										<TableCell>
											<div className="flex flex-col">
												<div className="enroll-date">
													{moment.utc(row?.created_at).local().format('L')}
												</div>
												<div className="student-enroll-date">
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

export default SubscriptionReport;
