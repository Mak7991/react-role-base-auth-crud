import React, { useState, useEffect } from 'react';
import FuseAnimate from '@fuse/core/FuseAnimate';
import {
	Table,
	TableContainer,
	TableCell,
	TableRow,
	Paper,
	TableHead,
	TableBody,
	CircularProgress,
	Avatar
} from '@material-ui/core';
import CustomButton from 'app/customComponents/CustomButton/CustomButton';
import { getCameraListing } from 'app/services/liveStreaming/liveStreaming';
import { useDispatch } from 'react-redux';
import InfiniteScroll from 'react-infinite-scroll-component';
import * as Actions from 'app/store/actions';
import DisableConfirmDialog from './DisableConfirmDialog';
import './CameraListing.css';

function CameraListing() {
	const dispatch = useDispatch();
	const [isLoading, setIsLoading] = useState(false);
	const [rows, setRows] = useState([]);
	const [firstLoad, setFirstLoad] = useState(true);
	const [page, setPage] = useState(1);
	const [fetchingMore, setFetchingMore] = useState(false);
	const [hasMore, setHasMore] = useState(false);
	const [refresh, setRefresh] = useState(false);

	useEffect(() => {
		const timeout = setTimeout(
			() => {
				setIsLoading(true);
				getCameraListing(1)
					.then(res => {
						setFirstLoad(false);
						setRows(res.data.data || []);
						setHasMore(res.data.to < res.data.total);
						setPage(res.data.current_page + 1);
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
		return () => {
			clearTimeout(timeout);
		};
		// eslint-disable-next-line
	}, [refresh]);

	const handleLoadMore = () => {
		setFetchingMore(true);
		getCameraListing(page)
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

	const handleDisconnect = row => {
		dispatch(
			Actions.openDialog({
				children: <DisableConfirmDialog row={row} setRefresh={setRefresh} refresh={refresh} />
			})
		);
	};

	return (
		<FuseAnimate animation="transition.slideLeftIn" duration={600}>
			<div className="camera-container">
				<span className="text-xl self-end font-bold mr-28">Camera Information</span>
				<TableContainer id="Scrollable-table" component={Paper} className="camera-table-cont mt-10">
					<Table stickyHeader style={{ width: '100%' }}>
						<TableHead>
							<TableRow>
								<TableCell className="bg-white camera-table-header">Room Name</TableCell>
								<TableCell className="bg-white camera-table-header">Device Id</TableCell>
								<TableCell className="bg-white camera-table-header">Status</TableCell>
								<TableCell align="center" className="bg-white camera-table-header">
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
										No records available
									</TableCell>
								</TableRow>
							) : (
								rows?.map(row => (
									<TableRow key={row.id}>
										<TableCell>
											<div className="flex items-center" style={{ gap: '5px' }}>
												<Avatar src={row?.room?.photo} />
												<div className="flex flex-col">
													<div className="camera-room-name">
														{row?.room ? row?.room?.name : row?.room_name}
													</div>
												</div>
											</div>
										</TableCell>
										<TableCell>
											<div className="truncate">{row?.camera_mac_address}</div>
										</TableCell>
										<TableCell>
											<div
												style={{
													fontWeight: 'bold',
													fontSize: 12,
													color: `${row.stream_url ? '#04C01C' : '#FF4B4B'}`
												}}
											>
												{row.stream_url ? 'Active' : 'Inactive'}
											</div>
										</TableCell>
										<TableCell align="center">
											<CustomButton
												variant="primary"
												width={150}
												heihgt={33}
												onClick={() => handleDisconnect(row)}
											>
												Disconnect
											</CustomButton>
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

export default CameraListing;
