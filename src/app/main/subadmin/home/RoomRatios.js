import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import * as Actions from 'app/store/actions';
import {
	TableContainer,
	Table,
	Paper,
	TableRow,
	TableCell,
	CircularProgress,
	TableBody,
	Avatar,
	TableHead
} from '@material-ui/core';
import { getRoomRatios } from 'app/services/rooms/rooms';
import InfiniteScroll from 'react-infinite-scroll-component';
import Pusher from 'pusher-js';
import CustomButton from 'app/customComponents/CustomButton/CustomButton';

function RoomRatios() {
	const dispatch = useDispatch();
	const [viewAll, setViewAll] = useState(false);
	const [totalRooms, setTotalRooms] = useState([]);
	const [hasMore, setHasMore] = useState(false);
	const [page, setPage] = useState(1);
	const [loading, setLoading] = useState(false);
	const [loadingMore, setLoadingMore] = useState(false);
	const user = useSelector(({ auth }) => auth.user);

	useEffect(() => {
		setLoading(true);
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
				setLoading(false);
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

	const getMoreRooms = () => {
		setViewAll(true);
	};

	const handleLoadMore = () => {
		setLoadingMore(true);
		getRoomRatios(page)
			.then(({ data }) => {
				setTotalRooms(totalRooms.concat(data.data));
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
				setLoadingMore(false);
			});
	};

	return (
		<div className="ratio-div">
			<div className="child-man-div flex justify-between items-end">
				<h4 className="child-hd self-end" style={{ fontWeight: '700' }}>
					Current Room Ratios
				</h4>
				<span className="cursor-pointer">
					{!viewAll && totalRooms.length > 5 ? (
						<CustomButton
							variant="secondary"
							fontSize="15px"
							style={{
								justifyContent: 'space-evenly',
								display: 'flex',
								alignItems: 'center'
							}}
							onClick={() => getMoreRooms()}
						>
							View all <span className="chevron-right-icon">&#8250;</span>
						</CustomButton>
					) : (
						''
					)}
				</span>
			</div>
			<div className="inner-bdy">
				<TableContainer id="Rooms-Listing" component={Paper} className="room-ratio-table">
					<Table stickyHeader className="w-full">
						<TableHead>
							<TableRow>
								<TableCell className="bg-white roomRatioHeader">Rooms</TableCell>
								<TableCell className="bg-white roomRatioHeader" align="center">
									Students
								</TableCell>
								<TableCell className="bg-white roomRatioHeader" align="center">
									Staff
								</TableCell>
							</TableRow>
						</TableHead>
						<TableBody>
							{loading && (
								<TableRow>
									<TableCell align="center" colSpan={8} className="bg-white">
										<CircularProgress size={35} />
									</TableCell>
								</TableRow>
							)}
							{!totalRooms[0] && !loading && (
								<TableRow>
									<TableCell align="center" colSpan={3}>
										No rooms
									</TableCell>
								</TableRow>
							)}
							{totalRooms.slice(0, viewAll ? totalRooms.length : 5).map((room, key) => {
								return (
									<TableRow key={key} className="w-full">
										<TableCell
											className="room-image"
											style={{ paddingTop: '14px', paddingBottom: '12px' }}
										>
											<div className="flex items-center">
												<Avatar src={room?.photo} />
												<div className="flex ">
													<span className="m-4" style={{ fontWweight: '700' }}>
														{room?.name}
													</span>
												</div>
											</div>
										</TableCell>
										<TableCell
											align="center"
											style={{ paddingTop: '12px', paddingBottom: '12px', fontWeight: '700' }}
										>
											<span className="rooms-ration-student">{room?.checkins_room_count}</span>
										</TableCell>
										<TableCell align="center" style={{ paddingTop: '12px', paddingBottom: '12px' }}>
											<span className={room.staff_checkins?.length >= 2 ? '' : 'text-red'}>
												{room.staff_checkins?.length}
											</span>
										</TableCell>
									</TableRow>
								);
							})}
							{loadingMore && (
								<TableRow>
									<TableCell align="center" colSpan={8} className="bg-white student-image">
										<CircularProgress size={35} />
									</TableCell>
								</TableRow>
							)}
						</TableBody>
					</Table>
				</TableContainer>
				{viewAll && (
					<InfiniteScroll
						dataLength={totalRooms.length}
						next={handleLoadMore}
						hasMore={hasMore}
						scrollableTarget="Rooms-Listing"
					/>
				)}
			</div>
		</div>
	);
}

export default RoomRatios;
