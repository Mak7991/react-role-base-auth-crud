import { CircularProgress, Chip } from '@material-ui/core';
import React, { useMemo } from 'react';
import { useDispatch } from 'react-redux';
import * as Actions from 'app/store/actions/';
import moment from 'moment';
import EventModal from './EventModal';

function DailyCalendar({ events, loading, week, refresh, setRefresh }) {
	return (
		<div style={{ borderLeft: '1px solid #dbdfe9' }}>
			{
				<div className="daily-day current-date">
					<span className="day">{moment(week[0]).format('ddd')}</span>
					<span className="date">{moment(week[0]).format('DD')}</span>
				</div>
			}
			{loading && (
				<div className="loading-spinner">
					<CircularProgress size={35} />
				</div>
			)}
			{!loading && !events.length && (
				<div className="no-schedules">
					<p>No Events</p>
				</div>
			)}
			{!loading && events && (
				<div className="flex col-gap-8 flex-col">
					{events.map((event, index) => (
						<div
							className="daily-event-wapper"
							style={{ borderTop: index === 0 ? '1px solid #dbdfe9' : '' }}
						>
							<DailyEventChip event={event} setRefresh={setRefresh} refresh={refresh} />
						</div>
					))}
				</div>
			)}
		</div>
	);
}

const DailyEventChip = ({ event, refresh, setRefresh }) => {
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
			className={`event-random-${randomNumber} daily-event cursor-pointer event-schedule-pill`}
		/>
	);
};

export default DailyCalendar;
