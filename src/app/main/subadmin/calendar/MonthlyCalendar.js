/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React, { useMemo, useState } from 'react';
import { CircularProgress, Chip, Popover, Typography, MenuItem, ListItemText, ListItemIcon } from '@material-ui/core';
import moment from 'moment';
import { useDispatch } from 'react-redux';
import * as Actions from 'app/store/actions/';
import EventModal from './EventModal';
import './calendar.css';

function MonthlyCalendar({ week, events, loading, printView, refresh, setRefresh }) {
	const [anchorEl, setAnchorEl] = useState(null);
	const [filterEvent, setFilterEvent] = useState([]);
	const [currentday, setcurrentday] = useState(null);
	const dispatch = useDispatch();

	const handleClick = (event, day) => {
		console.log(day, 'day');
		setcurrentday(day);
		setFilterEvent(
			events.filter(
				(event) =>
					new Date(`${event.datetime}z`).getDate() === day.toDate().getDate() &&
					new Date(`${event.datetime}z`).getMonth() === day.toDate().getMonth()
			)
		);
		setAnchorEl(event.currentTarget);
	};

	const handleClose = () => {
		setAnchorEl(null);
	};

	const open = Boolean(anchorEl);
	const id = open ? 'simple-popover' : undefined;
	return (
		<div className="flex flex-col">
			<div className="grid grid-cols-7 items-stretch font-bold text-gray-500" style={{ justifyItems: 'center' }}>
				<div
					className="flex justify-center items-center w-full"
					style={{ borderLeft: '1px solid #dbdfe9', height: 50 }}
				>
					<div>Mon</div>
				</div>
				<div
					className="flex justify-center items-center w-full"
					style={{ borderLeft: '1px solid #dbdfe9', height: 50 }}
				>
					<div> Tue</div>
				</div>
				<div
					className="flex justify-center items-center w-full"
					style={{ borderLeft: '1px solid #dbdfe9', height: 50 }}
				>
					<div> Wed</div>
				</div>
				<div
					className="flex justify-center items-center w-full"
					style={{ borderLeft: '1px solid #dbdfe9', height: 50 }}
				>
					<div> Thu</div>
				</div>
				<div
					className="flex justify-center items-center w-full"
					style={{ borderLeft: '1px solid #dbdfe9', height: 50 }}
				>
					<div> Fri</div>
				</div>
				<div
					className="flex justify-center items-center w-full"
					style={{ borderLeft: '1px solid #dbdfe9', height: 50 }}
				>
					<div> Sat</div>
				</div>
				<div
					className="flex justify-center items-center w-full"
					style={{ borderLeft: '1px solid #dbdfe9', height: 50, borderRight: '1px solid #dbdfe9' }}
				>
					<div> Sun</div>
				</div>
			</div>
			{loading ? (
				<div className="loading-spinner">
					<CircularProgress size={35} />
				</div>
			) : (
				<div className="grid grid-cols-7">
					{week.map((day, index) => {
						const currentDayEvents = events.filter(
							(event) =>
								new Date(`${event.datetime}`).getDate() === day.toDate().getDate() &&
								new Date(`${event.datetime}`).getMonth() === day.toDate().getMonth()
						);
						const disabled = (index < 8 && day.date() > 20) || (index > 27 && day.date() < 10);
						const isToday =
							new Date().getDate() === day.toDate().getDate() &&
							new Date().getMonth() === day.toDate().getMonth();
						return (
							<div
								className={`monthly-day-block flex flex-col justify-between ${
									index > 27 ? 'monthly-day-block-btm-border' : ''
								} ${[6, 13, 20, 27, 34].includes(index) ? 'monthly-day-block-right-border' : ''}
                                ${disabled ? 'monthly-day-block-disabled' : ''}
                                `}
							>
								<div
									className={`ml-auto monthly-calendar-date ${
										isToday ? 'monthly-calendar-today' : ''
									}`}
								>
									{day
										.date()
										.toLocaleString('en-US', { minimumIntegerDigits: 2, useGrouping: false })}
								</div>
								{!disabled && !printView && (
									<>
										<div>
											{currentDayEvents.slice(0, 2).map((event) => (
												<MonthlyEventChip
													event={event}
													setRefresh={setRefresh}
													refresh={refresh}
												/>
											))}
										</div>
										<div>
											{currentDayEvents.length > 2 ? (
												<>
													<div
														className="view-all-monthly"
														// onClick={() => {
														// 	setTimeout(() => {
														// 		setWeek([moment(new Date(day))]);
														// 	}, 50);
														// 	setCurrentView('day');
														// }}
														onClick={(e) => handleClick(e, day)}
														aria-describedby={id}
													>
														{/* View More */}
														{`${currentDayEvents?.length - 2} more`}
													</div>
													<PopOverComponent
														open={open}
														anchorEl={anchorEl}
														id={id}
														handleClose={handleClose}
														currentday={currentday}
														filterEvent={filterEvent}
														index={index}
														setRefresh={setRefresh}
														refresh={refresh}
													/>
												</>
											) : (
												''
											)}
										</div>
									</>
								)}
								{!disabled && printView && (
									<>
										<ul>
											{currentDayEvents.map((event) => (
												<li>
													<strong>-</strong> {event?.event_type?.type}
												</li>
											))}
										</ul>
									</>
								)}
							</div>
						);
					})}
				</div>
			)}
		</div>
	);
}

