import React, { useEffect, useState } from 'react';
import { CircularProgress, IconButton, TextField, InputAdornment, Avatar } from '@material-ui/core';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import { ArrowForwardIos } from '@material-ui/icons';
import Paper from '@material-ui/core/Paper';
import InfiniteScroll from 'react-infinite-scroll-component';
import './rooms.css';
import { getRoomsEnrollStd } from 'app/services/rooms/rooms';
import { useDispatch } from 'react-redux';
import * as Actions from 'app/store/actions';
import history from '@history';

function Rooms() {
	const dispatch = useDispatch();
	const [searchQuery, setSearchQuery] = useState('');
	const [isLoading, setIsLoading] = useState(false);
	const [rows, setRows] = useState([]);
	const [firstLoad, setFirstLoad] = useState(true);
	const [fetchingMore, setFetchingMore] = useState(false);
	const [hasMore, setHasMore] = useState(false);
	const [page, setPage] = useState(1);

	const handleSearch = e => {
		setSearchQuery(e.target.value);
	};

	const handleGoToRoom = row => {
		history.push({
			pathname: `/checkinout/${row.id}`,
			state: row
		});
	};

	const handleLoadMore = () => {
		setFetchingMore(true);
		getRoomsEnrollStd(searchQuery, page)
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
				getRoomsEnrollStd(searchQuery, 1)
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

	return (
		<div className="rooms-container">
			<div className="flex justify-between items-end">
				<h3 className="" style={{ fontSize: '20px', fontWeight: '700' }}>
					Rooms
				</h3>
				<div>
					<span className="">
						<TextField
							className=""
							onChange={handleSearch}
							id="search"
							value={searchQuery}
							label="Search"
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
								)
							}}
						/>
					</span>
				</div>
			</div>

			<TableContainer id="Scrollable-table" component={Paper} className="rooms-table-cont">
				<Table stickyHeader className="rooms-table" style={{ width: '100%' }}>
					<TableHead>
						<TableRow>
							<TableCell className="bg-white checkinout-table-header" style={{ width: '77%' }}>
								Rooms
							</TableCell>
							<TableCell className="bg-white checkinout-table-header">Students</TableCell>
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
								>
									<TableCell component="th" scope="row" style={{ width: '77%' }}>
										<div className="flex items-center">
											<Avatar alt="student-face" className="mr-16" src={row.photo} />
											<div className="rooms-school-name">{row.name}</div>
										</div>
									</TableCell>
									<TableCell>
										<div className="flex justify-between">
											<div className="rooms-student-count">{row.students_count}</div>
											<div>
												<ArrowForwardIos style={{ color: 'grey', fontSize: '14px' }} />
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
	);
}

export default Rooms;
