/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React, { useState, useEffect, useRef } from 'react';
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
} from '@material-ui/core';
import { getSchedule } from 'app/services/rooms/roomsschedules';
import { useDispatch, useSelector } from 'react-redux';
import * as Actions from 'app/store/actions';
import InfiniteScroll from 'react-infinite-scroll-component';
import CustomButton from 'app/customComponents/CustomButton/CustomButton';
import Deleteconfirmschedule from './Deleteconfirmschedule';
import { useParams } from 'react-router';
import { convertTimeTo12HourFormat } from 'utils/utils';

function Roomsschedules() {
	const dispatch = useDispatch();
	const [searchQuery, setSearchQuery] = useState('');
	const [rows, setRows] = useState([]);
	const [isLoading, setIsLoading] = useState(false);
	const [hasMore, setHasMore] = useState(false);
	const [firstLoad, setFirstLoad] = useState(true);
	const [fetchingMore, setFetchingMore] = useState(false);
	const [refresh, setRefresh] = useState(false);
	const [page, setPage] = useState(1);
	const [activeTab, setActiveTab] = useState(0);
	const user = useSelector(({ auth }) => auth.user);

	const { id } = useParams();
	const { row } = history.location.state;

	const handledelete = (row) => {
		dispatch(
			Actions.openDialog({
				children: <Deleteconfirmschedule row={row} refresh={refresh} setRefresh={setRefresh} />,
			})
		);
	};

	useEffect(() => {
		const timeout = setTimeout(
			() => {
				setIsLoading(true);
				getSchedule(id, user.school?.id || user.data?.school?.id, 1)
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
	}, [refresh]);

	const handleLoadMore = () => {
		setFetchingMore(true);
		getSchedule(id, user.school?.id || user.data?.school?.id, page)
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

	return (
		<>
			<>
				<div className="top-bar">
					<div className="flex mx-auto" style={{ gap: 20 }}>
						<span
							onClick={() => {
								setActiveTab(0);
								history.push({ pathname: `/rooms-room/${id}`, state: { row } });
							}}
							className="cursor-pointer personal-hd  font-semibold text-1xl mr-30 ml-40"
						>
							<h1 className={`${activeTab === 0 ? 'active-room-hd' : ''} room-hd`}>Students</h1>
						</span>
						<span
							onClick={() => {
								setActiveTab(1);
								history.push({ pathname: `/rooms-room/${id}`, state: { row, feeds: true } });
							}}
							className="cursor-pointer personal-hd text-1xl font-semibold"
						>
							<h1 className={`${activeTab === 1 ? 'active-room-hd' : ''} room-hd`}>Feeds</h1>
						</span>
					</div>
				</div>
			</>
			<div className="mx-auto room-width">
				<div className="flex items-center flex-nowrap justify-between">
					<span className="text-2xl self-end  mr-28 text-room" style={{ fontWeight: '700' }}>
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
						Schedules
					</span>{' '}
					<div className="flex justify-between">
						<div className="self-end">
							<span>
								<div
									style={{
										alignSelf: 'center',
										marginTop: 20,
									}}
								>
									<CustomButton
										variant="primary"
										width="179px"
										height="39px"
										fontSize="15px"
										onClick={() => {
											history.push({ pathname: `/rooms-addschedules/${row?.id}`, state: row });
										}}
									>
										+ Add Schedules
									</CustomButton>
								</div>
							</span>
						</div>
					</div>
				</div>
				<TableContainer id="Scrollable-table" component={Paper} className="room-table-cont">
					<Table stickyHeader className="student-table" style={{ width: '100%' }}>
						<TableHead>
							<TableRow>
								<TableCell style={{ width: '15%' }} className="bg-white studentTableHeader">
									Start Time
								</TableCell>
								<TableCell style={{ width: '15%' }} className="bg-white studentTableHeader">
									End Time
								</TableCell>
								<TableCell style={{ width: '25%' }} className="bg-white studentTableHeader approve-hd ">
									Subject
								</TableCell>
								<TableCell style={{ width: '30%' }} className="bg-white studentTableHeader approve-hd ">
									Activity Type
								</TableCell>
								<TableCell style={{ width: '15%' }} className="bg-white studentTableHeader approve-hd ">
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
										No Schedules
									</TableCell>
								</TableRow>
							) : (
								rows?.map((row) => (
									<TableRow key={row.id}>
										<TableCell style={{ fontWeight: 700 }} component="th" scope="row">
											<div className="flex ">
												<div className="flex flex-col items-start">
													<div className="truncate break-word std-name">
														{/* {moment.utc(row.start_time).local().format('LT')} */}
														{convertTimeTo12HourFormat(row.start_time)}
													</div>
												</div>
											</div>
										</TableCell>
										<TableCell style={{ fontWeight: 700 }} component="th" scope="row">
											<div className="flex ">
												<div className="flex flex-col items-start">
													<div className="truncate break-word std-name">
														{convertTimeTo12HourFormat(row.end_time)}
													</div>
												</div>
											</div>
										</TableCell>
										<TableCell style={{ fontWeight: 700 }}>
											<div className="flex items-center">
												<Avatar src={row.thumb} style={{ width: 30, height: 30 }} />
												<div className="name-subject break-word">{row.subject}</div>
											</div>
										</TableCell>
										<TableCell style={{ fontWeight: 700 }}>
											<div className="schedule-type break-word">{row.type}</div>
										</TableCell>
										<TableCell style={{ fontWeight: 700 }} component="th" scope="row">
											<IconButton
												size="small"
												onClick={() => {
													history.push({
														pathname: `/rooms-updateschedule/${row.id}`,
														state: { row },
													});
												}}
											>
												<img src="assets/images/circle-edit.png" alt="edit" width="25px" />
											</IconButton>
											<IconButton size="small" onClick={() => handledelete(row)}>
												<img src="assets/images/dlt.png" alt="edit" width="25px" />
											</IconButton>
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
							<TableRow className="table-activity">
								<TableCell className="full-row " colSpan={5}>
									<div className="addactivty-btn">
										<div
											onClick={() => {
												history.push({
													pathname: `/rooms-addschedules/${row?.id}`,
													state: row,
												});
											}}
											style={{ cursor: 'pointer' }}
										>
											{/* <a href='/addschedules'> */}
											<img alt="add-icon" src="assets/images/add.png" />
											<p> + Add Activity</p>
											{/* </a> */}
										</div>
									</div>
								</TableCell>
							</TableRow>
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
export default Roomsschedules;
