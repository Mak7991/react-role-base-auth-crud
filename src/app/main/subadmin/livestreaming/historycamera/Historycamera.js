import FusePageSimple from '@fuse/core/FusePageSimple';
import { makeStyles } from '@material-ui/core/styles';
import React, { useRef, useState, useEffect } from 'react';
import FuseAnimate from '@fuse/core/FuseAnimate';
import CustomButton from 'app/customComponents/CustomButton/CustomButton';
import CustomDatePicker from 'app/customComponents/CustomDatePicker/CustomDatePicker';
import clsx from 'clsx';
import { MenuItem, Select, CircularProgress, FormControl } from '@material-ui/core';
import { getRooms } from 'app/services/rooms/rooms';
import { getHistoryVideo, saveRoomClips } from 'app/services/liveStreaming/liveStreaming';
import { useDispatch } from 'react-redux';
import * as Actions from 'app/store/actions';
import './historyCamera.css';
import dayjs from 'dayjs';
import HistoryStreaming from './HistoryStreaming';

const useStyles = makeStyles({
	layoutRoot: {},
	sidebar: {
		width: 320,
	},
	select: {
		'&:before': {
			borderBottom: 'none',
		},
		'& .MuiSelect-select.MuiSelect-select': {
			textAlign: 'left',
		},
		'&:after': {
			borderBottom: 'none',
		},
		'&:not(.Mui-disabled):hover::before': {
			borderBottom: 'none',
		},
		'& .MuiSelect-select:focus': {
			backgroundColor: 'inherit',
		},
	},
	dateStyle: {
		'& .MuiInput-root::after': {
			borderBottom: 'none',
		},
		'& .MuiInput-underline::before': {
			borderBottom: 'none',
		},
		'& .MuiInput-underline:hover::before': {
			borderBottom: 'none',
		},
		'& .MuiInputBase-input': {
			cursor: 'pointer',
		},
		'& .MuiInput-root': {
			cursor: 'pointer',
		},
	},
	divider: {
		backgroundColor: 'grey',
		width: '100%',
		height: 1,
	},
});

