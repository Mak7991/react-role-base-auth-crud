import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
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
	TableBody
} from '@material-ui/core';
import { getTotalStaffs } from 'app/services/SuperAdminHomeService/superAdminHomeService';
import InfiniteScroll from 'react-infinite-scroll-component';

function TotalStaff() {
	const dispatch = useDispatch();
	const [isStaffloading, setStaffLoading] = useState(false);
	const [staffCount, setStaffCount] = useState(null);
	const [viewAll, setViewAll] = useState(false);
	const [staffs, setStaffs] = useState([]);
	const [hasMore, setHasMore] = useState(false);
	const [page, setPage] = useState(1);
	const [loadingMore, setLoadingMore] = useState(false);

	useEffect(() => {
		setStaffLoading(true);
		getTotalStaffs(1)
			.then(({ data }) => {
				setStaffs(data.data);
				setStaffCount(data.total);
				if (data.current_page < data.last_page) {
					setHasMore(true);
					setPage(data.current_page + 1);
				} else {
					setHasMore(false);
				}
			})
			.catch(err => {
				if (err.response?.data?.message) {
					dispatch(
						Actions.showMessage({
							message: err?.response?.data?.message,
							autoHideDuration: 2500,
							variant: 'error'
						})
					);
				} else {
					dispatch(
						Actions.showMessage({
							message: 'Failed to load staffs',
							autoHideDuration: 2500,
							variant: 'error'
						})
					);
				}
			})
			.finally(() => {
				setStaffLoading(false);
			});
	}, []);

	const handleLoadMore = () => {
		setLoadingMore(true);
		getTotalStaffs(page)
			.then(({ data }) => {
				setStaffs(staffs.concat(data.data));
				if (data.current_page < data.last_page) {
					setHasMore(true);
					setPage(data.current_page + 1);
				} else {
					setHasMore(false);
				}
			})
			.catch(err => {
				if (err.response?.data?.message) {
					dispatch(
						Actions.showMessage({
							message: err?.response?.data?.message,
							autoHideDuration: 2500,
							variant: 'error'
						})
					);
				} else {
					dispatch(
						Actions.showMessage({
							message: 'Failed to load staffs',
							autoHideDuration: 2500,
							variant: 'error'
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
				<h3>
					<span className="" style={{ fontSize: '18px', fontWeight: '700' }}>
						Staff
					</span>{' '}
					<span>|</span> <span className="school-count font-extrabold">{staffCount || ''}</span>
				</h3>
				{!viewAll && staffs.length > 5 ? (
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
			<TableContainer id="Scrollable-table" component={Paper} className="staff-table-cont">
				<Table stickyHeader style={{ width: '100%' }}>
					<TableHead>
						<TableRow>
							<TableCell
								style={{
									fontSize: '13px'
								}}
								className="bg-white schoolTableHeader w-1/4"
							>
								Name
							</TableCell>
							<TableCell
								style={{
									fontSize: '13px'
								}}
								className="bg-white schoolTableHeader w-1/4"
							>
								School
							</TableCell>
							<TableCell
								style={{
									fontSize: '13px'
								}}
								className="bg-white schoolTableHeader w-1/4"
							>
								Email
							</TableCell>
							<TableCell
								style={{
									fontSize: '13px'
								}}
								className="bg-white schoolTableHeader w-1/4"
							>
								Phone
							</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{isStaffloading && (
							<TableRow>
								<TableCell align="center" colSpan={8} className="bg-white">
									<CircularProgress size={35} />
								</TableCell>
							</TableRow>
						)}
						{!staffs[0] && !isStaffloading && (
							<TableRow>
								<TableCell align="center" colSpan={8} className="bg-white no-staffs">
									No staffs
								</TableCell>
							</TableRow>
						)}
						{staffs.slice(0, viewAll ? staffs.length : 5).map((staff, key) => {
							return (
								<TableRow key={key}>
									<TableCell
										style={{
											fontSize: '13px',
											maxWidth: '100px',
											fontWeight: 'bold',
											overflow: 'hidden',
											textOverflow: 'ellipsis',
											whiteSpace: 'nowrap'
										}}
										className="bg-white"
									>
										{staff.first_name} {staff.last_name}
									</TableCell>
									<TableCell
										style={{
											fontSize: '13px'
										}}
										className="bg-white staff-table-cell"
									>
										{staff?.school?.name}
									</TableCell>
									<TableCell
										style={{
											fontSize: '13px'
										}}
										className="bg-white staff-table-cell"
									>
										{staff?.email}
									</TableCell>
									<TableCell
										style={{
											fontSize: '13px',
											maxWidth: 100,
											overflow: 'hidden',
											textOverflow: 'ellipsis',
											whiteSpace: 'nowrap'
										}}
										className="bg-white"
									>
										<div className="flex flex-row">
											<img src="assets/images/phone.png" alt="Phone number" />
											{staff.phone}
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
					dataLength={staffs.length}
					next={handleLoadMore}
					hasMore={hasMore}
					scrollableTarget="Scrollable-table"
				/>
			)}
		</>
	);
}

export default TotalStaff;
