import React from 'react';
import './studentCheckIn.css';
import { Link } from 'react-router-dom';

function StudentCheckIn() {
	return (
		<Link className="sci-wrapper link" to="/checkinout" id="go-to-check-in-out">
			<div className="sci-icon-wrapper">
				<img src="assets/images/schoolAdminTopNav/checicon.svg" className="sci-icon" alt="checkin" />
			</div>
			<div className="sci-text">Student Check-in</div>
		</Link>
	);
}

export default StudentCheckIn;