const MonthlyEventChip = ({ event, refresh, setRefresh }) => {
	const dispatch = useDispatch();
	const randomNumber = useMemo(() => {
		return Math.ceil(Math.random() * 6);
	}, [event.id]);

	const openEventModal = () => {
		dispatch(
			Actions.openDialog({
				children: <EventModal event={event} setRefresh={setRefresh} refresh={refresh} />,
			})
		);
	};

	return (
		<Chip
			avatar={
				<img
					style={{ width: '30px', height: '30px' }}
					src={event?.event_type?.icon_url}
					alt={event?.event_type?.type}
				/>
			}
			onClick={openEventModal}
			label={event?.event_type?.type}
			className={`mx-auto event-random-${randomNumber} monthly-event cursor-pointer monthly-schedule-pill`}
		/>
	);
};

const PopOverComponent = ({ open, handleClose, anchorEl, id, currentday, filterEvent, index, refresh, setRefresh }) => {
	const dispatch = useDispatch();
	console.log(filterEvent, 'currentDayEvents');
	return (
		<Popover
			key={index}
			id={id}
			open={open}
			anchorEl={anchorEl}
			onClose={handleClose}
			anchorOrigin={{
				vertical: 'bottom',
				horizontal: 'center',
			}}
			transformOrigin={{
				vertical: 'top',
				horizontal: 'center',
			}}
			PaperProps={{
				style: { width: '300px' },
			}}
		>
			<div className="cross-popover">
				<span className="popday">{currentday?.format('ddd').toUpperCase()}</span>
				<span style={{ fontSize: '24px' }}>{currentday?.date()}</span>
			</div>
			<img src="assets/images/cross-icon.svg" className="crossIcon" alt="crossicon" onClick={handleClose} />
			{filterEvent?.map((event, ind) => (
				<MenuItem
					key={ind}
					role="button"
					onClick={() => {
						dispatch(
							Actions.openDialog({
								children: <EventModal event={event} setRefresh={setRefresh} refresh={refresh} />,
							})
						);
					}}
				>
					<ListItemIcon className="min-w-40">
						<img
							style={{ width: '30px', height: '30px' }}
							src={event?.event_type?.icon_url}
							alt={event?.event_type?.type}
						/>
					</ListItemIcon>
					<ListItemText
						primaryTypographyProps={{
							style: { whiteSpace: 'nowrap', width: 200, overflow: 'hidden', textOverflow: 'ellipsis' },
						}}
						primary={event?.event_type?.type}
					/>
				</MenuItem>
			))}
		</Popover>
	);
};
export default MonthlyCalendar;
