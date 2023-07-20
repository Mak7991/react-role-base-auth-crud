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
	makeStyles,
} from '@material-ui/core';
import { useDispatch } from 'react-redux';
import * as Actions from 'app/store/actions';
import { getFeedsType } from 'app/services/rooms/rooms';
import { useParams } from 'react-router';
import InfiniteScroll from 'react-infinite-scroll-component';
import moment from 'moment';

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
function FeedsTypeDetail() {
	const dispatch = useDispatch();
	const classes = useStyles();
	const [rows, setRows] = useState([]);
	const [isLoading, setIsLoading] = useState(false);
	const [hasMore, setHasMore] = useState(false);
	const [firstLoad, setFirstLoad] = useState(true);
	const [fetchingMore, setFetchingMore] = useState(false);
	const [page, setPage] = useState(1);
	const { id } = useParams();
	const { room } = history.location.state;

	useEffect(() => {
		const timeout = setTimeout(
			() => {
				setIsLoading(true);
				const payload = {
					id,
					page,
					room_id: room.id
				};
				getFeedsType(payload)
					.then((res) => {
						setFirstLoad(false);
						setRows(res.data.data);
						setHasMore(res.data.to < res.data.total);
						setPage(page + 1);
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
	}, []);

	const handleLoadMore = () => {
		setFetchingMore(true);
		const payload = {
			id,
			page,
			room_id: room.id
		};
		getFeedsType(payload)
			.then((res) => {
				setFirstLoad(false);
				setRows(rows.concat(res.data.data));
				setHasMore(res.data.current_page < res.data.last_page);
				setFetchingMore(false);
				setPage(page + 1);
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

	return (
		<>
			<div className="mx-auto room-width">
				<div className="flex items-center flex-nowrap justify-between">
					<span className="personal-hd info-hd stext-2xl self-end  " style={{ fontWeight: '700' }}>
						<h1 className="hd-main">
							{' '}
							<span className="mr-12 icon-color">
								<IconButton
									onClick={() => {
										history.push({
											pathname: `/rooms-room/${room.id}`,
											state: { row: room, feeds: true },
										});
									}}
									className="pl-0"
								>
									<img
										src="assets/images/arrow-long.png"
										alt="filter"
										width="24px"
										className="fiterimg"
									/>
								</IconButton>
							</span>{' '}
							Feeds
						</h1>
					</span>
				</div>
				<TableContainer id="Scrollable-table" component={Paper} className="room-table-cont">
					<Table stickyHeader className="rooms-table" style={{ width: '100%' }}>
						<TableHead>
							<TableRow>
								<TableCell className="bg-white roomsTableHeader" style={{ width: '30%' }}>
									Activity Type
								</TableCell>
								<TableCell className="bg-white roomsTableHeader" style={{ width: '30%' }}>
									Students
								</TableCell>
								<TableCell className="bg-white roomsTableHeader" style={{ width: '30%' }}>
									Time
								</TableCell>
								<TableCell className="bg-white roomsTableHeader" style={{ width: '30%' }}>
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
										No Feeds to show
									</TableCell>
								</TableRow>
							) : (
								rows?.map((row) => (
									<TableRow key={row.id}>
										<TableCell component="th" scope="row">
											<div className="flex items-center">
												<Avatar
													className="mr-16"
													alt="activity-face"
													src={row.activity.photo}
												/>
												<div className="rooms-school-name">{row.activity.name}</div>
											</div>
										</TableCell>

										<TableCell>
											<div className="flex items-center">
												<Avatar alt="Student-1" className="mr-16" src={row?.student?.photo} />
												<div className="flex flex-col items-start">
													<div className="student-name truncate break-word">
														{row.student?.first_name} {row.student?.last_name}
													</div>
													<div className="font-normal truncate student-age-font">
														{row.student?.age}
													</div>
												</div>
											</div>
										</TableCell>
										<TableCell>{moment(row?.created_at).format('LT')}</TableCell>
										<TableCell>{moment(row?.created_at).format('l')}</TableCell>
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

export default FeedsTypeDetail;
