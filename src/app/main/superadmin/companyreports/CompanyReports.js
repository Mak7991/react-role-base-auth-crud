/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React from 'react';
import './companyReport.css';
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

function CompanyReports() {
	const classes = useStyles();

	return (
		<FuseScrollbars className={classes.content} scrollToTopOnRouteChange>
			<FuseAnimate animation="transition.slideLeftIn" duration={600}>
				<div className="reports-main-div px-60 pt-60">
					<div className="">
						<h3 className="mb-28" style={{ fontSize: '20px' , fontWeight: '700'}}>
							Report
						</h3>
						<div className="flex flex-nowrap margin-bottom-div" style={{ gap: 50 }}>
							<div
								className="bg-white rounded room-reports-box cursor-pointer"
								onClick={() => history.push('/staff-report')}
							>
								<h3>Staff</h3>
								<p>Check the overall staffs information of the company </p>
							</div>
							<div
								className="bg-white rounded room-reports-box cursor-pointer"
								onClick={() => history.push('/enrolledStudent-report')}
							>
								<h3>Enrolled Students </h3>
								<p>Check the overall enrolled students information of the company </p>
							</div>
						</div>
						<div className="flex flex-nowrap second-box-margin" style={{ gap: 50 }}>
							<div
								className="bg-white rounded room-reports-box cursor-pointer"
								onClick={() => history.push('/immunization-report')}
							>
								<h3>Immunization </h3>
								<p>Check the overall immunization information of the students. </p>
							</div>
							<div
								className="bg-white rounded room-reports-box cursor-pointer"
								onClick={() => history.push('/emergencyContact-report')}
							>
								<h3>Emergency Contacts</h3>
								<p>Check the overall emergency contacts of the company. </p>
							</div>
						</div>
					</div>
					<div>
						<div className="flex flex-nowrap third-margin" style={{ gap: 50 }}>
							<div
								className="bg-white rounded download-reports-box cursor-pointer"
								onClick={() => history.push('/allergy-report')}
							>
								<h3>Allergy</h3>
								<p>Check the overall allergy information of the students </p>
							</div>
							<div className="student-reports-box" />
						</div>
					</div>
					<div className="mb-48">
						<h3 className="font-extrabold mb-28" style={{ fontSize: '18px', fontWeight: '700'}}>
							Subscription/ Royalties Report
						</h3>
						<div className="flex flex-nowrap" style={{ gap: 50 }}>
							<div
								className="bg-white rounded student-reports-box cursor-pointer "
								onClick={() => history.push('/ParentReports')}
							>
								<h3>Parent Subscription Report </h3>
								<p>Check the overall parent subscription information of the company. </p>
							</div>
							<div
								className="bg-white rounded student-reports-box cursor-pointer "
								onClick={() => history.push('/schoolRoyalties-report')}
							>
								<h3>School Royalties Report </h3>
								<p>Check the overall school royalties of the company. </p>
							</div>
						</div>
					</div>
				</div>
			</FuseAnimate>
		</FuseScrollbars>
	);
}
export default CompanyReports;
