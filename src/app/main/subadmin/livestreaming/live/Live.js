/* eslint-disable consistent-return */
import CustomButton from 'app/customComponents/CustomButton/CustomButton';
import React, { useEffect, useState, useRef } from 'react';
import FuseAnimate from '@fuse/core/FuseAnimate';
import history from '@history';
import {
	CircularProgress,
	FormControl,
	IconButton,
	InputLabel,
	Select,
	MenuItem,
	TextField,
	InputAdornment,
} from '@material-ui/core';
import Pagination from '@material-ui/lab/Pagination';
import { getRooms } from 'app/services/liveStreaming/liveStreaming';
import Close from '@material-ui/icons/Close';
import { makeStyles } from '@material-ui/core/styles';
import FuseScrollbars from '@fuse/core/FuseScrollbars';
import Streaming from './Streaming';
import Bigplus from './BigPlus';

const useStyles = makeStyles((theme) => ({
	content: {
		position: 'relative',
		display: 'flex',
		overflow: 'auto',
		flex: '1 1 auto',
		flexDirection: 'column',
		width: '100%',
		'-webkit-overflow-scrolling': 'touch',
		zIndex: 2,
	},
}));
function Live() {
	const classes = useStyles();
	const [rooms, setRooms] = useState([]);
	const [loading, setLoading] = useState(true);
	const [search, setSearch] = useState('');
	const [status, setStatus] = useState('');
	const [page, setPage] = useState(1);
	const [firstLoad, setFirstLoad] = useState(true);
	const [disablePagination, setDisablePagination] = useState(false);
	const [totalPages, setTotalPages] = useState(0);
	const scrollRef = useRef(null);
	const goToCameraRegistrationForm = () => {
		history.push('/livestreaming-CameraRegistration');
	};
	useEffect(() => {
		getRooms(search, status, 1)
			.then((res) => {
				setRooms(res.data.data);
				setTotalPages(res.data.last_page);
			})
			.catch((err) => {
				console.log(err);
			})
			.finally(() => {
				setLoading(false);
				setFirstLoad(false);
			});
	}, []);

	useEffect(() => {
		if (firstLoad) {
			return;
		}
		const timeout = setTimeout(() => {
			setLoading(true);
			getRooms(search, status, 1)
				.then((res) => {
					setRooms(res.data.data);
					setPage(1);
					setTotalPages(res.data.last_page);
				})
				.catch((err) => {
					console.log(err);
				})
				.finally(() => {
					setLoading(false);
				});
		}, 1000);
		return () => {
			clearTimeout(timeout);
		};
	}, [search, status]);

	useEffect(() => {
		if (firstLoad) {
			return;
		}
		setDisablePagination(true);
		getRooms(search, status, page)
			.then((res) => {
				setRooms(res.data.data);
			})
			.catch((err) => {
				console.log(err);
			})
			.finally(() => {
				setDisablePagination(false);
			});
	}, [page]);
	return (
		<FuseScrollbars className={classes.content} scrollToTopOnRouteChange>
			<FuseAnimate animation="transition.slideLeftIn" duration={600}>
				<div className="flex  flex-col row-gap-32 px-64 py-32 mb-64">
					<div className="flex justify-between items-end">
						<div className="text-xl font-bold">Live Streaming</div>
						<div className="flex items-end col-gap-16">
							<TextField
								style={{
									alignSelf: 'center',
								}}
								id="search-input"
								className="w-2/3"
								value={search}
								onChange={(e) => setSearch(e.target.value)}
								label="Search By Name"
								InputProps={{
									endAdornment: (
										<InputAdornment>
											<IconButton
												id="search-icon"
												onClick={() => {
													document.getElementById('search-input').focus();
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
									),
								}}
							/>
							<FormControl variant="standard" className="w-2/3">
								<InputLabel id="status-label">Filters</InputLabel>
								<Select
									value={status}
									onChange={(e) => setStatus(e.target.value)}
									name="status"
									id="status"
									labelId="status-label"
									label="Filters"
									endAdornment={
										status ? (
											<IconButton id="clear-room-filter" size="small" className="mr-16">
												<Close
													onClick={() => {
														setStatus('');
													}}
													fontSize="small"
												/>
											</IconButton>
										) : (
											''
										)
									}
								>
									<MenuItem value={1}>
										<span id="active"> Active</span>
									</MenuItem>
									<MenuItem value={2}>
										<span id="inactive"> Inactive</span>
									</MenuItem>
								</Select>
							</FormControl>
							<CustomButton
								variant="primary"
								width={275}
								heihgt={33}
								onClick={goToCameraRegistrationForm}
							>
								Camera Registration
							</CustomButton>
						</div>
					</div>
					<div
						ref={scrollRef}
						className="grid grid-cols-2 py-32 px-60 bg-white rounded-8 row-gap-32 col-gap-32"
					>
						{loading && (
							<div className="py-64 flex justify-center col-span-2">
								<CircularProgress size={35} />
							</div>
						)}
						{!loading && rooms.map((room) => <Streaming room={room} key={room.id} />)}

						{!loading && rooms.length > 0 && Array.from(Array(4 - rooms.length)).map(() => <Bigplus />)}

						<div></div>
						{!firstLoad && rooms.length > 0 && (
							<div style={{ justifySelf: 'end' }}>
								<Pagination
									color="primary"
									count={totalPages}
									page={page}
									onChange={(e, p) => setPage(p)}
									disabled={disablePagination}
								/>
							</div>
						)}

						{!loading && !rooms.length && (
							<div className="py-64 flex justify-center col-span-2 text-xl">No records available </div>
						)}
					</div>
				</div>
			</FuseAnimate>
		</FuseScrollbars>
	);
}

export default Live;
