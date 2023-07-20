import React, { useState, useEffect, useRef } from 'react';
import FuseAnimate from '@fuse/core/FuseAnimate';
import {
	Table,
	TableHead,
	TableBody,
	TableCell,
	IconButton,
	TableContainer,
	TableRow,
	Paper,
	CircularProgress
} from '@material-ui/core';
import './savedclip.css';
import { getclips, deleteclip, getMutedClip } from 'app/services/liveStreaming/liveStreaming';
import * as Actions from 'app/store/actions';
import { useDispatch } from 'react-redux';
import dayjs from 'dayjs';
import InfiniteScroll from 'react-infinite-scroll-component';
import axios from 'axios';
import moment from 'moment';

function SavedClips() {
	const dispatch = useDispatch();
	const [rows, setRows] = useState([]);
	const [isLoading, setIsLoading] = useState(false);
	const [firstLoad, setFirstLoad] = useState(true);
	const [fetchingMore, setFetchingMore] = useState(false);
	const [refresh, setRefresh] = useState(false);
	const [isRequesting, setIsRequesting] = useState(false);
	const [hasMore, setHasMore] = useState(false);
	const [page, setPage] = useState(1);
	const [isDownloadingClip, setIsDownloadingClip] = useState({ index: null, status: false });

	const handledownload = async row => {
		let downloadUrl;
		if (!isDownloadingClip.status) {
			setIsDownloadingClip({ index: row.id, status: true });
			if (row.audio_enabled) {
				downloadUrl = row.clip.url;
			} else if (row.clip.mute_link) {
				downloadUrl = row.clip.mute_link;
			} else {
				const resp = await getMutedClip(row.clip.id);
				downloadUrl = resp.data.data;
			}
			const config = {
				method: 'get',
				responseType: 'blob',
				url: downloadUrl
			};
			console.log(config);
			const newAxios = axios.create({});
			delete newAxios.defaults.headers.common.Authorization;
			newAxios(config)
				.then(response => {
					const url = window.URL.createObjectURL(new Blob([response.data], { type: 'video/mp4' }));
					const link = document.createElement('a');
					link.href = url;
					link.setAttribute('download', row.clip.name); // or any other extension
					document.body.appendChild(link);
					link.click();
				})
				.catch(error => {
					console.log(error);
				})
				.finally(() => {
					setIsDownloadingClip({ index: null, status: false });
				});
		}
	};
	useEffect(() => {
		setIsLoading(true);
		getclips(1)
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
	}, [refresh]);

	const handleLoadMore = () => {
		setFetchingMore(true);
		getclips(page)
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
	return (
		<FuseAnimate animation="transition.slideLeftIn" duration={600}>
			<div className="mx-auto student-cont">
				<div>
					<span className="text-xl self-end font-bold mr-28"> Save Clips </span>
				</div>
				<TableContainer id="Scrollable-table" component={Paper} className="savedclip-table-cont">
					<Table stickyHeader className="student-table" style={{ width: '100%' }}>
						<TableHead>
							<TableRow>
								<TableCell style={{ width: '20%' }} className="bg-white studentTableHeader">
									Video Clip
								</TableCell>
								<TableCell style={{ width: '20%' }} className="bg-white studentTableHeader">
									Recorded Clip date
								</TableCell>
								<TableCell style={{ width: '20%' }} className="bg-white studentTableHeader">
									Saved Clip Date
								</TableCell>
								<TableCell style={{ width: '15%' }} className="bg-white studentTableHeader">
									File Size
								</TableCell>
								<TableCell style={{ width: '15%' }} className="bg-white studentTableHeader">
									Audio
								</TableCell>
								<TableCell style={{ width: '15%' }} className="bg-white studentTableHeader">
									Status
								</TableCell>
								<TableCell style={{ width: '15%' }} className="bg-white studentTableHeader">
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
										No Saved clip
									</TableCell>
								</TableRow>
							) : (
								rows?.map(row => (
									<TableRow key={row.id}>
										<TableCell
											style={{
												fontSize: '13px',
												maxWidth: '100px',
												fontWeight: 'bold',
												overflow: 'hidden',
												textOverflow: 'ellipsis',
												whiteSpace: 'nowrap'
											}}
											className="bg-white truncate"
										>
											<div className="flex flex-col">
												<div className="flex">
													{/* <Avatar
                            className="mr-6"
                            alt="student-face"
                            src={row.student.photo}
                          /> */}
													<div className="flex  items-center justify-content: center">
														<div className="report-std truncate width-name">
															{row?.clip?.name}
														</div>
													</div>
												</div>
											</div>
										</TableCell>
										<TableCell
											style={{
												fontSize: '13px',
												maxWidth: '100px',
												fontWeight: 'bold',
												overflow: 'hidden',
												textOverflow: 'ellipsis',
												whiteSpace: 'nowrap'
											}}
											className="bg-white truncate"
										>
											<div className="flex">
												<div className="flex  items-center justify-content: center">
													<div className="report-std truncate">
														{/* {moment(row?.clip?.date_added).format('MM-DD-YYYY')} */}
														{row?.clip?.start_time ? (
															<>
																{dayjs(`${row?.clip?.start_time}`).format(
																	'MMMM[ ] D[,] YYYY[,]'
																)}
																&nbsp;
																{moment(row?.clip?.start_time).format('LT')}
															</>
														) : (
															'-'
														)}
													</div>
												</div>
											</div>
										</TableCell>
										<TableCell
											style={{
												fontSize: '13px',
												maxWidth: '100px',
												fontWeight: 'bold',
												overflow: 'hidden',
												textOverflow: 'ellipsis',
												whiteSpace: 'nowrap'
											}}
											className="bg-white truncate"
										>
											<div className="flex">
												<div className="flex  items-center justify-content: center">
													<div className="report-std truncate">
														{row?.created_at ? (
															<>
																{dayjs(`${row?.created_at}z`).format(
																	'MMMM[ ] D[,] YYYY[,]'
																)}
																&nbsp;
																{moment(row?.created_at?.split('_')[0]).format('LT')}
															</>
														) : (
															'-'
														)}
													</div>
												</div>
											</div>
										</TableCell>
										<TableCell
											style={{
												fontSize: '13px',
												maxWidth: '100px',
												fontWeight: 'bold',
												overflow: 'hidden',
												textOverflow: 'ellipsis',
												whiteSpace: 'nowrap'
											}}
											className="bg-white truncate"
										>
											<div className="flex">
												<div className="flex  items-center justify-content: center">
													<div className="report-std truncate">{row.clip.file_size}</div>
												</div>
											</div>
										</TableCell>
										<TableCell
											style={{
												fontSize: '13px',
												maxWidth: '100px',
												fontWeight: 'bold',
												overflow: 'hidden',
												textOverflow: 'ellipsis',
												whiteSpace: 'nowrap'
											}}
											className="bg-white truncate"
										>
											<div className="flex">
												<div className="flex  items-center justify-content: center">
													<div className="report-std truncate email-width">
														{/* {row?.attendance_role?.email || row?.school.name} */}
														{row.audio_enabled === 1 ? 'yes' : 'no'}
													</div>
												</div>
											</div>
										</TableCell>
										<TableCell
											style={{
												fontSize: '13px',
												maxWidth: '100px',
												fontWeight: 'bold',
												overflow: 'hidden',
												textOverflow: 'ellipsis',
												whiteSpace: 'nowrap'
											}}
											className="bg-white truncate"
										>
											<div className="flex ">
												<div className="flex  items-center justify-content: center ">
													<div className="report-std truncate">
														{row?.status ? row?.status : '-'}
													</div>
												</div>
											</div>
										</TableCell>
										<TableCell
											style={{ fontWeight: 700, display: 'flex' }}
											component="th"
											scope="row"
										>
											<div style={{ display: 'block', width: '58px' }}>
												{isDownloadingClip.status && isDownloadingClip.index === row.id ? (
													<CircularProgress size={25} />
												) : (
													<IconButton
														size="small"
														onClick={() => {
															handledownload(row);
														}}
													>
														<img src="assets/images/download.png" alt="edit" />
													</IconButton>
												)}
											</div>
											<IconButton
												size="small"
												onClick={() => {
													if (!isRequesting) {
														setIsRequesting(true);
														deleteclip(row.id)
															.then(res => {
																setRefresh(!refresh);
																dispatch(
																	Actions.showMessage({
																		message:
																			'Saved clip has been removed successfully.',
																		autoHideDuration: 1500,
																		variant: 'success'
																	})
																);
															})
															.catch(err => {
																dispatch(
																	Actions.showMessage({
																		message: 'noooo data',
																		variant: 'error'
																	})
																);
															})
															.finally(() => {
																setIsRequesting(false);
															});
													}
												}}
											>
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

export default SavedClips;
