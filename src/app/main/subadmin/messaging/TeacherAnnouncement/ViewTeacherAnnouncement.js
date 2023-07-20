/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
import {
	IconButton,
	MenuItem,
	FormControl,
	InputLabel,
	Select,
	Table,
	TableContainer,
	TableCell,
	TableRow,
	Paper,
	TableHead,
	TableBody,
	CircularProgress,
	Avatar
} from '@material-ui/core';
import { Close } from '@material-ui/icons';
import CustomButton from 'app/customComponents/CustomButton/CustomButton';
import CustomDatePicker from 'app/customComponents/CustomDatePicker/CustomDatePicker';
import dayjs from 'dayjs';
import React, { useState, useEffect } from 'react';
import './teacherAnnouncement.css';
import { getAllRooms } from 'app/services/rooms/rooms';
import { getAnnouncementList } from 'app/services/announcements/teacherAnnouncements';
import { useDispatch } from 'react-redux';
import moment from 'moment';
import * as Actions from 'app/store/actions';
import InfiniteScroll from 'react-infinite-scroll-component';
import RoomSelectionPage from './roomSelectionPage';

function ViewTeacherAnnouncement() {
	const dispatch = useDispatch();
	const [rooms, setRooms] = useState([]);
	const [filters, setFilters] = useState({ room_id: '', start_date: '', end_date: '' });
	const [start_date, setFromDate] = useState('');
	const [end_date, setToDate] = useState('');
	const [fromDate1, setFromDate1] = useState();
	const [toDate1, setToDate1] = useState();
	const [displayRoomSelectionPage, setDisplayRoomSelectionPage] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [rows, setRows] = useState([]);
	const [firstLoad, setFirstLoad] = useState(true);
	const [fetchingMore, setFetchingMore] = useState(false);
	const [hasMore, setHasMore] = useState(false);
	const [refresh, setRefresh] = useState(false);
	const [page, setPage] = useState(1);

	useEffect(() => {
		if (fromDate1) {
			setFromDate(dayjs(fromDate1).format('YYYY-MM-DD'));
		} else {
			setFromDate('');
		}
		if (toDate1) {
			setToDate(dayjs(toDate1).format('YYYY-MM-DD'));
		} else {
			setToDate('');
		}
	}, [fromDate1, toDate1]);

	useEffect(() => {
		getAllRooms().then(res => setRooms(res.data));
	}, []);

	const handleFilters = ev => {
		if (ev.target.name === 'room') {
			if (ev.target.value) {
				setFilters({ ...filters, room_id: ev.target.value });
			} else {
				setFilters({ ...filters, room_id: '' });
			}
		}
	};

	useEffect(() => {
		// const timeout = setTimeout(
		// 	() => {
		setIsLoading(true);
		getAnnouncementList(1, filters.room_id, start_date, end_date)
			.then(res => {
				setFirstLoad(false);
				setRows(res.data.data || []);
				setHasMore(res.data.to < res.data.total);
				setPage(res.data.current_page + 1);
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
		// 	},
		// 	firstLoad ? 0 : 1000
		// );
		// return () => {
		// 	clearTimeout(timeout);
		// };
		// // eslint-disable-next-line
	}, [refresh, filters, start_date, end_date]);

	const handleLoadMore = () => {
		setFetchingMore(true);
		getAnnouncementList(page, filters.room_id, start_date, end_date)
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

	return (
		<>
			{!displayRoomSelectionPage && (
				<div className="announcement-container">
					<div className="flex justify-end items-end mt-20" style={{ gap: '15px' }}>
						<div>
							<FormControl>
								<InputLabel id="roomLabel">Select Room</InputLabel>
								<Select
									name="room"
									onChange={handleFilters}
									value={filters.room_id}
									labelId="roomLabel"
									id="room_id"
									label="Room"
									style={{ width: 150 }}
									endAdornment={
										filters.room_id ? (
											<IconButton size="small" className="mr-16">
												<Close
													onClick={() =>
														setFilters({
															...filters,
															room_id: ''
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
									{rooms.length ? (
										rooms.map(room => {
											return (
												<MenuItem key={room.id} value={room.id}>
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
						<div style={{ width: '20%' }}>
							<CustomDatePicker
								label="Date From"
								value={fromDate1}
								setValue={setFromDate1}
								maxDate={end_date}
							/>
						</div>
						<div style={{ width: '20%' }}>
							<CustomDatePicker
								label="Date To"
								value={toDate1}
								setValue={setToDate1}
								minDate={start_date}
							/>
						</div>
						<div
							style={{
								alignSelf: 'center',
								marginTop: 20
							}}
						>
							<CustomButton
								variant="primary"
								width="180px"
								height="35px"
								fontSize="14px"
								// onClick={() => setCurrentScreen(1)}
							>
								<div
									onClick={() => {
										setDisplayRoomSelectionPage(true);
									}}
									className="flex items-center align-center justify-center"
									style={{ gap: 5 }}
								>
									<p> New Announcements</p>
								</div>
							</CustomButton>
						</div>
					</div>

					<TableContainer
						id="Scrollable-table"
						component={Paper}
						className="parent-announcement-table-cont mt-10"
					>
						<Table stickyHeader style={{ width: '100%' }}>
							<TableHead>
								<TableRow>
									<TableCell
										className="bg-white parent-announcement-table-header"
										style={{ width: '20%' }}
									>
										Room
									</TableCell>
									<TableCell
										className="bg-white parent-announcement-table-header"
										style={{ width: '50%' }}
									>
										Teacher Announcements
									</TableCell>
									<TableCell
										className="bg-white parent-announcement-table-header"
										style={{ width: '15%' }}
									>
										Type
									</TableCell>
									<TableCell
										className="bg-white parent-announcement-table-header"
										style={{ width: '15%' }}
									>
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
											No Announcement
										</TableCell>
									</TableRow>
								) : (
									rows?.map(row => (
										<TableRow key={row.id}>
											<TableCell>
												<div className="flex items-center" style={{ gap: '5px' }}>
													<Avatar src={row?.room?.photo} />
													<div className="flex flex-col">
														<div className="parent-announcement-name">
															{row?.room?.name}
														</div>
													</div>
												</div>
											</TableCell>
											<TableCell>
												<div className="truncate">{row?.message}</div>
											</TableCell>
											<TableCell>
												<div
													style={{
														fontWeight: 'bold',
														color: `${row?.type?.color === 'red' ? '#FF4B4B' : '#04C01C'}`
													}}
												>
													{row?.type?.name}
												</div>
											</TableCell>
											<TableCell>
												<div className="flex flex-col">
													<div>{moment(row?.created_at).format('L')}</div>
													<div className="parent-announcement-age">
														{moment(row?.created_at).format('LT')}
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
						dataLength={rows.length}
						next={handleLoadMore}
						hasMore={hasMore}
						scrollableTarget="Scrollable-table"
					/>
				</div>
			)}
			{displayRoomSelectionPage && (
				<RoomSelectionPage
					setDisplayRoomSelectionPage={setDisplayRoomSelectionPage}
					setRefresh={setRefresh}
					refresh={refresh}
				/>
			)}
		</>
	);
}

export default ViewTeacherAnnouncement;
