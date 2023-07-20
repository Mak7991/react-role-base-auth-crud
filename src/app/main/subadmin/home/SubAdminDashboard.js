import FusePageSimple from '@fuse/core/FusePageSimple';
import { makeStyles } from '@material-ui/core/styles';
import React, { useState, useRef } from 'react';
import FuseAnimate from '@fuse/core/FuseAnimate';
import './SubAdminDashboard.css';
import UpcomingBirthdays from './UpcomingBirthday';
import RoomRatios from './RoomRatios';
import EventsSidebar from './EventsSideBar';
import MessageListing from './MessageListing';
import LoggedActivities from './LoggedActivities/LoggedActivities';
import Childremainder from './Childremainder';

const useStyles = makeStyles({
	layoutRoot: {},
	sidebar: {
		width: 320
	}
});

function SubAdminDashboard() {
	const classes = useStyles();
	const pageLayout = useRef(null);
	const [childremainder, setchildremainder] = useState(5);

	return (
		<>
			<FusePageSimple
				classes={{
					root: classes.layoutRoot,
					sidebar: classes.sidebar
				}}
				content={
					<div className="pl-72 pr-72 pt-20 pb-64">
						<br />
						<FuseAnimate animation="transition.slideLeftIn" duration={600}>
							<div>
								<div className="w-full ">
									<div className=" flex items-end justify-between">
										<div className="birthday-div">
											<MessageListing />
										</div>

										<RoomRatios />
									</div>

									<div className="second-div">
										<Childremainder topest={childremainder} />
									</div>
									<LoggedActivities />
								</div>
							</div>
						</FuseAnimate>
					</div>
				}
				rightSidebarContent={
					<div className="home-sidebar">
						<EventsSidebar />
						<UpcomingBirthdays />
					</div>
				}
				innerScroll
				ref={pageLayout}
			/>
		</>
	);
}

export default SubAdminDashboard;
