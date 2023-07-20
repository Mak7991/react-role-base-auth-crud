import { makeStyles } from '@material-ui/core/styles';
import React, { useState, useEffect, useRef } from 'react';
import * as Actions from 'app/store/actions';
import './SubAdminDashboard.css';

import {
	Table,
	TableHead,
	TableBody,
	TableCell,
	TableContainer,
	TableRow,
	Paper,
	CircularProgress,
	Avatar
} from '@material-ui/core';
import { getreminders } from 'app/services/childreminder/childreminder';
import { useDispatch } from 'react-redux';
import InfiniteScroll from 'react-infinite-scroll-component';
import CustomButton from 'app/customComponents/CustomButton/CustomButton';
import dayjs from 'dayjs';

const useStyles = makeStyles({
	layoutRoot: {},
	sidebar: {
		width: 320
	}
});

function Childremainder() {
	const dispatch = useDispatch();
	const classes = useStyles();
	const [viewAll, setViewAll] = useState(false);
	const [hasMore, setHasMore] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [rows, setRows] = useState([]);
	const [firstLoad, setFirstLoad] = useState(true);
	const [fetchingMore, setFetchingMore] = useState(false);
	const [refresh, setRefresh] = useState(false);
	const [page, setPage] = useState(1);
	const [childremainder, setchildremainder] = useState(5);

	// const goToUpchildremainder = () => {
	// 	setchildremainder(0);
	// }

	useEffect(() => {
		const timeout = setTimeout(
			() => {
				setIsLoading(true);
				getreminders(page)
					.then(res => {
						setIsLoading(false);
						setHasMore(true);
						setRows([...rows, ...res.data.data]);
						if (res.data.current_page < res.data.last_page) {
							setPage(page + 1);
						} else {
							setHasMore(false);
						}
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
			clearTimeout(timeout);
		};
	}, [page, refresh]);

	const handleLoadMore = () => {
		setIsLoading(true);
		getreminders(page)
			.then(res => {
				if (res.data.last_page > res.data.current_page) {
					setHasMore(true);
				} else {
					setHasMore(false);
				}
				setPage(res.data.current_page + 1);
				setRows(rows.concat(res.data.data));
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
	};

	return (
		<>
			<div>
				<div className="child-man-div flex justify-between items-end">
					<h4 className="child-hd self-end" style={{ fontWeight: '700' }}>
						{' '}
						child reminder
					</h4>

					<span>
						{rows.length > 5 ? (
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
						) : (
							''
						)}
					</span>
				</div>

				<TableContainer id="Scrollable-table" component={Paper} className="student-table-cont">
					<Table stickyHeader className="student-table" style={{ width: '100%' }}>
						<TableHead>
							<TableRow>
								<TableCell style={{ width: '25%' }} className="bg-white studentTableHeader">
									Child
								</TableCell>
								<TableCell style={{ width: '25%' }} className="bg-white studentTableHeader">
									Type
								</TableCell>
								<TableCell style={{ width: '25%' }} className="bg-white studentTableHeader">
									Details
								</TableCell>
								<TableCell style={{ width: '25%' }} className="bg-white studentTableHeader">
									Due date
								</TableCell>
							</TableRow>
						</TableHead>

						{isLoading && (
							<TableRow>
								<TableCell align="center" colSpan={8} className="bg-white">
									<CircularProgress size={35} />
								</TableCell>
							</TableRow>
						)}
						{!rows.length && !isLoading && (
							<TableRow>
								<TableCell align="center" colSpan={8} className="bg-white no-staffs">
									No Child remainder
								</TableCell>
							</TableRow>
						)}
						{rows.slice(0, viewAll ? rows.length : 5).map((rows, key) => {
							return (
								<TableRow key={rows.id}>
									<TableCell className="bg-white truncate reminder-columns">
										<div className="flex flex-col">
											<div className="flex">
												<Avatar className="mr-6" alt="student-face" src={rows.student.photo} />
												<div className="flex  items-center justify-content: center">
													<div className="report-std truncate width-name">
														{rows.student.first_name} {rows.student.last_name}
													</div>
												</div>
											</div>
										</div>
									</TableCell>
									<TableCell className="bg-white truncate reminder-columns">
										{rows.category === 'Medical Form' ? (
											<div className="flex items-center"> Medical Form</div>
										) : rows.category === 'EpiPen Form' ? (
											<div className="flex items-center">EpiPen Form</div>
										) : rows.category === 'Other' ? (
											<div className="flex items-center"> Other</div>
										) : (
											<div className="empty-cell reminder-columns">-</div>
										)}
									</TableCell>
									<TableCell className="bg-white truncate reminder-columns">
										<div className="flex  items-center justify-content: center">
											{rows.category}
										</div>
									</TableCell>
									<TableCell className="bg-white truncate reminder-columns">
										<div className="flex  items-center justify-content: center">
											{rows?.expiry_date ? (
												<>{dayjs(`${rows?.expiry_date}z`).format('MMMM[ ] D[,] YYYY [ ]')}</>
											) : (
												'-'
											)}
										</div>
									</TableCell>
								</TableRow>
							);
						})}
					</Table>
				</TableContainer>
				{viewAll && (
					<InfiniteScroll
						dataLength={rows.length}
						next={handleLoadMore}
						hasMore={hasMore}
						scrollableTarget="Scrollable-table"
					/>
				)}
			</div>
		</>
	);
}

export default Childremainder;
