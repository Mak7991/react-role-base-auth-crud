import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import * as Actions from 'app/store/actions';
import CustomButton from 'app/customComponents/CustomButton/CustomButton';
import {
	TableContainer,
	Table,
	Paper,
	TableRow,
	TableCell,
	CircularProgress,
	TableBody,
	Avatar
} from '@material-ui/core';
import { getTotalRooms } from 'app/services/SuperAdminHomeService/superAdminHomeService';
import InfiniteScroll from 'react-infinite-scroll-component';

function TotalRoom() {
	const dispatch = useDispatch();
	const [viewAll, setViewAll] = useState(false);
	const [totalRooms, setTotalRooms] = useState([]);
	const [roomsCount, setRoomsCount] = useState(null);
	const [hasMore, setHasMore] = useState(false);
	const [page, setPage] = useState(1);
	const [loading, setLoading] = useState(false);
	const [loadingMore, setLoadingMore] = useState(false);

	useEffect(() => {
		setLoading(true);
		getTotalRooms(1)
			.then(({ data }) => {
				setTotalRooms(data.data);
				setRoomsCount(data.total);
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
	}, []);

	const handleLoadMore = () => {
		setLoadingMore(true);
		getTotalRooms(page)
			.then(({ data }) => {
				setTotalRooms(totalRooms.concat(data.data));
				setRoomsCount(data.total);
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
		<>
			<div className="flex flex-row justify-between pr-34 pl-34 items-center">
				<h3>
				<span className="" style={{ fontSize: '18px', fontWeight: '700' }}>
						Rooms</span> <span>|</span>{' '}
					<span className="schoolTableHeader">{roomsCount || ''}</span>
				</h3>
				{!viewAll && totalRooms.length > 5 ? (
					<span>
						<CustomButton
							variant="secondary"
							fontSize="15px"
							style={{ justifyContent: 'space-evenly', display: 'flex', alignItems: 'center' }}
							onClick={() => setViewAll(true)}
						>
							View all <span className="chevron-right-icon">&#8250;</span>
						</CustomButton>
					</span>
				) : (
					''
				)}
			</div>
			<TableContainer id="Rooms-Listing" component={Paper} className="room-table-container">
				<Table stickyHeader className="w-full">
					<TableBody>
						{loading && (
							<TableRow>
								<div className="mt-64 text-center">
									<CircularProgress size={35} />
								</div>
							</TableRow>
						)}
						{!totalRooms[0] && !loading && (
							<TableRow>
								<div className="mt-64 text-center">No rooms</div>
							</TableRow>
						)}
						{totalRooms.slice(0, viewAll ? totalRooms.length : 5).map((room, key) => {
							return (
								<TableRow key={key} className="w-full">
									<TableCell>
										<div className="grid auto-col-min auto-row-min">
											<div className="flex items-center " style={{ marginRight: 20 }}>
												<Avatar className="mr-4" alt="parent-face" src={room?.photo} />

												<div className="flex flex-col">
													<div className="parent-name truncate" style={{ fontWeight: '800' }}>
														{room?.name}
													</div>
												</div>
											</div>
										</div>
									</TableCell>

									<TableCell className="w-4/4">
										<div className="">
											<div>
												<span
													style={{
														display: 'flex',
														alignItems: 'center',
														justifyContent: 'end'
													}}
												>
													{room?.students_count}&nbsp;Students
												</span>
											</div>
										</div>
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
		</>
	);
}

export default TotalRoom;
