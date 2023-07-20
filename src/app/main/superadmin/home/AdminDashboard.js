import React, { useRef } from 'react';
import FuseAnimate from '@fuse/core/FuseAnimate';
import { makeStyles } from '@material-ui/core';
import FusePageSimple from '@fuse/core/FusePageSimple';
import SchoolListing from './schoolListing';
import StudentListing from './studentListing';
import './AdminDashboard.css';
import SuperAdminSideBar from './SuperAdminSidebar';
import TotalStaff from './TotalStaffs';
import TotalRoom from './TotalRooms';

const useStyles = makeStyles({
	layoutRoot: {},
	sidebar: {
		width: 330
	}
});

function AdminDashboard() {
	const classes = useStyles();
	const pageLayout = useRef(null);

	return (
		<FusePageSimple
			classes={{
				root: classes.layoutRoot,
				sidebar: classes.sidebar
			}}
			content={
				<div className="pl-72 pr-72 pt-52 pb-136">
					<FuseAnimate animation="transition.slideLeftIn" duration={600}>
						<>
							<SchoolListing />
							<div className="flex flex-row mt-52 middle-div">
								<div className="w-1/2 pr-20 ">
									<StudentListing />
								</div>
								<div className="w-1/2 pl-20 ">
									<TotalRoom />
								</div>
							</div>
							<TotalStaff />
						</>
					</FuseAnimate>
				</div>
			}
			rightSidebarContent={
				<>
					<SuperAdminSideBar />
				</>
			}
			innerScroll
			ref={pageLayout}
		/>
	);
}

export default AdminDashboard;