function Historycamera() {
	const [rooms, setRooms] = useState([]);
	const [date, setDate] = useState(dayjs(new Date()).format('YYYY-MM-DD'));
	const [isLoading, setIsLoading] = useState(true);
	const [saveLoading, setSaveLoading] = useState(false);
	const [roomPage, setRoomPage] = useState(1);
	const [historyPage, setHistoryPage] = useState(1);
	const [roomData, setRoomData] = useState('');
	const [historyVideoData, setHistoryVideoData] = useState([
		{ id: 0, start_time: '06:00:00', end_time: '07:00:00' },
		{ id: 1, start_time: '07:00:00', end_time: '08:00:00' },
		{ id: 2, start_time: '08:00:00', end_time: '09:00:00' },
		{ id: 3, start_time: '09:00:00', end_time: '10:00:00' },
		{ id: 4, start_time: '10:00:00', end_time: '11:00:00' },
		{ id: 5, start_time: '11:00:00', end_time: '12:00:00' },
		{ id: 6, start_time: '12:00:00', end_time: '13:00:00' },
		{ id: 7, start_time: '13:00:00', end_time: '14:00:00' },
		{ id: 8, start_time: '14:00:00', end_time: '15:00:00' },
		{ id: 9, start_time: '15:00:00', end_time: '16:00:00' },
		{ id: 10, start_time: '16:00:00', end_time: '17:00:00' },
		{ id: 11, start_time: '17:00:00', end_time: '18:00:00' },
		{ id: 12, start_time: '18:00:00', end_time: '19:00:00' },
	]);
	const [activeId, setActiveId] = useState(null);
	const [mute, setMute] = useState(0);
	const [streamUrl, setstreamUrl] = useState('');

	const dispatch = useDispatch();
	const classes = useStyles();
	const pageLayout = useRef(null);

	useEffect(() => {
		setIsLoading(true);
		getRooms('', roomPage)
			.then((res) => {
				setRooms([...rooms, ...res?.data?.data]);
				if (roomPage == 1) {
					setRoomData(res?.data?.data[0]);
				}
				if (res.data.current_page < res.data.last_page) {
					setRoomPage(roomPage + 1);
				}
				setIsLoading(false);
			})
			.catch((err) => {
				dispatch(
					Actions.showMessage({
						message: 'Failed to get rooms.',
						autoHideDuration: 1500,
						variant: 'error',
					})
				);
				setIsLoading(false);
			});
	}, [roomPage, dispatch]);
	// useEffect(() => {
	// 	if (roomData) {
	// 		setIsLoading(true);
	// 		getHistoryVideo(date, roomData?.id)
	// 			.then(res => {
	// 				// setHistoryVideoData(res?.data?.data);
	// 				setActiveId(res?.data?.data[0]);
	// 				if (res.data.current_page < res.data.last_page) {
	// 					setHistoryPage(historyPage + 1);
	// 				}
	// 				if (res?.data?.data.length < 0) {
	// 					setActiveId(null);
	// 				}
	// 				setIsLoading(false);
	// 				// console.log(res, 'history videos');
	// 			})
	// 			.catch(err => {
	// 				dispatch(
	// 					Actions.showMessage({
	// 						message: 'Something went wrong please try again',
	// 						autoHideDuration: 1500,
	// 						variant: 'error'
	// 					})
	// 				);
	// 				setIsLoading(false);
	// 			});
	// 	}
	// }, [roomData, date, dispatch, historyPage]);

	const videoClick = (item) => {
		setActiveId(item);
		if (roomData) {
			getHistoryVideo(`${date} ${item?.start_time}`, `${date} ${item?.end_time}`, roomData?.id)
				.then((res) => {
					console.log(res.data.data.session_url);
					setstreamUrl(res?.data?.data?.session_url);
				})
				.catch((err) => {
					dispatch(
						Actions.showMessage({
							message: 'Something went wrong please try again',
							autoHideDuration: 1500,
							variant: 'error',
						})
					);
				});
		}
	};

	const handleChange = (e, v) => {
		setRoomData(v.props.value);
		setActiveId(null);
	};
	const handleSubmit = () => {
		let payload = {
			clip_id: activeId?.id,
			audio_status: mute,
		};
		console.log(payload, 'payload');
		if (activeId) {
			setSaveLoading(true);
			saveRoomClips(payload)
				.then((res) => {
					dispatch(
						Actions.showMessage({
							message: 'The clip has been saved successfully',
							autoHideDuration: 1500,
							variant: 'success',
						})
					);
					setSaveLoading(false);
				})
				.catch((err) => {
					dispatch(
						Actions.showMessage({
							message: 'Something went wrong please try again',
							autoHideDuration: 1500,
							variant: 'error',
						})
					);
					setSaveLoading(false);
				});
		}
	};
	const ITEM_HEIGHT = 48;
	const ITEM_PADDING_TOP = 8;
	const MenuProps = {
		PaperProps: {
			style: {
				maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
				width: 250,
			},
		},
	};
	return (
		<div style={{ zIndex: -1 }}>
			<FusePageSimple
				classes={{
					root: classes.layoutRoot,
					sidebar: classes.sidebar,
				}}
				content={
					<div className="pl-72 pr-72 pt-20 pb-64 main-content">
						<br />
						<FuseAnimate animation="transition.slideLeftIn" duration={600}>
							<div>
								<div className="w-full">
									<div className="flex items-end">
										<h4 className="font-extrabold child-hd self-end">
											{activeId ? `${roomData?.name} -` : ''}
										</h4>
										<span className="child-hd m-1 ml-8">
											{activeId
												? `Recorded ${dayjs(`${date} ${activeId?.start_time}`).format(
														'MMMM D, YYYY h:mm A'
												  )}`
												: ''}
										</span>
									</div>
									<div className="mt-20">
										<HistoryStreaming room={roomData} active={streamUrl} setMute={setMute} />
									</div>
								</div>
							</div>
						</FuseAnimate>
					</div>
				}
				rightSidebarContent={
					<div className="home-sidebar-history">
						<div className=" mb-16">
							<h2 className="font-bold mb-10" style={{ fontSize: '18px' }}>
								Room
							</h2>

							{/* <CustomButton variant="secondary" height="50px" width="265px" fontSize="14px" padding="5px"> */}
							<div className="room-select">
								<FormControl
									style={{ width: '100%', position: 'relative', height: '50px', padding: '10px' }}
								>
									<Select
										className={classes.select}
										inputProps={{
											classes: {
												root: classes.root,
												icon: classes.icon,
											},
										}}
										name="isRoom"
										value={roomData}
										id="isRoom"
										onChange={handleChange}
										MenuProps={MenuProps}
									>
										{rooms.length ? (
											rooms.map((room) => {
												return (
													<MenuItem key={room.id} value={room}>
														<div className="menu-item" id={room.id}>
															{room.name}
														</div>
													</MenuItem>
												);
											})
										) : (
											<MenuItem>Loading...</MenuItem>
										)}
									</Select>
								</FormControl>
							</div>
							{/* </CustomButton> */}
						</div>

						<div className="date-div">
							<h2 className="font-bold mb-10" style={{ fontSize: '18px' }}>
								Date
							</h2>

							{/* <CustomButton variant="secondary" height="50px" width="265px" fontSize="14px" padding="5px"> */}
							<div className="date-select">
								<CustomDatePicker
									dateStyle={classes.dateStyle}
									id="date-from"
									// label="Date From"
									paddingLeft="11px"
									paddingRight="11px"
									value={date}
									setValue={(d) => {
										setDate(d?.format('YYYY-MM-DD') || dayjs().format('YYYY-MM-DD'));
										// setFilters({ ...filters, fromDate: Date.format('YYYY-MM-DD') });
									}}
									// maxDate={toDate || undefined}
									disableFuture
								/>
							</div>
							{/* </CustomButton> */}
						</div>

						<div className={clsx(classes.divider)} />

						{isLoading ? (
							<div className="flex justify-center mt-16">
								<CircularProgress size={35} />
							</div>
						) : (
							<>
								<div className="mt-12 video-history">
									{/* {historyVideoData?.length > 0 ? ( */}
									{historyVideoData.map((item, index) => {
										return (
											<div
												className="small-img-row"
												key={item.id}
												onClick={() => videoClick(item)}
												style={{
													cursor: 'pointer',
												}}
											>
												<div className="small-img">
													{/* <img src="assets/images/play.png" className="play-btn" alt="" /> */}
													<img className="small-img" src="assets/images/Group 86539.png" />

													{/* <video style={{ pointerEvents: 'none' }}>
														<source src={item.url ? `${item.url}` : ''} type="video/mp4" />
													</video> */}
												</div>
												<p> {dayjs(`${date}${item?.start_time}`).format('h:mm A')}</p>
												<p>{dayjs(`${date}${item?.end_time}`).format('h:mm A')}</p>
												<div
													className="tick-wrapper-custom school-ticket"
													style={{
														background: item.id === activeId?.id ? '#4DA0EE' : 'white',
													}}
												>
													<i className="fas fa-check" />
												</div>
											</div>
										);
									})}
									{/* ) : (
										<div className="no-clips">No clips available</div>
									)} */}
								</div>
							</>
						)}
						{/* {historyVideoData?.length > 0 ? (
							<div className="save-clip-btn">
								<CustomButton
									id="save-clips"
									variant="primary"
									height="50px"
									width="265px"
									fontSize="14px"
									padding="5px"
									disabled={historyVideoData?.length > 0 ? false : true}
									onClick={handleSubmit}
								>
									{saveLoading ? (
										<div className="flex justify-center">
											<CircularProgress size={35} />
										</div>
									) : (
										'Save a Video Clip'
									)}
								</CustomButton>
							</div>
						) : null} */}
					</div>
				}
				innerScroll
				ref={pageLayout}
			/>
		</div>
	);
}

export default Historycamera;
