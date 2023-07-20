/* eslint-disable no-unused-expressions */
import React, { useMemo } from 'react';
import moment from 'moment';
import { CircularProgress, Chip } from '@material-ui/core';
import { useDispatch } from 'react-redux';
import * as Actions from 'app/store/actions/';
import EventModal from './EventModal';
import './calendar.css';

function WeeklyCalendar({ week, loading, events, refresh, setRefresh }) {
	return (
		<div>
			<table className="event-table-container bg-white">
				<thead style={{ width: '100%', tableLayout: 'fixed' }}>
					<tr>
						{week.map((day, key) => {
							return (
								<th key={key} style={{ textAlign: 'center', width: '14.2%' }}>
									<div
										className={`week-days ${
											moment(day).format('YYYY-MM-DD') === moment().format('YYYY-MM-DD')
												? 'current-date'
												: ''
										}`}
									>
										<span className="day">{moment(day).format('ddd')}</span>
										<span className="date">{moment(day).format('DD')}</span>
									</div>
								</th>
							);
						})}
					</tr>
				</thead>
				{events[0] && (
					<tbody>
						<tr>
							<td style={{ width: '14.2%' }} className="event-table-side-header staff-name">
								{events
									.filter(
										(event) => new Date(event.datetime).getDate() === new Date(week[0]).getDate()
									)
									.map((event) => (
										<div className="flex flex-col weekly-calendar-event weekly-calendar-event-leftmost">
											<WeekEventChip event={event} setRefresh={setRefresh} refresh={refresh} />
										</div>
									))}
							</td>
							<td style={{ width: '14.2%' }} className="event-table-side-header staff-name">
								{events
									.filter(
										(event) => new Date(event.datetime).getDate() === new Date(week[1]).getDate()
									)
									.map((event) => (
										<div className="flex flex-col weekly-calendar-event">
											<WeekEventChip event={event} setRefresh={setRefresh} refresh={refresh} />
										</div>
									))}
							</td>
							<td style={{ width: '14.2%' }} className="event-table-side-header staff-name">
								{events
									.filter(
										(event) => new Date(event.datetime).getDate() === new Date(week[2]).getDate()
									)
									.map((event) => (
										<div className="flex flex-col weekly-calendar-event">
											<WeekEventChip event={event} setRefresh={setRefresh} refresh={refresh} />
										</div>
									))}
							</td>
							<td style={{ width: '14.2%' }} className="event-table-side-header staff-name">
								{events
									.filter(
										(event) => new Date(event.datetime).getDate() === new Date(week[3]).getDate()
									)
									.map((event) => (
										<div className="flex flex-col weekly-calendar-event">
											<WeekEventChip event={event} setRefresh={setRefresh} refresh={refresh} />
										</div>
									))}
							</td>
							<td style={{ width: '14.2%' }} className="event-table-side-header staff-name">
								{events
									.filter(
										(event) => new Date(event.datetime).getDate() === new Date(week[4]).getDate()
									)
									.map((event) => (
										<div className="flex flex-col weekly-calendar-event">
											<WeekEventChip event={event} setRefresh={setRefresh} refresh={refresh} />
										</div>
									))}
							</td>
							<td style={{ width: '14.2%' }} className="event-table-side-header staff-name">
								{events
									.filter(
										(event) => new Date(event.datetime).getDate() === new Date(week[5]).getDate()
									)
									.map((event) => (
										<div className="flex flex-col weekly-calendar-event">
											<WeekEventChip event={event} setRefresh={setRefresh} refresh={refresh} />
										</div>
									))}
							</td>
							<td
								style={{ width: '14.2%' }}
								className="event-table-side-header staff-name weekly-calendar-event-rightmost"
							>
								{events
									.filter(
										(event) => new Date(event.datetime).getDate() === new Date(week[6]).getDate()
									)
									.map((event) => (
										<div className="flex flex-col weekly-calendar-event">
											<WeekEventChip event={event} setRefresh={setRefresh} refresh={refresh} />
										</div>
									))}
							</td>
						</tr>
					</tbody>
				)}
			</table>
			{loading && (
				<div className="loading-spinner">
					<CircularProgress size={35} />
				</div>
			)}
			{!loading && !events && (
				<div className="no-schedules">
					<p>No Events</p>
				</div>
			)}
		</div>
	);
}

const WeekEventChip = ({ event, refresh, setRefresh }) => {
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
					style={{ width: '46px', height: '46px' }}
					src={event.event_type.icon_url}
					alt={event.event_type.type}
				/>
			}
			onClick={openEventModal}
			label={event.event_type.type}
			className={`event-random-${randomNumber} weekly-event cursor-pointer event-schedule-pill`}
		/>
	);
};

export default WeeklyCalendar;
