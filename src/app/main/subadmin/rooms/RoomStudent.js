/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React, { useState, useEffect, useRef } from 'react';
import './roomspage.css';
import history from '@history';
import html2canvas from 'html2canvas';
import {
	Tooltip,
	Table,
	TableHead,
	TableBody,
	TableCell,
	TableContainer,
	TableRow,
	Paper,
	CircularProgress,
	IconButton,
	TextField,
	InputAdornment,
	Avatar,
	InputLabel,
	Select,
	MenuItem,
	FormControl,
} from '@material-ui/core';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCog } from '@fortawesome/free-solid-svg-icons';
import Close from '@material-ui/icons/Close';
import { getStudents } from 'app/services/students/students';
import { useDispatch } from 'react-redux';
import * as Actions from 'app/store/actions';
import InfiniteScroll from 'react-infinite-scroll-component';
import CustomButton from 'app/customComponents/CustomButton/CustomButton';
import { QRCodeSVG } from 'qrcode.react';
import { generateAgeString, getAgeDetails } from 'utils/utils';
import dayjs from 'dayjs';

function Roomstd({ row }) {
	const dispatch = useDispatch();
	const [searchQuery, setSearchQuery] = useState('');
	const [rows, setRows] = useState([]);
	const [isLoading, setIsLoading] = useState(false);
	const [hasMore, setHasMore] = useState(false);
	const [firstLoad, setFirstLoad] = useState(true);
	const [fetchingMore, setFetchingMore] = useState(false);
	const [refresh, setRefresh] = useState(false);
	const [page, setPage] = useState(1);
	const { id } = row;
	const ref = useRef();
	const [filters, setFilters] = useState({ status: '', statusValue: '', roomId: id, checkIn: '', absent: '' });
	const [age, setAge] = useState('');

	// useEffect(() => {
	// 	if (row) {
	// 		setAge(getAgeDetails(dayj	s(row.age), dayjs()));
	// 	}
	// }, [row]);

	const handleLoadMore = () => {
		setFetchingMore(true);
		getStudents(filters.searchQuery, filters.status, filters.roomId, filters.checkIn, page, filters.absent)
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

	useEffect(() => {
		const timeout = setTimeout(
			() => {
				setIsLoading(true);
				getStudents(searchQuery, filters.status, filters.roomId, filters.checkIn, 1, filters.absent)
					.then((res) => {
						setFirstLoad(false);
						setRows(res.data.data);
						setHasMore(res.data.to < res.data.total);
						setPage(res.data.current_page + 1);
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
		return () => {
			clearTimeout(timeout);
		};
		// eslint-disable-next-line
	}, [refresh, filters, searchQuery]);

	const handleFilters = (ev) => {
		if (ev.target.name === 'searchQuery') {
			setFilters({ ...filters, searchQuery: ev.target.value });
		}

		if (ev.target.name === 'filter') {
			if (ev.target.value === 1) {
				setFilters({ ...filters, status: 1, checkIn: '', absent: '', statusValue: ev.target.value });
			} else if (ev.target.value === 2) {
				setFilters({ ...filters, status: '', checkIn: 1, absent: '', statusValue: ev.target.value });
			} else if (ev.target.value === 3) {
				setFilters({ ...filters, status: '', checkIn: '', absent: 1, statusValue: ev.target.value });
			}
		}

		if (ev.target.name === 'room') {
			if (ev.target.value) {
				setFilters({ ...filters, roomId: ev.target.value });
			} else {
				setFilters({ ...filters, roomId: '' });
			}
		}
	};
	const downloadQRCode = async () => {
		const element = ref.current;
		const canvas = await html2canvas(element);

		const data = canvas.toDataURL('image/jpg');
		const link = document.createElement('a');

		if (typeof link.download === 'string') {
			link.href = data;
			link.download = `${row.name}-QR-Code.jpg`;

			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
		} else {
			window.open(data);
		}
	};

	const openQRCode = () => {
		dispatch(
			Actions.openDialog({
				children: (
					<div className="p-32 flex flex-col items-center row-gap-4">
						<div className="self-end">
							<i
								style={{ cursor: 'pointer' }}
								className="fas fa-times"
								onClick={() => dispatch(Actions.closeDialog())}
							/>
						</div>
						<span ref={ref}>
							<QRCodeSVG id="qrcode-svg" width={300} includeMargin height={300} value={String(id)} />
						</span>
						<CustomButton variant="primary" width={120} height={33} onClick={downloadQRCode}>
							Download
						</CustomButton>
					</div>
				),
			})
		);
	};

	return (
		<>
			<div className="mx-auto room-width">
				<div className="flex items-center  flex-nowrap justify-between">
					<span className="flex self-end">
						{' '}
						<span className="">
							<IconButton
								onClick={() => {
									history.push('/Rooms');
								}}
							>
								<img src="assets/images/arrow-long.png" alt="filter" width="24px" className="" />
							</IconButton>
						</span>{' '}
						<span className="text-2xl  font-bold mr-8 text-room" style={{ marginTop: '4px' }}>
							{row.name}
						</span>
						<QRCodeSVG
							className="cursor-pointer"
							onClick={openQRCode}
							height={30}
							width={30}
							value={String(row.id)}
						/>
					</span>
					<div className="flex justify-between">
						<div className="flex">
							<TextField
								className="name-height"
								style={{ width: 182 }}
								onChange={(ev) => setSearchQuery(ev.target.value)}
								id="search"
								value={searchQuery}
								label="Search By Name"
								InputProps={{
									endAdornment: (
										<InputAdornment>
											<IconButton
												onClick={() => {
													document.getElementById('search').focus();
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
							<div className="mx-8">
								<FormControl>
									<InputLabel id="filterLabel">Filter</InputLabel>
									<Select
										name="filter"
										style={{ width: 166, height: 34 }}
										onChange={handleFilters}
										value={filters.statusValue}
										labelId="filterlabel"
										id="filter"
										label="Filter"
										endAdornment={
											filters.statusValue ? (
												<IconButton size="small" className="mr-16">
													<Close
														onClick={() =>
															setFilters({
																...filters,
																status: '',
																checkIn: '',
																statusValue: '',
																absent: '',
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
										<MenuItem value={1}>Active</MenuItem>
										<MenuItem value={2}>Check-in</MenuItem>
										<MenuItem value={3}>Absent</MenuItem>
									</Select>
								</FormControl>
							</div>
						</div>
						<div className="self-end">
							<span>
								<span className="mx-4">
									<CustomButton
										variant="secondary"
										height="43"
										width="140px"
										id="go-to-room-settings"
										fontSize="15px"
										onClick={() => {
											history.push({ pathname: `/rooms-roomsetting/${row.id}`, state: { row } });
										}}
									>
										<FontAwesomeIcon icon={faCog} /> Room Setting
									</CustomButton>
								</span>
								<span className="mx-4">
									{row?.room_type == 'room' ? (
										<CustomButton
											variant="primary"
											height="43"
											width="140px"
											fontSize="15px"
											onClick={() => {
												history.push({
													pathname: `/rooms-roomschedule/${row.id}`,
													state: { row },
												});
											}}
											// onClick={goToEnrollStudent}
										>
											Room Schedules
										</CustomButton>
									) : (
										<></>
									)}
								</span>
							</span>
						</div>
					</div>
				</div>
				<TableContainer id="Scrollable-table" component={Paper} className="room-table-cont">
					<Table stickyHeader className="student-table" style={{ width: '100%' }}>
						<TableHead>
							<TableRow>
								<TableCell style={{ width: '30%' }} className="bg-white studentTableHeader">
									Student
								</TableCell>
								<TableCell style={{ width: '45%' }} className="bg-white studentTableHeader">
									Parents
								</TableCell>
								<TableCell style={{ width: '25%' }} className="bg-white studentTableHeader approve-hd ">
									Authorized Contacts
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
										No Students
									</TableCell>
								</TableRow>
							) : (
								rows?.map((row) => {
									const age = getAgeDetails(dayjs(row?.date_of_birth), dayjs());

									return (
										<TableRow key={row.id}>
											<TableCell style={{ fontWeight: 700 }} component="th" scope="row">
												<div
													className="flex "
													// onClick={() => goTostudentInformation(row)}
												>
													<Avatar className="mr-6" alt="student-face" src={row.photo} />
													<div className="flex flex-col items-start">
														{/* <div className="student-homeroom truncate">
														{row.home_room?.name}
													</div> */}
														<div className="truncate break-word std-name">
															{row.first_name} {row.last_name}
														</div>
														<div className="student-age-room truncate">
															{generateAgeString(row.date_of_birth)}
														</div>
													</div>
												</div>
											</TableCell>

											<TableCell style={{ fontWeight: 700 }}>
												<div className="grid grid-cols-2 auto-col-min auto-row-min">
													<div
														className="flex items-center cursor-pointer"
														// onClick={() => handleProfileCard(row, row.parent)}
													>
														<Avatar
															className="mr-4"
															alt="parent-face"
															src={row?.parents[0]?.photo}
														/>
														<div className="flex flex-col">
															<div className="parent-name-room truncate">
																{row?.parents[0]?.first_name}{' '}
																{row?.parents[0]?.last_name}
															</div>
															<div className="parent-relation-room self-start truncate">
																{row?.parents[0]?.relation_with_child}
															</div>
														</div>
													</div>
													<>
														{row.parents.length > 1 ? (
															<div className="flex items-center cursor-pointer">
																<Avatar
																	className="mr-4"
																	alt="parent-face"
																	src={row.parents[1]?.photo}
																/>
																<div className="flex flex-col items-center">
																	<div className="parent-name truncate">
																		{row.parents[1]?.first_name}{' '}
																		{row.parents[1]?.last_name}
																	</div>
																	<div className="parent-relation self-start truncate">
																		{row.parents[1]?.relation_with_child}
																	</div>
																</div>
															</div>
														) : (
															''
														)}
													</>
												</div>
											</TableCell>

											<TableCell style={{ fontWeight: 700 }}>
												<div className="flex overflow-auto">
													{row.approved_pickups.map((family) => {
														return (
															<Tooltip
																title={
																	<div className="flex flex-col items-center">
																		<div>
																			{family.first_name} {family.last_name}
																		</div>
																		<div className="mt-2">
																			{family.relation_with_child}
																		</div>
																	</div>
																}
																key={family.id}
															>
																<Avatar
																	alt="family-face"
																	className="mx-4 cursor-pointer"
																	src={family.photo}
																	// onClick={() => handleProfileCard(row, family)}
																/>
															</Tooltip>
														);
													})}
												</div>
											</TableCell>

											<TableCell style={{ fontWeight: 700 }}>
												{/* <CustomCheckbox onClick={handleDisable} row={row} /> */}
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
		</>
	);
}

export default Roomstd;
