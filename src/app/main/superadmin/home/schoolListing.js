/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import * as Actions from 'app/store/actions';
import CustomButton from 'app/customComponents/CustomButton/CustomButton';
import {
	TableContainer,
	Table,
	Paper,
	TableHead,
	TableRow,
	TableCell,
	CircularProgress,
	TableBody,
} from '@material-ui/core';
import { getCompanySchools } from 'app/services/schools/schools';
import history from '@history';
import InfiniteScroll from 'react-infinite-scroll-component';
import Pusher from 'pusher-js';

function SchoolListing() {
	const dispatch = useDispatch();
	const [isSchoolsLoading, setSchoolsLoading] = useState(false);
	const [schoolCount, setSchoolCount] = useState(null);
	const [viewAll, setViewAll] = useState(false);
	const [schools, setSchools] = useState([]);
	const [hasMore, setHasMore] = useState(false);
	const [page, setPage] = useState(1);
	const [loadingMore, setLoadingMore] = useState(false);
	const user = useSelector(({ auth }) => auth.user);
	const pusher = new Pusher(process.env.REACT_APP_PUSHER_CHANNEL_ID, {
		cluster: process.env.REACT_APP_PUSHER_CLUSTER_ID,
	});

	const GetSchoolListing = (ev) => {
		console.log('-----------', ev);
		setSchoolsLoading(true);
		getCompanySchools('', '', '', 1, 'descending')
			.then(({ data }) => {
				setSchools(data.data);
				setSchoolCount(data.total);
				if (data.current_page < data.last_page) {
					setHasMore(true);
					setPage(data.current_page + 1);
				} else {
					setHasMore(false);
				}
			})
			.catch((err) => {
				if (err.response?.data?.message) {
					dispatch(
						Actions.showMessage({
							message: err?.response?.data?.message,
							autoHideDuration: 2500,
							variant: 'error',
						})
					);
				} else {
					dispatch(
						Actions.showMessage({
							message: 'Failed to load schools',
							autoHideDuration: 2500,
							variant: 'error',
						})
					);
				}
			})
			.finally(() => {
				setSchoolsLoading(false);
			});
	};
	useEffect(() => {
		const channel = pusher.subscribe(`company_app_${user.data.school.id}`);
		channel.bind('school_update', () => {
			GetSchoolListing();
		});
		channel.bind('school_disabled', () => {
			GetSchoolListing();
		});
		GetSchoolListing();
		return () => {
			pusher.disconnect();
		};
	}, []);

	const handleLoadMore = () => {
		setLoadingMore(true);
		getCompanySchools('', '', '', page, 'descending')
			.then(({ data }) => {
				setSchools(schools.concat(data.data));
				if (data.current_page < data.last_page) {
					setHasMore(true);
					setPage(data.current_page + 1);
				} else {
					setHasMore(false);
				}
			})
			.catch((err) => {
				if (err.response?.data?.message) {
					dispatch(
						Actions.showMessage({
							message: err?.response?.data?.message,
							autoHideDuration: 2500,
							variant: 'error',
						})
					);
				} else {
					dispatch(
						Actions.showMessage({
							message: 'Failed to load schools',
							autoHideDuration: 2500,
							variant: 'error',
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
			<div className="flex flex-row justify-between items-center">
				<h4>
					<span className="" style={{ fontSize: '18px', fontWeight: '700' }}>
						Schools
					</span>{' '}
					<span>|</span> <span className="school-count font-extrabold">{schoolCount || ''}</span>
				</h4>
				{!viewAll && schools.length > 5 ? (
					<span>
						<CustomButton
							variant="secondary"
							fontSize="15px"
							style={{ justifyContent: 'space-evenly', display: 'flex', alignItems: 'center' }}
							onClick={() => {
								setViewAll(true);
							}}
						>
							View all <span className="chevron-right-icon">&#8250;</span>
						</CustomButton>
					</span>
				) : (
					''
				)}
			</div>
			<TableContainer id="Schools-Listing" component={Paper} className="school-table-cont">
				<Table stickyHeader className="w-full">
					<TableHead>
						<TableRow>
							<TableCell className="bg-white schoolTableHeader w-1/4 schools-table-heading">
								Name
							</TableCell>
							<TableCell className="bg-white schoolTableHeader w-1/4 schools-table-heading">
								Phone
							</TableCell>
							<TableCell
								className="bg-white schoolTableHeader w-1/4 schools-table-heading"
								align="center"
							>
								Status
							</TableCell>
							<TableCell className="bg-white w-1/4 schools-table-heading" />
						</TableRow>
					</TableHead>
					<TableBody>
						{isSchoolsLoading && (
							<TableRow>
								<TableCell align="center" colSpan={8} className="bg-white">
									<CircularProgress size={35} />
								</TableCell>
							</TableRow>
						)}
						{!schools[0] && !isSchoolsLoading && (
							<TableRow>
								<TableCell align="center" colSpan={8} className="bg-white no-schools">
									No schools
								</TableCell>
							</TableRow>
						)}
						{schools.slice(0, viewAll ? schools.length : 5).map((school, key) => {
							return (
								<TableRow key={key}>
									<TableCell style={{ fontWeight: 'bold' }} className="bg-white name-col">
										{school.name}
									</TableCell>
									<TableCell className="bg-white phone-col schools-table-cell">
										<div className="flex flex-row">
											<img
												src="assets/images/phone.png"
												alt="Phone number"
												style={{ height: '20px' }}
											/>
											{school.phone}
										</div>
									</TableCell>
									<TableCell
										className={`bg-white status-col schools-table-cell ${
											school.status ? 'green-color' : 'red-color'
										}`}
									>
										{school.status ? 'Active' : 'Inactive'}
									</TableCell>
									<TableCell className="bg-white details-col schools-table-cell" align="center">
										<div
											className="flex flex-row items-center cursor-pointer"
											onClick={() => {
												history.push({
													pathname: `/editschool/${school.id}`,
													state: {
														row: school,
													},
												});
											}}
										>
											<span
												className="mr-10 see-details"
												style={{
													color: '#009DFF',
													fontWeight: 700,
													fontSize: '13px',
												}}
											>
												See details
											</span>
											<img src="assets/images/view-arrow.png" alt="See details" />
										</div>
									</TableCell>
								</TableRow>
							);
						})}
						{loadingMore && (
							<TableRow>
								<TableCell align="center" colSpan={8} className="bg-white">
									<CircularProgress size={35} />
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</TableContainer>
			{viewAll && (
				<InfiniteScroll
					dataLength={schools.length}
					next={handleLoadMore}
					hasMore={hasMore}
					scrollableTarget="Schools-Listing"
				/>
			)}
		</>
	);
}

export default SchoolListing;
