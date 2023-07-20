/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React from 'react';
import './Reports.css';
import FuseAnimate from '@fuse/core/FuseAnimate';
import history from '@history';
import FuseScrollbars from '@fuse/core/FuseScrollbars';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles(theme => ({
	content: {
		position: 'relative',
		display: 'flex',
		overflow: 'auto',
		flex: '1 1 auto',
		flexDirection: 'column',
		width: '100%',
		'-webkit-overflow-scrolling': 'touch',
		zIndex: 2
	}
}));

const Checkinpage = () => {
	history.push({
		pathname: `/reports-Checkin`
	});
};

const ParentSub = () => {
	history.push({
		pathname: `/ParentSub`
	});
};

function Reports() {
	const classes = useStyles();

	return (
		<FuseScrollbars className={classes.content} scrollToTopOnRouteChange>
			<FuseAnimate animation="transition.slideLeftIn" duration={600}>
				<div className="reports-main-div px-60 pt-60">
					<div className="mb-48">
						<h3 className="mb-28" style={{fontSize:'20px' , fontWeight:'700'}}>Room Reports</h3>
						<div className="flex flex-nowrap mb-28" style={{ gap: 50 }}>
							<div className="bg-white rounded room-reports-box cursor-pointer" onClick={Checkinpage}>
								<h3>Check In</h3>
								<p>Review student check-in information</p>
							</div>
							<div
								className="bg-white rounded room-reports-box cursor-pointer"
								onClick={() => history.push('/reports-attendance')}
							>
								<h3>Daily Attendance Summary</h3>
								<p>Review daily attendance of center or classroom</p>
							</div>
						</div>
						<div className="flex flex-nowrap" style={{ gap: 50 }}>
							<div
								className="bg-white rounded room-reports-box cursor-pointer"
								onClick={() => history.push('/reports-roomRatio')}
							>
								<h3>Ratio</h3>
								<p>Review detailed ratio of each room</p>
							</div>
							<div
								className="bg-white rounded room-reports-box cursor-pointer"
								onClick={() => history.push('/RoomCheck')}
							>
								<h3>Room Check</h3>
								<p>Review real time class ratio for staff in classroom</p>
							</div>
						</div>
					</div>
					<div className="mb-48">
						<h3 className="mb-28" style={{fontSize:'18px' , fontWeight:'700'}}>Student Reports</h3>
						<div className="flex flex-nowrap mb-28" style={{ gap: 50 }}>
							<div
								className="bg-white rounded student-reports-box cursor-pointer "
								onClick={() => history.push('/reports-staff')}
							>
								<h3>Staff</h3>
								<p>Review staff information</p>
							</div>
							<div
								className="bg-white rounded student-reports-box cursor-pointer "
								onClick={() => history.push('/reports-enrolledStudent')}
							>
								<h3>Enrolled Student Info</h3>
								<p>Review enrolled student information</p>
							</div>
						</div>

						<div className="flex flex-nowrap mb-28" style={{ gap: 50 }}>
							<div
								className="bg-white rounded student-reports-box cursor-pointer "
								onClick={() => history.push('/reports-activity')}
							>
								<h3>Activities</h3>
								<p>Review activities logged by teacher in your classroom</p>
							</div>
							<div
								className="bg-white rounded student-reports-box cursor-pointer "
								onClick={() => history.push('/reports-age')}
							>
								<h3>Age</h3>
								<p>Review age and birthday of students</p>
							</div>
						</div>
						<div className="flex flex-nowrap mb-28" style={{ gap: 50 }}>
							<div
								className="bg-white rounded student-reports-box cursor-pointer "
								onClick={() => history.push('/reports-allergy')}
							>
								<h3>Allergies</h3>
								<p>Review student allergies by classroom or school</p>
							</div>
							<div
								className="bg-white rounded student-reports-box cursor-pointer "
								onClick={() => history.push('/reports-contact')}
							>
								<h3>Contacts</h3>
								<p>Review contacts information for parents and approved pickups</p>
							</div>
						</div>
						<div className="flex flex-nowrap mb-28" style={{ gap: 50 }}>
							<div
								className="bg-white rounded student-reports-box cursor-pointer "
								onClick={() => history.push('/reports-immunization')}
							>
								<h3>Immunization Records</h3>
								<p>Review immunization records of your students</p>
							</div>
							<div
								className="bg-white rounded student-reports-box cursor-pointer "
								onClick={() => history.push('/reports-due-overdue')}
							>
								<h3>Immunizations due/overdue</h3>
								<p>Review upcoming and overdue immunizations</p>
							</div>
						</div>
						<div className="flex flex-nowrap mb-28" style={{ gap: 50 }}>
							<div
								className="bg-white rounded student-reports-box cursor-pointer "
								onClick={() => history.push('/reports-medication')}
							>
								<h3>Medical</h3>
								<p>Review student medical</p>
							</div>
							<div
								className="bg-white rounded student-reports-box cursor-pointer "
								onClick={() => history.push('/reports-meal')}
							>
								<h3>Meals</h3>
								<p>Review summary of meals served at your school</p>
							</div>
						</div>
					</div>
					<div>
						<h3 className="mb-28" style={{fontSize:'18px' , fontWeight:'700'}}>Financial Reports</h3>
						<div className="flex flex-nowrap mb-28" style={{ gap: 50 }}>
							<div
								className="bg-white rounded download-reports-box cursor-pointer"
								onClick={() => history.push('/reports-subscription')}
							>
								<h3>Parent Subscription Reports</h3>
								<p>Review parent subscription information</p>
							</div>
							<div
								className="bg-white rounded student-reports-box cursor-pointer "
								onClick={() => history.push('/reports-royalties')}
							>
								<h3>Royalty Reports</h3>
								<p>Review royalty related information</p>
							</div>
						</div>
					</div>
					<div>
						<h3 className="mb-28" style={{fontSize:'18px' , fontWeight:'700'}}>Other Reports</h3>
						<div className="flex flex-nowrap mb-28" style={{ gap: 50 }}>
							<div
								className="bg-white rounded download-reports-box cursor-pointer"
								onClick={() => history.push('/reports-download')}
							>
								<h3>Quick Reports</h3>
								<p>Export report of variety of activites</p>
							</div>
							<div className="student-reports-box" />
						</div>
					</div>
				</div>
			</FuseAnimate>
		</FuseScrollbars>
	);
}
export default Reports;
