/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import history from '@history';
import CustomButton from 'app/customComponents/CustomButton/CustomButton';
import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { CircularProgress, Avatar, IconButton, TextField, InputAdornment } from '@material-ui/core';
import Paper from '@material-ui/core/Paper';
import InfiniteScroll from 'react-infinite-scroll-component';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import FuseAnimate from '@fuse/core/FuseAnimate';
import CustomCheckbox from 'app/customComponents/CustomCheckbox/CustomCheckbox';
import TableRow from '@material-ui/core/TableRow';
import * as Actions from 'app/store/actions';
import { getStaff } from 'app/services/staff/staff';
import DisableConfirmDialog from './DisableConfirmDialog';
import './staff.css';

function StaffListing() {
	const dispatch = useDispatch();
	const [searchQuery, setSearchQuery] = useState('');
	const [isLoading, setIsLoading] = useState(false);
	const [rows, setRows] = useState([]);
	const [firstLoad, setFirstLoad] = useState(true);
	const [fetchingMore, setFetchingMore] = useState(false);
	const [hasMore, setHasMore] = useState(false);
	const [page, setPage] = useState(1);
	const [refresh, setRefresh] = useState(false);

	const handleSearch = e => {
		setSearchQuery(e.target.value);
	};
	const gotostaffinformation = row => {
		history.push({
			pathname: `/staff-StaffInformation`,
			state: { row }
		});
	};
	const goToEditStaff = row => {
		history.push({ pathname: `/staff-editstaff/${row.id}`, state: { row } });
	};

	const goToAddStaff = row => {
		history.push({ pathname: `/staff-addstaff` });
	};

	const handleDisable = (e, row) => {
		e.preventDefault();
		dispatch(
			Actions.openDialog({
				children: <DisableConfirmDialog row={row} setRefresh={setRefresh} refresh={refresh} />
			})
		);
	};

	const handleLoadMore = () => {
		setFetchingMore(true);
		getStaff(searchQuery, page)
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

	useEffect(() => {
		const id = setTimeout(
			() => {
				setIsLoading(true);
				setFirstLoad(false);
				getStaff(searchQuery)
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
			},
			firstLoad ? 0 : 1000
		);
		return _ => {
			clearTimeout(id);
		};
		// eslint-disable-next-line
	}, [dispatch, searchQuery, refresh]);

	return (
		<FuseAnimate animation="transition.slideLeftIn" duration={600}>
			<div className="staff-cont mx-auto">
				<div className="flex justify-between items-end">
					<span className="text-xl self-end font-bold mr-28">Staff List</span>
					<div className="flex justify-between">
						<TextField
							style={{
								alignSelf: 'center',
								paddingRight: 30
							}}
							onChange={handleSearch}
							id="search"
							value={searchQuery}
							label="Search By Name"
							InputProps={{
								endAdornment: (
									<InputAdornment>
										<IconButton
											onClick={() => {
												document.getElementById('search').focus();
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
						<div
							style={{
								alignSelf: 'center',
								marginTop: 20
							}}
						>
							<CustomButton
								variant="primary"
								width="120px"
								height="40px"
								fontSize="15px"
								id="add-btn"
								onClick={goToAddStaff}
							>
								+ Add Staff
							</CustomButton>
						</div>
					</div>
				</div>

				<TableContainer id="Scrollable-table" component={Paper} className="staff-table-cont">
					<Table stickyHeader className="" style={{ width: '100%' }}>
						<TableHead>
							<TableRow>
								<TableCell className="bg-white staff-table-header" style={{ width: '23%' }}>
									Staff Name
								</TableCell>
								<TableCell className="bg-white staff-table-header" style={{ width: '25%' }}>
									Email
								</TableCell>
								<TableCell className="bg-white staff-table-header" style={{ width: '20%' }}>
									Contact Number
								</TableCell>
								<TableCell className="bg-white staff-table-header" style={{ width: '22%' }}>
									Emergency Number
								</TableCell>
								<TableCell className="bg-white staff-table-header" style={{ width: '10%' }}>
									Actions
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
										No Staff
									</TableCell>
								</TableRow>
							) : (
								rows?.map(row => (
									<TableRow key={row.id}>
										<TableCell>
											<div
												className="flex items-center"
												style={{ gap: 10, cursor: 'pointer' }}
												id={`view-staff-${row.id}`}
												onClick={() => gotostaffinformation(row)}
											>
												<Avatar src={row.photo} />
												<div className="flex flex-col">
													<div className="break-word staff-name">
														{`${row.first_name} ${row.last_name}`}
													</div>
													<div className="break-word capitalize staff-position">
														{row.position_type}
													</div>
												</div>
											</div>
										</TableCell>
										<TableCell>
											<div className="break-word staff-email">{row.email}</div>
										</TableCell>
										<TableCell>
											<div className="break-word">{row.phone}</div>
										</TableCell>
										<TableCell>
											<div className="break-word">{row.emergency_phone}</div>
										</TableCell>
										<TableCell>
											<IconButton
												size="small"
												id={`edit-staff-${row.id}`}
												onClick={() => goToEditStaff(row)}
											>
												<img src="assets/images/circle-edit.png" alt="edit" width="25px" />
											</IconButton>
											<CustomCheckbox
												id={`disable-staff-${row.id}`}
												onClick={handleDisable}
												row={row}
											/>
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

export default StaffListing;
