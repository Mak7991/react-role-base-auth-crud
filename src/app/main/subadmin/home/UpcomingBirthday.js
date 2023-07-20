import { Avatar, CircularProgress } from '@material-ui/core';
import React, { useEffect, useState } from 'react';
import { getUpcomingBirthday } from 'app/services/HomeService/homeService';
import { useDispatch } from 'react-redux';
import CustomButton from 'app/customComponents/CustomButton/CustomButton';
import dayjs from 'dayjs';
import * as Actions from 'app/store/actions';
import InfiniteScroll from 'react-infinite-scroll-component';
import { generateAgeString } from 'utils/utils';

function UpcomingBirthdays() {
	const dispatch = useDispatch();
	const [isLoading, setIsLoading] = useState(false);
	const [rows, setRows] = useState([]);
	const [loadingMore, setLoadingMore] = useState(false);
	const [page, setPage] = useState(1);
	const [hasMore, setHasMore] = useState(false);
	const [viewAll, setViewAll] = useState(false);

	useEffect(() => {
		setIsLoading(true);
		getUpcomingBirthday(1)
			.then(res => {
				setRows(res.data.data);
				if (res.data.next_page_url) {
					setHasMore(true);
					setPage(page + 1);
				}
			})
			.finally(() => {
				setIsLoading(false);
			});
		// eslint-disable-next-line
	}, [dispatch]);

	const handleLoadMore = () => {
		setLoadingMore(true);
		getUpcomingBirthday(page)
			.then(({ data }) => {
				setRows(rows.concat(data.data));
				if (data.next_page_url) {
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
							message: 'Failed to load data',
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
			<div className="child-man-div flex justify-between items-end">
				<h4
					className="font-extrabold self-end"
					style={{
						fontSize: '18px',
						fontWeight: '700'
					}}
				>
					Upcoming Birthdays
				</h4>
				<span className="cursor-pointer">
					{!viewAll && rows.length > 5 ? (
						<CustomButton
							variant="secondary"
							fontSize="15px"
							style={{
								justifyContent: 'space-evenly',
								display: 'flex',
								alignItems: 'center',
								height: '11px'
							}}
							onClick={() => setViewAll(true)}
						>
							View all <span className="chevron-right-icon">&#8250;</span>
						</CustomButton>
					) : (
						''
					)}
				</span>
			</div>
			<div
				className="inner-bdy MuiPaper-elevation1"
				style={{ paddingRight: '10px', paddingLeft: '10px', marginBottom: 100 }}
			>
				{isLoading ? (
					<div className="flex justify-center pt-64">
						<CircularProgress size={35} />
					</div>
				) : !rows?.length ? (
					<div className="flex justify-center pt-64">No Upcoming Birthdays</div>
				) : (
					<>
						<div id="birthdays" className="pt-10 overflow-auto h-full">
							{rows?.slice(0, viewAll ? rows.length : 5).map(row => {
								return (
									<div
										key={row.id}
										className="flex justify-between p-16 pt-20 px-20 items-center my-auto"
										style={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}
									>
										<div className="flex items-center">
											<Avatar src={row.photo} className="mr-6" alt="student-face" />
											<div className="flex flex-col items-start">
												<div className="student-name-bday truncate break-word">
													{row.first_name} {row.last_name}
												</div>
												<div
													className="font-normal truncate student-age-font"
													style={{ width: '90px' }}
												>
													{generateAgeString(row.date_of_birth)}
												</div>
											</div>
										</div>
										<div>{dayjs(row.date_of_birth).format('MMM, D')}</div>
									</div>
								);
							})}
							{loadingMore && (
								<div className="flex justify-center">
									<CircularProgress size={35} />
								</div>
							)}
						</div>

						{viewAll && (
							<InfiniteScroll
								dataLength={rows.length}
								next={handleLoadMore}
								hasMore={hasMore}
								scrollableTarget="birthdays"
							/>
						)}
					</>
				)}
			</div>
		</>
	);
}

export default UpcomingBirthdays;
