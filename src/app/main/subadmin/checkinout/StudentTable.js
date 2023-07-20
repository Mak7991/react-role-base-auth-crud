import React, { useEffect, useState } from 'react';
import { CircularProgress, IconButton, TextField, InputAdornment, Avatar } from '@material-ui/core';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import InfiniteScroll from 'react-infinite-scroll-component';
import './rooms.css';
import { getRoom } from 'app/services/rooms/rooms';
import { useDispatch } from 'react-redux';
import * as Actions from 'app/store/actions';
import history from '@history';
import { useParams } from 'react-router';

function StudentTable(props) {
	const dispatch = useDispatch();
	const [searchQuery, setSearchQuery] = useState('');
	const [isLoading, setIsLoading] = useState(false);
	const [rows, setRows] = useState([]);
	const [firstLoad, setFirstLoad] = useState(true);
	const [fetchingMore, setFetchingMore] = useState(false);
	const [hasMore, setHasMore] = useState(false);
	const [page, setPage] = useState(1);
	const [row, setRow] = useState(props.row);
	const { activeId, setActiveId } = props;
	const { id } = useParams();

	const handleSearch = e => {
		setSearchQuery(e.target.value);
	};

	const handleIdChange = selectedId => {
		if (selectedId === activeId) {
			setActiveId(null);
		} else {
			setActiveId(selectedId);
		}
	};

	const handleLoadMore = () => {
		if (!row.id) {
			history.push('/checkinout');
		}
		setFetchingMore(true);
		getRoom(searchQuery, page, id)
			.then(res => {
				if (res.data.last_page > res.data.current_page) {
					setHasMore(true);
				} else {
					setHasMore(false);
				}
				setPage(res.data.current_page + 1);
				setRows(rows.concat(res.data.students));
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
		const timerId = setTimeout(
			() => {
				setIsLoading(true);
				setFirstLoad(false);
				getRoom(searchQuery, 1, id)
					.then(res => {
						if (res.data.last_page > res.data.current_page) {
							setHasMore(true);
						} else {
							setHasMore(false);
						}
						setPage(res.data.current_page + 1);
						setRows(res.data.students.filter(child => child.status === 1));
						setRow(res.data);
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
			clearTimeout(timerId);
		};
		// eslint-disable-next-line
	}, [dispatch, searchQuery, id, props.refresh]);

	return (
		<div className="rooms-container">
			<div className="flex justify-between items-end">
				<h3 className="" style={{ fontSize: '20px', fontWeight: '700' }}>
					<span className="">
						<IconButton
							onClick={() => {
								history.goBack();
							}}
						>
							<img src="assets/images/arrow-long.png" alt="filter" width="24px" className="backBtn-img" />
						</IconButton>
					</span>

					{row.name}
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
							<TableCell className="bg-white checkinout-table-header" style={{ width: '26%' }}>
								Name
							</TableCell>
							<TableCell className="bg-white checkinout-table-header" style={{ width: '19%' }}>
								Age
							</TableCell>
							<TableCell className="bg-white checkinout-table-header" style={{ width: '19%' }}>
								Date of Birth
							</TableCell>
							<TableCell className="bg-white checkinout-table-header" style={{ width: '18%' }}>
								Gender
							</TableCell>
							<TableCell className="bg-white checkinout-table-header" style={{ width: '18%' }}>
								Status
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
							rows?.map(student => (
								<TableRow
									style={{ cursor: 'pointer' }}
									key={student.id}
									onClick={() => handleIdChange(student.id)}
									className={activeId === student.id ? 'active-student-row' : ''}
								>
									<TableCell style={{ fontWeight: 700 }} component="th" scope="row">
										<div className="flex items-center">
											<Avatar alt="student-face" className="mr-16" src={student.photo} />
											<div className="room-student-name">{`${student.first_name} ${student.last_name}`}</div>
										</div>
									</TableCell>
									<TableCell style={{ fontWeight: 700 }}>
										{new Date(new Date() - new Date(student.date_of_birth)).getFullYear() - 1970}{' '}
										years old
									</TableCell>
									<TableCell style={{ fontWeight: 700 }}>
										{new Date(student.date_of_birth)
											.toDateString()
											.split(' ')
											.slice(1)
											.join(' ')}
									</TableCell>
									<TableCell style={{ fontWeight: 700 }}>{student.gender}</TableCell>
									<TableCell
										style={{
											fontWeight: 700,
											color: student.checkin_status === 'checkout' ? 'red' : '#04C01C'
										}}
									>
										{student.checkin_status === 'checkout' ? 'Checked Out' : 'Checked In'}
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

export default StudentTable;
