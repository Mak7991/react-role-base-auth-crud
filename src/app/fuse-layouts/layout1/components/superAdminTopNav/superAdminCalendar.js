import React from 'react';
import './superAdminCalendar.css';

function Calendar({ onClick }) {
	return (
		<button type="button" onClick={onClick}>
			<div className="cal-wrapper flex flex-col items-center">
				<div className="cal-ico-wrapper">
					<img src="assets/images/schoolAdminTopNav/date.svg" className="calendar" alt="calendar" />
				</div>
				<div className="cal-text">{`${new Date().getDate()}, ${new Date().toString().slice(0, 3)}`}</div>
			</div>
		</button>
	);
}

export default Calendar;
