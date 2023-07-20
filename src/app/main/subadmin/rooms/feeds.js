import React, { useState, useEffect } from 'react';
import './roomspage.css';
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
	makeStyles,
} from '@material-ui/core';
import Close from '@material-ui/icons/Close';
import { useDispatch } from 'react-redux';
import * as Actions from 'app/store/actions';
import CustomButton from 'app/customComponents/CustomButton/CustomButton';
import { getRoomFeeds } from 'app/services/rooms/rooms';
import { ArrowForwardIos } from '@material-ui/icons';
import CustomDatePicker from 'app/customComponents/CustomDatePicker/CustomDatePicker';

const useStyles = makeStyles({
	container: {
		height: 540,
		position: 'fixed',
		maxWidth: '100%',
		width: '100%',
		paddingLeft: 30,
		paddingRight: 30,
		borderRadius: 14,
		overflowY: 'scroll',
		marginTop: '21px',
	},
	root: {
		color: '#2D65AB',
	},
});
function Roomstd({ room }) {
	const dispatch = useDispatch();
	const classes = useStyles();
	const [rows, setRows] = useState([]);
	const [isLoading, setIsLoading] = useState(false);
	const [hasMore, setHasMore] = useState(false);
	const [firstLoad, setFirstLoad] = useState(true);
	const [fetchingMore, setFetchingMore] = useState(false);
	const [page, setPage] = useState(1);
	const [start_date, setStart_date] = useState('');
	const [end_date, setEnd_date] = useState('');
	const [activity_type, setActivity_type] = useState('');

	useEffect(() => {
		const timeout = setTimeout(
			() => {
				setIsLoading(true);
				const payload = {
					id: room.id,
					start_date,
					end_date,
					activity_type,
				};
				getRoomFeeds(payload)
					.then((res) => {
						setFirstLoad(false);
						setRows(res.data);
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
	}, []);

	const ApplyFilters = () => {
		const timeout = setTimeout(
			() => {
				setIsLoading(true);
				const payload = {
					id: room.id,
					start_date,
					end_date,
					activity_type,
				};
				getRoomFeeds({ ...payload })
					.then((res) => {
						setFirstLoad(false);
						setRows(res.data);
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
	};

	const goToFeedsDetails = (row) => {
		history.push({ pathname: `/rooms-FeedsType/${row.id}`, state: { room: room } });
	};

	return (
		<>
			<div className="mx-auto room-width">
				<div className="flex mt-10 items-center flex-nowrap justify-between">
					<span className="text-2xl self-end  mr-28" style={{ fontSize: '20px', fontWeight: '700' }}>
						<span className="">
							<IconButton
								onClick={() => {
									history.push('/rooms');
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
						Feeds
					</span>{' '}
					<div className="flex justify-between">
						<div className="flex">
							<span className="mx-10">
								{' '}
								{/* <TextField
									id="start_date"
									label="Date from"
									type="date"
									name="start_date"
									// InputProps={{
									// 	inputProps: { max: end_date || new Date().toISOString().split('T')[0] }
									// }}
									onChange={ev => setStart_date(ev.target.value)}
									value={start_date}
									className={classes.textField}
									InputLabelProps={{
										shrink: true
									}}
								/> */}
								<CustomDatePicker
									value={start_date}
									setValue={(date) => setStart_date(date?.format('YYYY-MM-DD') || '')}
									label="Date from"
									disableFuture
									maxDate={end_date || undefined}
								/>
							</span>
							<span className="mr-20 ml-10">
								{' '}
								{/* <TextField
									id="end_date"
									label="Date to"
									name="end_date"
									// InputProps={{
									// 	inputProps: { min: start_date, max: new Date().toISOString().split('T')[0] }
									// }}
									value={end_date}
									onChange={ev => setEnd_date(ev.target.value)}
									type="date"
									className={classes.textField}
									InputLabelProps={{
										shrink: true
									}}
								/> */}
								<CustomDatePicker
									value={end_date}
									setValue={(date) => setEnd_date(date?.format('YYYY-MM-DD') || '')}
									label="Date to"
									disableFuture
									minDate={start_date || undefined}
								/>
							</span>
							<div className="mx-8">
								<FormControl>
									<InputLabel id="filterLabel">Filter</InputLabel>
									<Select
										name="activity_type"
										onChange={(ev) => setActivity_type(ev.target.value)}
										value={activity_type}
										labelId="filterlabel"
										id="activity_type"
										label="Filter"
										style={{ width: 150 }}
										endAdornment={
											activity_type ? (
												<IconButton size="small" className="mr-16">
													<Close onClick={() => setActivity_type('')} fontSize="small" />
												</IconButton>
											) : (
												''
											)
										}
									>
										<MenuItem value={1}>Diaper</MenuItem>
										<MenuItem value={2}>Meals</MenuItem>
										<MenuItem value={3}>Nap</MenuItem>
										<MenuItem value={4}>Potty</MenuItem>
										<MenuItem value={5}>Bottle</MenuItem>
										<MenuItem value={6}>Lesson</MenuItem>
										<MenuItem value={7}>Centers</MenuItem>
										<MenuItem value={8}>Outdoor Learning</MenuItem>
										<MenuItem value={9}>Name To Face</MenuItem>
									</Select>
								</FormControl>
							</div>
						</div>
						<div className="self-end">
							<span>
								<span className="mx-4">
									<CustomButton
										variant="primary"
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
				<TableContainer id="Scrollable-table" component={Paper} className="room-table-cont">
					<Table stickyHeader className="rooms-table" style={{ width: '100%' }}>
						<TableHead>
							<TableRow>
								<TableCell className="bg-white roomsTableHeader" style={{ width: '30%' }}>
									Activity Type
								</TableCell>
								<TableCell className="bg-white roomsTableHeader" style={{ width: '70%' }}>
									Students
								</TableCell>
								<TableCell className="bg-white roomsTableHeader" />
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
										No Feeds to show
									</TableCell>
								</TableRow>
							) : (
								rows?.map((row) => (
									<TableRow key={row.id}>
										<TableCell component="th" scope="row">
											<div className="flex cursor-pointer" onClick={() => goToFeedsDetails(row)}>
												<div className="flex items-center">
													<Avatar className="mr-16" alt="activity-face" src={row.photo} />
													<div className="rooms-school-name">{row.name}</div>
												</div>
											</div>
										</TableCell>
										<TableCell>
											<div className="flex items-center" style={{ gap: 5 }}>
												<div className="flex">
													{row.students.map((room, index) =>
														index < 4 ? (
															<Avatar
																key={index}
																style={{ marginRight: 5 }}
																className="room-icon"
																src={room?.photo}
															/>
														) : (
															''
														)
													)}
												</div>
												<div className="rooms-student-count justify-between">
													&nbsp;
													{row.students_count > 4 &&
														`${row.students_count - 4} other students`}
												</div>
											</div>
										</TableCell>
										<TableCell>
											<div>
												<ArrowForwardIos style={{ color: 'grey', fontSize: '14px' }} />
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
			</div>
		</>
	);
}

export default Roomstd;
