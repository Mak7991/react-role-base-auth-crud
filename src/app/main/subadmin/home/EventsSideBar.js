/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React, { useEffect, useState } from 'react';
import { CircularProgress, Badge } from '@material-ui/core';
import { DatePicker } from '@material-ui/pickers';
import moment from 'moment';
import { getEventsByDate, getUpcomingEvents } from 'app/services/events/events';
import { useDispatch } from 'react-redux';
import * as Actions from 'app/store/actions';
import InfiniteScroll from 'react-infinite-scroll-component';
import CustomButton from 'app/customComponents/CustomButton/CustomButton';
import EventsCard from './EventsCard';

function EventsSidebar() {
	const dispatch = useDispatch();
	const [date, setDateFrom] = useState(new Date());
	const [isLoading, setIsLoading] = useState(false);
	const [rows, setRows] = useState([]);
	const [refresh, setRefresh] = useState(false);
	const [viewAll, setViewAll] = useState(false);
	const [selectedDays, setSelectedDays] = useState([]);
	const [isEventsLoading, setIsEventsLoading] = useState(true);
	const [hasMore, setHasMore] = useState(false);
	const [loadingMore, setLoadingMore] = useState(false);
	const [page, setPage] = useState(1);

	useEffect(() => {
		setIsLoading(true);
		// handleMonthChange(date);
		// setRows([]);
		getEventsByDate(moment(date).format('YYYY-MM-DD'), 1)
			.then(({ data }) => {
				setViewAll(false);
				setRows(data);
				if (data.current_page < data.last_page) {
					setPage(page + 1);
					setHasMore(true);
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
							message: 'Failed to load events',
							autoHideDuration: 2500,
							variant: 'error'
						})
					);
				}
			})
			.finally(() => {
				setIsLoading(false);
			});
	}, [date, refresh]);

	const handleMonthChange = async v => {
		return new Promise(resolve => {
			setSelectedDays([]);
			getUpcomingEvents(moment(v).format('MM'), moment(v).format('YYYY'))
				.then(res => {
					setSelectedDays(res.data.map(d => moment(d).format('DD')));
					resolve();
				})
				.catch(err => {
					dispatch(
						Actions.showMessage({
							message: 'Failed to fetch data, please refresh',
							variant: 'error'
						})
					);
				});
		});
	};

	useEffect(() => {
		setIsEventsLoading(true);
		getUpcomingEvents(moment(new Date()).format('MM'), moment(new Date()).format('YYYY'))
			.then(res => {
				setSelectedDays(res.data.map(d => moment(d).format('DD')));
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
				setIsEventsLoading(false);
			});
	}, []);

	const handleLoadMore = () => {
		setLoadingMore(true);
		// handleMonthChange();
		getEventsByDate(moment(date).format('YYYY-MM-DD'), page)
			.then(({ data }) => {
				setRows(rows.concat(data.data));
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
							message: 'Failed to load events',
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
		<div className="pb-32 mb-52">
			<h2 className="event-title-heading">Events</h2>
			<div>
				<>
					<div className="date_picker">
						<DatePicker
							autoOk
							orientation="landscape"
							variant="static"
							openTo="date"
							id="event-view-date-picker"
							value={date}
							onChange={d => setDateFrom(moment(d).format('YYYY-MM-DD'))}
							onMonthChange={v => handleMonthChange(v)}
							renderDay={(day, selectedDate, isInCurrentMonth, dayComponent) => {
								// const date = makeJSDateObject(day); // skip this step, it is required to support date libs
								const isSelected =
									isInCurrentMonth && selectedDays.indexOf(moment(day).format('DD')) !== -1;
								// You can also use our internal <Day /> component
								return (
									<Badge
										overlap="circular"
										badgeContent={
											isSelected ? (
												<p className="event-badge-dot cursor-pointer">&#8226;</p>
											) : (
												undefined
											)
										}
									>
										{dayComponent}
									</Badge>
								);
							}}
						/>
					</div>
					<div className="wrapper">
						{isLoading ? (
							<div className="flex justify-center pt-64">
								<CircularProgress size={35} />
							</div>
						) : !rows?.length ? (
							<div className="flex justify-center pt-64">No Upcoming Events</div>
						) : (
							<div className="pt-10 overflow-auto h-full" id="event-card">
								{rows.slice(0, viewAll ? rows.length : 5).map(row => (
									<EventsCard
										row={row}
										key={row.id}
										setRefresh={setRefresh}
										refresh={refresh}
										isEventsLoading={isEventsLoading}
										setIsEventsLoading={setIsEventsLoading}
									/>
								))}
								{!rows.length || viewAll || !(rows.length > 5) || isLoading || isEventsLoading ? (
									<div />
								) : (
									<div
										className="flex more-events cursor-pointer"
										id="view-all-events"
										onClick={() => setViewAll(true)}
									>
										<span className="cursor-pointer">
											<CustomButton
												variant="secondary"
												fontSize="15px"
												style={{
													justifyContent: 'space-evenly',
													display: 'flex',
													alignItems: 'center'
												}}
												onClick={() => setViewAll(true)}
											>
												View all <span className="chevron-right-icon">&#8250;</span>
											</CustomButton>
										</span>
									</div>
								)}
								{loadingMore && (
									<div className="flex justify-center pt-64">
										<CircularProgress size={35} />
									</div>
								)}
								{viewAll && (
									<InfiniteScroll
										dataLength={rows.length}
										next={handleLoadMore}
										hasMore={hasMore}
										scrollableTarget="event-card"
									/>
								)}
							</div>
						)}
					</div>
				</>
			</div>
		</div>
	);
}

export default EventsSidebar;
