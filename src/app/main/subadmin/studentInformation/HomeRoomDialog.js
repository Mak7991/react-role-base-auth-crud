/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import * as Actions from 'app/store/actions';
import InfiniteScroll from 'react-infinite-scroll-component';
import { CircularProgress } from '@material-ui/core';
import { getRooms, changeHomeRoom } from 'app/services/rooms/rooms';

function HomeRoomDialog({ row, refresh, setRefresh }) {
	const dispatch = useDispatch();
	const [isLoading, setIsLoading] = useState(false);
	const [sending, setSending] = useState(false);
	const [hasMore, setHasMore] = useState(false);
	const [rows, setRows] = useState([]);
	const [page, setPage] = useState(1);
	const [activeId, setActiveId] = useState(row.home_room.id);

	useEffect(() => {
		setIsLoading(true);
		getRooms('')
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
		// eslint-disable-next-line
	}, [dispatch]);

	const handleLoadMore = () => {
		getRooms('', page)
			.then(res => {
				if (res.data.last_page > res.data.current_page) {
					setHasMore(true);
				} else {
					setHasMore(false);
				}
				setPage(res.data.current_page + 1);
				setRows(rows.concat(res.data.data));
			})
			.catch(err => {
				dispatch(
					Actions.showMessage({
						message: 'Failed to fetch data, please refresh',
						variant: 'error'
					})
				);
			});
	};

	const handleRoomChange = () => {
		setSending(true);
		const data = {
			student_id: row.id,
			room_id: activeId
		};
		changeHomeRoom(data)
			.then(res => {
				setRefresh(refresh + 1);
				dispatch(
					Actions.showMessage({
						message: res.data.message,
						variant: 'success'
					})
				);
				dispatch(Actions.closeDialog());
				setSending(false);
			})
			.catch(err => {
				console.log({ ...err });
				setSending(false);
			});
	};

	return (
		<div className="bg-white px-32 school-list-card">
			<div className="flex justify-between school-list-header">
				<div>
					<h1 style={{fontSize:'20px'}}> Choose Homeroom</h1>
				</div>
				<div>
					<i
						style={{ cursor: 'pointer' }}
						className="fas fa-times"
						onClick={() => dispatch(Actions.closeDialog())}
					/>
				</div>
			</div>
			<div id="scrollable-list" className="school-list-cont w-full">
				{isLoading ? (
					<div className="w-1/12 mx-auto mt-16">
						<CircularProgress size={35} />
					</div>
				) : (
					rows?.map((immu, i, arr) => {
						return (
							<div
								onClick={() => setActiveId(immu.id)}
								style={{
									cursor: 'pointer',
									background: immu.id === activeId ? '#F0F9FF' : 'white'
								}}
								key={immu.name}
							>
								<div className="p-16 flex justify-between">
									<div className="hd-school hd-schooling">
										<h5>{immu.name}</h5>
									</div>
									<div
										className="tick-wrapper-custom"
										style={{
											background: immu.id === activeId ? '#4DA0EE' : 'white',
											padding: '2px 5px'
										}}
									>
										<i className="fas fa-check" />
									</div>
								</div>
								{i !== arr.length - 1 && <hr style={{ borderColor: 'lightgray' }} />}
							</div>
						);
					})
				)}
			</div>
			<div className="w-full flex justify-center">
				{sending ? (
					<div className="w-1/12 mx-auto mt-24">
						<CircularProgress size={35} />
					</div>
				) : (
					<button type="button" onClick={handleRoomChange} className="view-school-btn">
						Update Homeroom
					</button>
				)}
			</div>
			<InfiniteScroll
				dataLength={rows.length}
				next={handleLoadMore}
				hasMore={hasMore}
				scrollableTarget="scrollable-list"
			/>
		</div>
	);
}

export default HomeRoomDialog;
