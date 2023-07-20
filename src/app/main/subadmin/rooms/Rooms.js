import React, { useEffect, useState } from 'react';
import {
	CircularProgress,
	IconButton,
	TextField,
	InputAdornment,
	Avatar,
	MenuItem,
	makeStyles,
	Select
} from '@material-ui/core';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import { ArrowForwardIos } from '@material-ui/icons';
import Paper from '@material-ui/core/Paper';
import InfiniteScroll from 'react-infinite-scroll-component';
import './roomspage.css';
import { getRooms } from 'app/services/rooms/rooms';
import { useDispatch } from 'react-redux';
import * as Actions from 'app/store/actions';
import history from '@history';
import CustomButton from 'app/customComponents/CustomButton/CustomButton';
import FuseAnimate from '@fuse/core/FuseAnimate';

const useStyles = makeStyles({
	select: {
		'&:before': {
			borderBottom: 'none'
		},
		'&:after': {
			borderBottom: 'none'
		},
		'&:not(.Mui-disabled):hover::before': {
			borderBottom: 'none'
		},
		'& .MuiSelect-select:focus': {
			backgroundColor: 'inherit'
		},
		'& .MuiSvgIcon-root': {
			color: 'inherit'
		},
		color: 'inherit',
		'&:hover': {
			color: 'inherit'
		}
	}
});
function Rooms() {
	const dispatch = useDispatch();
	const [searchQuery, setSearchQuery] = useState('');
	const [isLoading, setIsLoading] = useState(false);
	const [rows, setRows] = useState([]);
	const [firstLoad, setFirstLoad] = useState(true);
	const [fetchingMore, setFetchingMore] = useState(false);
	const [hasMore, setHasMore] = useState(false);
	const [page, setPage] = useState(1);
	const classes = useStyles();

	const handleSearch = e => {
		setSearchQuery(e.target.value);
	};

	const handleGoToRoom = row => {
		history.push({ pathname: `/rooms-room/${row.id}`, state: { row } });
	};

	const handleLoadMore = () => {
		setFetchingMore(true);
		getRooms(searchQuery, page)
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

	useEffect(() => {
		const id = setTimeout(
			() => {
				setIsLoading(true);
				setFirstLoad(false);
				getRooms(searchQuery)
					.then(res => {
						if (res.data.last_page > res.data.current_page) {
							setHasMore(true);
						} else {
							setHasMore(false);
						}
						setPage(res.data.current_page + 1);
						setRows(res.data.data);
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
		return _ => {
			clearTimeout(id);
		};
		// eslint-disable-next-line
	}, [dispatch, searchQuery]);

	const [anchorEl, setAnchorEl] = useState(null);

	return (
		<FuseAnimate animation="transition.slideLeftIn" duration={600}>
			<div className="rooms-container">
				<div className="flex justify-between items-end">
					<span className="text-xl self-end font-bold mr-28">Room List</span>
					<div>
						<span className="searchBox-Addbtn">
							<TextField
								style={{
									alignSelf: 'center',
									paddingRight: 30
								}}
								onChange={handleSearch}
								id="search-input"
								value={searchQuery}
								label="Search By Name"
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
							<div
								style={{
									alignSelf: 'center',
									marginTop: 20
								}}
							>
								{/* <CustomButton
									id="go-to-add-room"
									variant="primary"
									width="120px"
									height="40px"
									fontSize="15px"
									// onClick={() => {
									// 	history.push({ pathname: '/rooms-addroom', state: rows[0] });
									// }}
									onClick={handleClick}
									size="small"
									sx={{ ml: 2 }}
									aria-controls={open ? 'account-menu' : undefined}
									aria-haspopup="true"
									aria-expanded={open ? 'true' : undefined}
								>
									+ Add Room
								</CustomButton>
								<Menu
									anchorEl={anchorEl}
									id="account-menu"
									open={open}
									onClose={handleClose}
									onClick={handleClose}
									PaperProps={{
										elevation: 0,
										sx: {
											overflow: 'visible',
											filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
											mt: 1.5,
											'& .MuiAvatar-root': {
												width: 32,
												height: 32,
												ml: -0.5,
												mr: 1
											},
											'&:before': {
												content: '""',
												display: 'block',
												position: 'absolute',
												top: 0,
												right: 14,
												width: 10,
												height: 10,
												bgcolor: 'background.paper',
												transform: 'translateY(-50%) rotate(45deg)',
												zIndex: 0
											}
										}
									}}
									// transformOrigin={{ horizontal: 'right', vertical: 'top' }}
									// anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
									anchorOrigin={{
										vertical: 'bottom',
										horizontal: 'center'
									}}
									transformOrigin={{
										vertical: 'top',
										horizontal: 'center'
									}}
								>
									<MenuItem
										onClick={() => {
											history.push({ pathname: '/rooms-addroom', state: rows[0] });
										}}
									>
										Room
									</MenuItem>
									<MenuItem
										onClick={() => {
											history.push({ pathname: '/location-add', state: rows[0] });
										}}
									>
										Location
									</MenuItem>
								</Menu> */}
								<CustomButton variant="primary" height="40" width="165px" fontSize="14px" padding="2px">
									<Select
										className={classes.select}
										inputProps={{
											classes: {
												root: classes.root,
												icon: classes.icon
											}
										}}
										name="isAdd"
										defaultValue="Add Room"
										id="isNew"
										// onChange={e => setActiveTab(e.target.value)}
									>
										<MenuItem className="hidden" value="Add Room" disabled>
											Add Room
										</MenuItem>
										<MenuItem
											onClick={() => {
												history.push({ pathname: '/rooms-addroom', state: rows[0] });
											}}
										>
											Room
										</MenuItem>
										<MenuItem
											onClick={() => {
												history.push({ pathname: '/location-add', state: rows[0] });
											}}
										>
											Location
										</MenuItem>
									</Select>
								</CustomButton>
							</div>
						</span>
					</div>
				</div>

				<TableContainer id="Scrollable-table" component={Paper} className="rooms-table-cont">
					<Table stickyHeader className="rooms-table" style={{ width: '100%' }}>
						<TableHead>
							<TableRow>
								<TableCell className="bg-white roomsTableHeader" style={{ width: '30%' }}>
									Rooms
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
										No Rooms
									</TableCell>
								</TableRow>
							) : (
								rows?.map(row => (
									<TableRow
										style={{ cursor: 'pointer' }}
										key={row.id}
										onClick={() => handleGoToRoom(row)}
										id={`room-${row.id}`}
									>
										<TableCell component="th" scope="row">
											<div className="flex items-center">
												<Avatar alt="student-face" className="mr-16" src={row.photo} />
												<div className="rooms-school-name">{row.name}</div>
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

export default Rooms;
