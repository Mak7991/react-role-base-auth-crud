import React, { useState, useEffect, useRef } from 'react';
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
	Avatar
} from '@material-ui/core';
import FuseAnimate from '@fuse/core/FuseAnimate';
import { useDispatch, useSelector } from 'react-redux';
import * as Actions from 'app/store/actions';
import './Reports.css';
import { useReactToPrint } from 'react-to-print';
import { getRoomRatios } from 'app/services/rooms/rooms';
import Pusher from 'pusher-js';
import { capitalize } from 'lodash';

export default function RoomCheck() {
	const dispatch = useDispatch();
	const [rows, setRows] = useState([]);
	const [isLoading, setLoading] = useState(false);
	const [firstLoad, setFirstLoad] = useState(true);
	const enrolledStudentRef = useRef(null);
	const [rooms, setRooms] = useState([]);
	const [roomPage, setRoomPage] = useState(1);
	const [totalRooms, setTotalRooms] = useState([]);
	const [hasMore, setHasMore] = useState(false);
	const [page, setPage] = useState(1);
	const [fetchingMore, setFetchingMore] = useState(false);

	const user = useSelector(({ auth }) => auth.user);

	// useEffect(() => {
	// 	setFetchingMore(true);
	// 	getRoomRatios(1)
	// 		.then(({ data }) => {
	// 			setTotalRooms(data.data);
	// 			if (data.current_page < data.last_page) {
	// 				setHasMore(true);
	// 				setPage(data.current_page + 1);

	// 			} else {
	// 				setHasMore(false);
	// 			}
	// 			console.log(data)
	// 		})
	// 		.catch(err => {
	// 			if (err.response?.data?.message) {
	// 				dispatch(
	// 					Actions.showMessage({
	// 						message: err?.response?.data?.message,
	// 						autoHideDuration: 2500,
	// 						variant: 'error'
	// 					})
	// 				);
	// 			} else {
	// 				dispatch(
	// 					Actions.showMessage({
	// 						message: 'Failed to load schools',
	// 						autoHideDuration: 2500,
	// 						variant: 'error'
	// 					})
	// 				);
	// 			}
	// 		})
	// 		.finally(() => {
	// 			setFetchingMore(false);
	// 		});
	// }, []);

	useEffect(() => {
		setFetchingMore(true);
		getRoomRatios(1)
			.then(({ data }) => {
				setTotalRooms(data.data);
				if (data.current_page < data.last_page) {
					setHasMore(true);
					setPage(data.current_page + 1);
				} else {
					setHasMore(false);
				}
			})
			.catch(err => {
				if (err.response?.data?.message) {
					dispatch(
						Actions.showMessage({
							message: err?.response?.data?.message,
							autoHideDuration: 2500,
							variant: 'error'
						})
					);
				} else {
					dispatch(
						Actions.showMessage({
							message: 'Failed to load schools',
							autoHideDuration: 2500,
							variant: 'error'
						})
					);
				}
			})
			.finally(() => {
				setFetchingMore(false);
			});

		const pusher = new Pusher(process.env.REACT_APP_PUSHER_CHANNEL_ID, {
			cluster: process.env.REACT_APP_PUSHER_CLUSTER_ID 
		});
		const channel = pusher.subscribe(
			`ld-channel-${
				user.role[0] === 'school_admin' || user.role[0] === 'sub_admin' ? user.data.school.id : user.school?.id
			}`
		);
		channel.bind('ld-room-ratio-update-event', () => {
			getRoomRatios(1)
				.then(({ data }) => {
					setTotalRooms(data.data);
					if (data.current_page < data.last_page) {
						setHasMore(true);
						setPage(data.current_page + 1);
					} else {
						setHasMore(false);
					}
				})
				.catch(err => {
					if (err.response?.data?.message) {
						dispatch(
							Actions.showMessage({
								message: err?.response?.data?.message,
								autoHideDuration: 2500,
								variant: 'error'
							})
						);
					} else {
						dispatch(
							Actions.showMessage({
								message: 'Failed to load schools',
								autoHideDuration: 2500,
								variant: 'error'
							})
						);
					}
				});
		});
		return () => {
			pusher.disconnect();
		};
	}, []);

	return (
		<FuseAnimate animation="transition.slideLeftIn" duration={600}>
			<div className="mx-auto enrolled-cont">
				<div className="flex items-center justify-between">
					<div className="reports-topDiv">
						<h1 className="">
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
							<span className="text-xl self-end font-bold mr-28">Room Check</span>
						</h1>
						<p>Check the real time students staff ratios of classroom</p>
					</div>
				</div>

				{/* table  */}
				<TableContainer id="Scrollable-table" component={Paper} className="student-table-cont">
					<Table stickyHeader className="enrolledtudent-table" style={{ width: '100%' }}>
						<TableHead>
							<TableRow>
								<TableCell style={{ width: '30%' }} className="bg-white studentTableHeader">
									Room
								</TableCell>
								<TableCell style={{ width: '30%' }} className="bg-white studentTableHeader">
									Student In
								</TableCell>
								<TableCell style={{ width: '30%' }} className="bg-white studentTableHeader">
									Staff In
								</TableCell>
								<TableCell style={{ width: '30%' }} className="bg-white studentTableHeader">
									Ratio
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
										No Room Check
									</TableCell>
								</TableRow>
							) : (
								totalRooms?.map(row => (
									<TableRow key={row.id}>
										<TableCell>
											<div className="flex items-center">
												<Avatar src={row?.photo} />
												<div className="flex ">
													<span
														className="m-4 check-name truncate"
														style={{ width: '135px' }}
													>
														{row?.name}
													</span>
												</div>
											</div>
										</TableCell>
										<TableCell>
											<span className="rows-ration-student check-name">
												{row?.checkins_room_count}
											</span>
										</TableCell>
										<TableCell>
											<span className="check-name">{row.staff_checkins?.length}</span>
										</TableCell>
										<TableCell>
											<span className="check-name">
												{row?.checkins_room_count}&nbsp;:&nbsp;{row.staff_checkins?.length}
											</span>
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
		</FuseAnimate>
	);
}
