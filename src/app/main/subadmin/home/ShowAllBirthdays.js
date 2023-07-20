import React, { useEffect, useState } from 'react';
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
import { useDispatch } from 'react-redux';
import * as Actions from 'app/store/actions';
import { getUpcomingBirthday } from 'app/services/HomeService/homeService';
import InfiniteScroll from 'react-infinite-scroll-component';
import '../rooms/roomspage.css';
import './SubAdminDashboard.css';
import dayjs from 'dayjs';
import history from '@history';

function ShowAllBirthdays() {
	const dispatch = useDispatch();
	const [rows, setRows] = useState([]);
	const [isLoading, setIsLoading] = useState(false);
	const [hasMore, setHasMore] = useState(false);
	const [firstLoad, setFirstLoad] = useState(true);
	const [fetchingMore, setFetchingMore] = useState(false);
	const [page, setPage] = useState(1);
	const size = 0;

	useEffect(() => {
		const timeout = setTimeout(
			() => {
				setIsLoading(true);
				getUpcomingBirthday(size)
					.then(res => {
						setFirstLoad(false);
						setRows(res.data || []);
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
	}, []);

	const handleLoadMore = () => {
		setFetchingMore(true);
		getUpcomingBirthday(size, page)
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

	function calculate_age(dob) {
		const diff_ms = Date.now() - dob.getTime();
		const age_dt = new Date(diff_ms);

		return Math.abs(age_dt.getUTCFullYear() - 1970);
	}

	return (
		<>
			<div className="mx-auto birthday-width">
				<div className="flex items-center flex-nowrap justify-between">
					<span className="personal-hd info-hd stext-2xl self-end font-extrabold ">
						<h1 className="hd-main">
							{' '}
							<span className="mr-12 icon-color">
								<IconButton
									onClick={() => {
										history.goBack();
									}}
									className="pl-0"
								>
									<img
										src="assets/images/arrow-long.png"
										alt="filter"
										width="24px"
										className="fiterimg"
									/>
								</IconButton>
							</span>{' '}
							Upcoming Birthdays
						</h1>
					</span>
				</div>
				<TableContainer id="Scrollable-table" component={Paper} className="Allbirthday-table-cont">
					<Table stickyHeader className="birthday-table" style={{ width: '100%' }}>
						<TableHead>
							<TableRow>
								<TableCell className="bg-white birthdayTableHeader" style={{ width: '85%' }}>
									Student
								</TableCell>
								<TableCell
									align="left"
									className="bg-white birthdayTableHeader"
									style={{ width: '15%' }}
								>
									Date Of Birth
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
										No Upcoming Birthdays
									</TableCell>
								</TableRow>
							) : (
								rows?.map(row => (
									<TableRow key={row.id}>
										<TableCell>
											<div className="flex cursor-pointer">
												<Avatar className="mr-6" alt="student-face" src={row.photo} />
												<div className="flex flex-col items-start">
													<div className="student-name-bday truncate break-word">
														{row.first_name} {row.last_name}
													</div>
													<div className="font-normal truncate student-age-font-bday">
														{calculate_age(new Date(row.date_of_birth))} years old
													</div>
												</div>
											</div>
										</TableCell>
										<TableCell align="left" className="font-normal truncate dob-font">
											{dayjs(row.date_of_birth).format('MMM, DD')}
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
		</>
	);
}

export default ShowAllBirthdays;
