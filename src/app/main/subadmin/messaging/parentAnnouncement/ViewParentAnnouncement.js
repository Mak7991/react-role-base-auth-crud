import {
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
	Avatar,
	IconButton
} from '@material-ui/core';
import { Close } from '@material-ui/icons';
import { useDispatch } from 'react-redux';
import * as Actions from 'app/store/actions';
import moment from 'moment';
import CustomButton from 'app/customComponents/CustomButton/CustomButton';
import CustomDatePicker from 'app/customComponents/CustomDatePicker/CustomDatePicker';
import dayjs from 'dayjs';
import React, { useState, useEffect } from 'react';
import './parentAnnouncement.css';
import { getAllRooms } from 'app/services/rooms/rooms';
import { getList } from 'app/services/announcements/ParentAnnouncements';
import InfiniteScroll from 'react-infinite-scroll-component';

function ViewParentAnnouncement({ setCurrentScreen }) {
	const dispatch = useDispatch();
	const [selectedRoom, setSelectedRoom] = useState(null);
	const [rooms, setRooms] = useState([]);
	const [fromDate1, setFromDate1] = useState();
	const [toDate1, setToDate1] = useState();
	const [rows, setRows] = useState([]);
	const [page, setPage] = useState(1);
	const [isLoading, setLoading] = useState(false);
	const [hasMore, setHasMore] = useState(false);
	const [fetchingMore, setFetchingMore] = useState(false);
	const [filters, setFilters] = useState({ room_id: '' });

	useEffect(() => {
		getAllRooms().then(res => {
			setRooms(res.data);
		});
		setLoading(true);
		setFetchingMore(false);
		setPage(1);
		getList(
			selectedRoom || '',
			fromDate1 ? dayjs(fromDate1).format('YYYY-MM-DD') : '',
			toDate1 ? dayjs(toDate1).format('YYYY-MM-DD') : '',
			1
		)
			.then(({ data }) => {
				setRows(data.data);
				if (data.current_page < data.last_page) {
					setHasMore(true);
					setPage(data.current_page + 1);
				} else {
					setHasMore(false);
				}
			})
			.catch(() => {
				dispatch(
					Actions.showMessage({
						message: 'Failed to fetch data, please refresh',
						variant: 'error'
					})
				);
			})
			.finally(() => setLoading(false));
	}, [selectedRoom, fromDate1, toDate1]);

	const handleLoadMore = () => {
		setFetchingMore(true);
		getList(
			selectedRoom || '',
			fromDate1 ? dayjs(fromDate1).format('YYYY-MM-DD') : '',
			toDate1 ? dayjs(toDate1).format('YYYY-MM-DD') : '',
			page
		)
			.then(({ data }) => {
				setRows(rows.concat(data.data));
				if (data.current_page < data.last_page) {
					setHasMore(true);
					setPage(data.current_page + 1);
				} else {
					setHasMore(false);
				}
			})
			.catch(() => {
				dispatch(
					Actions.showMessage({
						message: 'Failed to fetch data, please refresh',
						variant: 'error'
					})
				);
			})
			.finally(() => {
				setFetchingMore(false);
			});
	};

	useEffect(() => {
		setFilters({ room_id: selectedRoom });
	}, [selectedRoom]);

	return (
		<>
			<div className="announcement-container">
				<div className="flex justify-end items-end mt-20" style={{ gap: '15px' }}>
					<div>
						<FormControl>
							<InputLabel id="roomLabel">Select Room</InputLabel>
							<Select
								name="room"
								onChange={(_e, v) => {
									setSelectedRoom(v.props.value);
								}}
								value={filters.room_id}
								labelId="roomLabel"
								id="room_id"
								label="Room"
								endAdornment={
									selectedRoom ? (
										<IconButton size="small" className="mr-16">
											<Close onClick={() => setSelectedRoom(null)} fontSize="small" />
										</IconButton>
									) : (
										''
									)
								}
								style={{ width: 150 }}
							>
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
						<CustomDatePicker label="Date From" value={fromDate1} setValue={setFromDate1} />
					</div>
					<div style={{ width: '20%' }}>
						<CustomDatePicker label="Date To" value={toDate1} setValue={setToDate1} />
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
							onClick={() => setCurrentScreen(1)}
						>
							<div className="flex items-center align-center justify-center" style={{ gap: 5 }}>
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
									Student
								</TableCell>
								<TableCell
									className="bg-white parent-announcement-table-header"
									style={{ width: '50%' }}
								>
									Parent Announcement
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
						<TableBody>
							{isLoading ? (
								<TableRow>
									<TableCell align="center" colSpan={8}>
										<CircularProgress size={35} />
									</TableCell>
								</TableRow>
							) : !rows.length ? (
								<TableRow>
									<TableCell align="center" colSpan={8}>
										No Announcement
									</TableCell>
								</TableRow>
							) : (
								rows.map(row => (
									<TableRow key={row.id}>
										<TableCell>
											<div className="flex items-center" style={{ gap: 10, cursor: 'pointer' }}>
												<Avatar src={row.photo} />
												<div className="flex flex-col">
													<div className="break-word staff-name">
														{`${row.first_name} ${row.last_name}`}
													</div>
													<div className="break-word capitalize staff-position">
														{row.position_type}
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
													color: `${
														row?.announcement_type_color === 'red' ? '#FF4B4B' : '#04C01C'
													}`
												}}
											>
												{row?.announcement_type}
											</div>
										</TableCell>
										<TableCell>
											<div className="flex flex-col">
												<div>
													{moment
														.utc(row?.created_at)
														.local()
														.format('L')}
												</div>
												<div className="parent-announcement-age">
													{moment
														.utc(row?.created_at)
														.local()
														.format('LT')}
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
		</>
	);
}

export default ViewParentAnnouncement;
