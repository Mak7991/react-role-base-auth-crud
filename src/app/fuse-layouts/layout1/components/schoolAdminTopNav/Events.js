import React from 'react';
import './events.css';
import { Link } from 'react-router-dom';

function Events() {
	return (
		<Link className="sci-wrapper link" to="/calendar-addevent" id="go-to-events">
			<div className="sci-icon-wrapper icon-end">
				<img src="assets/images/schoolAdminTopNav/event-icon.svg" className="sci-icon" alt="event" />
			</div>
			<div className="events-text events">Events</div>
		</Link>
	);
}

export default Events;
