/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import history from '@history';
import Paper from '@material-ui/core/Paper';
import { CircularProgress, IconButton, TextField, InputAdornment } from '@material-ui/core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload } from '@fortawesome/free-solid-svg-icons';
import SearchIcon from '@material-ui/icons/Search';
import { getCompanySchools } from 'app/services/schools/schools';
import './SubAdmins.css';
import FuseAnimate from '@fuse/core/FuseAnimate';
import { useDispatch, useSelector } from 'react-redux';
import * as Actions from 'app/store/actions';
import InfiniteScroll from 'react-infinite-scroll-component';
import CustomCheckbox from 'app/customComponents/CustomCheckbox/CustomCheckbox';
import CustomButton from 'app/customComponents/CustomButton/CustomButton';
import CustomDatePicker from 'app/customComponents/CustomDatePicker/CustomDatePicker';
import dayjs from 'dayjs';
import Pusher from 'pusher-js';
import DisableConfirmDialog from './DisableConfirmDialog';

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
		marginTop: '21px'
	},
	root: {
		color: '#2D65AB'
	}
});

function Schools() {
	const dispatch = useDispatch();
	const classes = useStyles();
	const [rows, setRows] = useState([]);
	const [refresh, setRefresh] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [searchQuery, setSearchQuery] = useState('');
	const [fromDate, setFromDate] = useState('');
	const [toDate, setToDate] = useState('');
	const [firstLoad, setFirstLoad] = useState(true);
	const [hasMore, setHasMore] = useState(false);
	const [page, setPage] = useState(1);
	const [fetchingMore, setFetchingMore] = useState(false);
	const user = useSelector(({ auth }) => auth.user);
	let pusher;
	let channel;

	const GetSchoolListing = ev => {
		console.log('-----------', ev);
		const id = setTimeout(
			() => {
				setIsLoading(true);
				setFirstLoad(false);
				getCompanySchools(searchQuery, fromDate, toDate, 1)
					.then(res => {
						if (res.data.last_page > res.data.current_page) {
							setHasMore(true);
						} else {
							setHasMore(false);
						}
						setPage(res.data.current_page + 1);
						setRows(res.data.data);
						setIsLoading(false);
					})
					.catch(err => {
						setIsLoading(false);
						dispatch(
							Actions.showMessage({
								message: 'Failed to fetch data, please refresh',
								variant: 'error'
							})
						);
					});
			},
			firstLoad ? 0 : 1000
		);

		return _ => {
			clearTimeout(id);
		};
	};

	useEffect(() => {
		pusher = new Pusher(process.env.REACT_APP_PUSHER_CHANNEL_ID, {
			cluster: process.env.REACT_APP_PUSHER_CLUSTER_ID 
		});
		channel = pusher.subscribe(`company_app_${user.data.school.id}`);
		channel.bind('school_update', () => {
			GetSchoolListing();
		});
		channel.bind('school_disabled', () => {
			GetSchoolListing();
		});
		return () => {
			pusher.disconnect();
		};
	}, []);

	useEffect(() => {
		GetSchoolListing();
	}, [refresh, fromDate, toDate, searchQuery, dispatch]);

	const goToEdit = row => {
		history.push({
			pathname: `/editschool/${row.id}`,
			state: {
				row
			}
		});
	};

	const goToAdd = _ => {
		history.push({
			pathname: '/addschool'
		});
	};

	const handleDisable = (e, row) => {
		e.preventDefault();
		dispatch(
			Actions.openDialog({
				children: <DisableConfirmDialog row={row} setRefresh={setRefresh} refresh={refresh} />
			})
		);
	};

	const handleSearch = e => {
		setSearchQuery(e.target.value);
	};

	const handleLoadMore = () => {
		setFetchingMore(true);
		getCompanySchools(searchQuery, fromDate, toDate, page)
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

	const handleFromDate = date => {
		if (date) {
			setFromDate(dayjs(date).format('YYYY-MM-DD'));
		} else {
			setFromDate('');
		}
	};

	const handleToDate = date => {
		if (date) {
			setToDate(dayjs(date).format('YYYY-MM-DD'));
		} else {
			setToDate('');
		}
	};

	return (
		<FuseAnimate animation="transition.slideLeftIn" duration={600}>
			<div className="school-main-page mx-auto">
				<div className=" innerinput flex items-end flex-nowrap justify-between">
					<span className="text-2xl" style={{ fontSize: '20px' , fontWeight:'700' }}>School Admin</span>{' '}
					<div className="flex justify-between">
						<div className="flex justify-end">
							<TextField
								className="mr-10"
								onChange={handleSearch}
								id="search-input"
								value={searchQuery}
								label="Search"
								style={{ width: '20%' }}
								InputProps={{
									endAdornment: (
										<InputAdornment>
											<IconButton
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
									)
								}}
							/>
							<div className="mx-10 student-date-field" style={{ width: '20%' }}>
								<CustomDatePicker
									id="date-from"
									label="From"
									value={fromDate}
									setValue={handleFromDate}
									maxDate={toDate || new Date()}
								/>
							</div>
							<div className="mr-20 ml-10 student-date-field" style={{ width: '20%' }}>
								<CustomDatePicker
									id="date-to"
									label="To"
									value={toDate}
									setValue={handleToDate}
									maxDate={new Date()}
									minDate={fromDate}
								/>
							</div>
						</div>
						<div className="flex self-end">
							<span>
								{/* <span className="mx-10">
									<CustomButton variant="secondary">
										<FontAwesomeIcon icon={faDownload} /> Import
									</CustomButton>
								</span> */}
								<span>
									<CustomButton variant="primary" onClick={goToAdd} id="go-to-add-school">
										+ Add
									</CustomButton>
								</span>
							</span>
						</div>
					</div>
				</div>

				<TableContainer
					id="Scrollable-table"
					component={Paper}
					className={`table-1366x657-container mx-auto ${classes.container}`}
				>
					<Table stickyHeader className={` table-1366x657`} aria-label="simple table">
						<TableHead>
							<TableRow>
								<TableCell className="bg-white school-table-header">ID</TableCell>
								<TableCell className="bg-white school-table-header">Name of School</TableCell>
								<TableCell className="bg-white school-table-header">School Admin</TableCell>
								<TableCell className="bg-white school-table-header" align="center">
									Students
								</TableCell>
								<TableCell className="bg-white school-table-header">Designation</TableCell>
								<TableCell className="bg-white school-table-header">Contact Number</TableCell>
								<TableCell className="bg-white school-table-header">Status</TableCell>
								<TableCell className="bg-white school-table-header action-div">Actions</TableCell>
							</TableRow>
						</TableHead>
						<TableBody className={classes.tableBody}>
							{isLoading ? (
								<TableRow>
									<TableCell align="center" colSpan={8}>
										<CircularProgress size={35} />
									</TableCell>
								</TableRow>
							) : !rows.length && !firstLoad ? (
								<TableRow>
									<TableCell align="center" colSpan={8}>
										No Schools
									</TableCell>
								</TableRow>
							) : (
								rows?.map((row, index) => (
									<TableRow key={row.id}>
										<TableCell component="th" scope="row">
											{row.otp}
										</TableCell>
										<TableCell>{row.name}</TableCell>
										<TableCell>{`${row.admins[0]?.first_name} ${row.admins[0]?.last_name}`}</TableCell>
										<TableCell align="center">{row.total_students}</TableCell>
										<TableCell>{row.admins[0]?.designation}</TableCell>
										<TableCell>{row.phone}</TableCell>
										<TableCell>
											<div
												style={{
													fontWeight: 'bold',
													fontSize: 12,
													color: `${row?.status === 1 ? '#04C01C' : '#FF4B4B'}`
												}}
											>
												{row?.status === 1 ? 'Active' : 'Inactive'}
											</div>
										</TableCell>
										<TableCell className="px-0 action-div">
											<span
												id={`view-details-${index}`}
												onClick={() => {
													goToEdit(row);
												}}
												className="edit-btn-wrapper"
											>
												<button type="button">View Details</button>
											</span>
											<CustomCheckbox row={row} onClick={handleDisable} id={index} />
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
export default Schools;
