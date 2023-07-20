import React from 'react';
import moment from 'moment';
import { CircularProgress, Avatar } from '@material-ui/core';
import CalendarSchedules from './calendarSchedules';
import './calendar.css';

function Calendar({ week, loading, staffSchedules, printTable, allRooms, allStaff }) {
	return (
		<div className={printTable}>
			<table className="table-container bg-white">
				<thead>
					<tr>
						<th className="table-side-header">Active Staff</th>
						{week.map((day, key) => {
							return (
								<th key={key} style={{ textAlign: 'center' }}>
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
				{staffSchedules[0] && (
					<tbody>
						{staffSchedules.map((teacher, key) => {
							return (
								<CalendarSchedules
									week={week}
									schedule={teacher.schedule}
									rooms={allRooms}
									staff={allStaff}
									teacher={teacher}
								/>
							);
						})}
					</tbody>
				)}
			</table>
			{loading && (
				<div className="loading-spinner">
					<CircularProgress size={35} />
				</div>
			)}
			{!loading && !staffSchedules[0] && (
				<div className="no-schedules">
					<p>No Schedules</p>
				</div>
			)}
		</div>
	);
}

export default Calendar;
