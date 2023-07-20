/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
import React, { useState, useEffect } from 'react';
import history from '@history';
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
import Close from '@material-ui/icons/Close';
import { getStudents } from 'app/services/students/students';
import './Students.css';
import FuseAnimate from '@fuse/core/FuseAnimate';
import { useDispatch } from 'react-redux';
import * as Actions from 'app/store/actions';
import InfiniteScroll from 'react-infinite-scroll-component';
import CustomButton from 'app/customComponents/CustomButton/CustomButton';
import CustomCheckbox from 'app/customComponents/CustomCheckbox/CustomCheckbox';
import { getRoomsEnrollStd } from 'app/services/rooms/rooms';
import dayjs from 'dayjs';
import DisableConfirmDialog from './DisableConfirmDialog';
import ProfileInfoCard from './ProfileInfoCard';
import Autocomplete from '@material-ui/lab/Autocomplete';
import { generateAgeString } from 'utils/utils';

function Students() {
	const dispatch = useDispatch();
	const [rows, setRows] = useState([]);
	const [isLoading, setIsLoading] = useState(false);
	const [hasMore, setHasMore] = useState(false);
	const [firstLoad, setFirstLoad] = useState(true);
	const [fetchingMore, setFetchingMore] = useState(false);
	const [refresh, setRefresh] = useState(false);
	const [filters, setFilters] = useState({
		status: '',
		statusValue: '',
		roomId: '',
		searchQuery: '',
		checkIn: '',
		absent: '',
	});
	const [rooms, setRooms] = useState([]);
	const [page, setPage] = useState(1);
	const [isRoomLoading, setIsRoomLoading] = useState(false);
	const [searchRoomQuery, setRoomSearchQuery] = useState('');

	useEffect(() => {
		const timeout = setTimeout(
			() => {
				setIsRoomLoading(true);
				setRooms([]);
				if (!searchRoomQuery) {
					getRoomsEnrollStd('', 1)
						.then((res) => {
							setRooms(res.data.data);
						})
						.catch(() => {
							dispatch(
								Actions.showMessage({
									message: 'Failed to fetch data, please refresh',
									variant: 'error',
								})
							);
						})
						.finally(() => {
							setIsRoomLoading(false);
						});
				} else {
					getRoomsEnrollStd(searchRoomQuery, searchRoomQuery ? undefined : 1)
						.then((res) => {
							setRooms(res.data.data);
						})
						.catch(() => {
							dispatch(
								Actions.showMessage({
									message: 'Failed to fetch data, please refresh',
									variant: 'error',
								})
							);
						})
						.finally(() => {
							setIsRoomLoading(false);
						});
				}
			},
			firstLoad ? 0 : 1000
		);
		return () => {
			clearTimeout(timeout);
		};
	}, [searchRoomQuery, filters, dispatch]);

	useEffect(() => {
		const timeout = setTimeout(
			() => {
				setIsLoading(true);
				getStudents(filters.searchQuery, filters.status, filters.roomId, filters.checkIn, 1, filters.absent)
					.then((res) => {
						setFirstLoad(false);
						setRows(res.data.data || []);
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
	}, [refresh, filters]);

	const goToEnrollStudent = () => {
		history.push('/students-enroll');
	};
	const goTostudentInformation = (row) => {
		history.push({ pathname: `/students-student/${row.id}`, state: { row } });
	};
	const handleDisable = (ev, row) => {
		ev.preventDefault();
		dispatch(
			Actions.openDialog({
				children: <DisableConfirmDialog row={row} setRefresh={setRefresh} setHasMore={setHasMore} />,
			})
		);
	};

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

	const handleFilters = (ev) => {
		if (ev.target.name === 'searchQuery') {
			setFilters({ ...filters, searchQuery: ev.target.value });
		}

		if (ev.target.name === 'filter') {
			if (ev.target.value === 1) {
				setFilters({ ...filters, status: 1, checkIn: '', absent: '', statusValue: ev.target.value });
			} else if (ev.target.value === 2) {
				setFilters({ ...filters, status: 0, checkIn: '', absent: '', statusValue: ev.target.value });
			} else if (ev.target.value === 3) {
				setFilters({ ...filters, status: '', checkIn: 1, absent: '', statusValue: ev.target.value });
			} else if (ev.target.value === 4) {
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

	const handleProfileCard = (row, self) => {
		dispatch(
			Actions.openDialog({
				children: <ProfileInfoCard row={row} self={self} />,
			})
		);
	};

	const goToAddParent = (row) => {
		history.push({ pathname: '/students-addparent', state: { row } });
	};

	return (
		<FuseAnimate animation="transition.slideLeftIn" duration={600}>
			<div className="student-cont mx-auto">
				<div className="flex items-center flex-nowrap justify-between">
					<span className="text-xl self-end font-bold mr-28">Student List</span>
					<div className="flex justify-between">
						<div className="flex">
							<TextField
								name="searchQuery"
								className="mx-8"
								style={{ width: 150 }}
								id="search"
								value={filters.searchQuery}
								onChange={handleFilters}
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
										onChange={handleFilters}
										value={filters.statusValue}
										labelId="filterlabel"
										id="filter"
										label="Filter"
										style={{ width: 150 }}
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
										<MenuItem value={1}>
											<span id="active"> Active</span>
										</MenuItem>
										<MenuItem value={2}>
											<span id="inactive"> Inactive</span>
										</MenuItem>
										<MenuItem value={3}>
											<span id="check-in"> Checked-In</span>
										</MenuItem>
										<MenuItem value={4}>
											<span id="check-out"> Checked-Out</span>
										</MenuItem>
									</Select>
								</FormControl>
							</div>
							<div className="mx-8">
								{/* <FormControl>
									<InputLabel id="roomLabel">Select Room</InputLabel>
									<Select
										name="room"
										onChange={handleFilters}
										value={filters.roomId}
										labelId="roomLabel"
										id="room_id"
										label="Room"
										style={{ width: 150 }}
										endAdornment={
											filters.roomId ? (
												<IconButton id="clear-room-filter" size="small" className="mr-16">
													<Close
														onClick={() =>
															setFilters({
																...filters,
																roomId: '',
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
								</FormControl> */}
								<Autocomplete
									id="rooms"
									options={rooms}
									renderOption={(option) => (
										<>
											<div className="flex" style={{ gap: 10 }}>
												<Avatar src={option.photo} />
												<div>{option.name}</div>
											</div>
										</>
									)}
									getOptionLabel={(option) => option.name}
									autoComplete={false}
									clearOnBlur={false}
									loading={isRoomLoading}
									loadingText="...Loading"
									sx={{ width: '100%' }}
									onChange={(_e, v) => {
										setFilters({ ...filters, roomId: v?.id || '' });
									}}
									renderInput={(params) => (
										<TextField
											{...params}
											label="Select Room"
											style={{ width: '150px' }}
											onChange={(e) => {
												setRoomSearchQuery(e.target.value);
												if (e.target.value === '') {
													setFilters({ ...filters, roomId: '' });
												}
											}}
											autoComplete="off"
										/>
									)}
								/>
							</div>
						</div>
						<div className="self-end">
							<span>
								{/* <span className="mx-4">
									<CustomButton variant="primary" height="40px" width="100px" fontSize="15px">
										<FontAwesomeIcon icon={faDownload} /> Import
									</CustomButton>
								</span> */}
								<span className="mx-4">
									<CustomButton
										variant="secondary"
										height="40px"
										width="135px"
										id="submit-roster-btn"
										fontSize="15px"
										onClick={() => history.push('/students-submitroster')}
									>
										Submit Roster
									</CustomButton>
								</span>
								<span className="mx-4">
									<CustomButton
										variant="primary"
										id="enroll-student-btn"
										height="40px"
										width="135px"
										fontSize="15px"
										onClick={goToEnrollStudent}
									>
										+ Enroll Student
									</CustomButton>
								</span>
							</span>
						</div>
					</div>
				</div>
				<TableContainer id="Scrollable-table" component={Paper} className="student-table-cont">
					<Table stickyHeader className="student-table" style={{ width: '100%' }}>
						<TableHead>
							<TableRow>
								<TableCell style={{ width: '25%' }} className="bg-white studentTableHeader">
									Student
								</TableCell>
								<TableCell style={{ width: '35%' }} className="bg-white studentTableHeader">
									Parents
								</TableCell>
								<TableCell style={{ width: '30%' }} className="bg-white studentTableHeader">
									Authorized Contacts
								</TableCell>
								<TableCell style={{ width: '10%' }} className="bg-white studentTableHeader">
									Action
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
									return (
										<TableRow key={row?.id}>
											<TableCell style={{ fontWeight: 700 }} component="th" scope="row">
												<div
													id={`student-${row?.id}`}
													className="flex cursor-pointer"
													onClick={() => goTostudentInformation(row)}
												>
													<Avatar className="mr-6" alt="student-face" src={row.photo} />
													<div className="flex flex-col items-start">
														<div className="student-homeroom truncate">
															{row.home_room?.name}
														</div>
														<div className="student-name truncate break-word">
															{row.first_name} {row.last_name}
														</div>
														<div
															className="font-normal truncate student-age-font"
															style={{ width: '90px' }}
														>
															{generateAgeString(row?.date_of_birth)}
														</div>
													</div>
												</div>
											</TableCell>
											<TableCell style={{ fontWeight: 700 }}>
												<div className="grid grid-cols-2 auto-col-min auto-row-min">
													<div
														className="flex items-center cursor-pointer"
														id={`student-${row?.id}-parent-${row?.parents[0]?.id}`}
														onClick={() => handleProfileCard(row, row?.parents[0])}
													>
														<Avatar
															className="mr-4"
															alt="parent-face"
															src={row.parents[0]?.photo}
														/>
														<div className="flex flex-col items-center">
															<div className="parent-name truncate">
																{row.parents[0]?.first_name} {row.parents[0]?.last_name}
															</div>
															<div className="parent-relation self-start truncate">
																{row.parents[0]?.relation_with_child}
															</div>
														</div>
													</div>
													<div className="flex items-center">
														{row?.parents.length === 1 ? (
															<>
																<Avatar className="mr-4" alt="parent-face" />
																<div
																	id="add-parent-from-listing"
																	onClick={() => goToAddParent(row)}
																	className="mr-10 text-blue-200 cursor-pointer"
																>
																	+ Add Parent
																</div>
															</>
														) : (
															<>
																<div
																	id={`student-${row.id}-family-${row.parents[1]?.id}`}
																	className="flex items-center cursor-pointer"
																	onClick={() =>
																		handleProfileCard(row, row.parents[1])
																	}
																>
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
															</>
														)}
													</div>
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
																	id={family.id}
																	src={family.photo}
																	onClick={() => handleProfileCard(row, family)}
																/>
															</Tooltip>
														);
													})}
												</div>
											</TableCell>
											<TableCell style={{ fontWeight: 700 }}>
												<CustomCheckbox
													id={`disable-student-${row.id}`}
													onClick={handleDisable}
													row={row}
												/>
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
export default Students;
