/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
import React, { useState } from 'react';
import './messaging.css';
import history from '@history';
import ParentAnnouncement from './parentAnnouncement/ParentAnnouncement';
import ViewTeacherAnnouncement from './TeacherAnnouncement/ViewTeacherAnnouncement';
import MessagesWindow from './messaging/messages';

function Messaging() {
	const [activeTab, setActiveTab] = useState(0);
	if (history.location.state) {
		setActiveTab(0);
		delete history.location.state;
	}

	return (
		<>
			<div className="messaging-top-bar">
				<div className="flex mx-auto mr-30 ml-40" style={{ gap: 20 }}>
					<span
						onClick={() => setActiveTab(0)}
						className="cursor-pointer messaging-personal-hd font-semibold text-1xl"
					>
						<h1 className={`${activeTab === 0 ? 'messaging-active-hd' : ''} messaging-hd`}>Messaging</h1>
					</span>
					<span
						onClick={() => setActiveTab(1)}
						className="cursor-pointer messaging-personal-hd text-1xl font-semibold"
					>
						<h1 className={`${activeTab === 1 ? 'messaging-active-hd' : ''} messaging-hd`}>
							Parent Announcements
						</h1>
					</span>
					<span
						onClick={() => setActiveTab(2)}
						className="cursor-pointer messaging-personal-hd text-1xl font-semibold"
					>
						<h1 className={`${activeTab === 2 ? 'messaging-active-hd' : ''} messaging-hd`}>
							Teacher Announcements
						</h1>
					</span>
				</div>
			</div>
			{activeTab === 0 && <MessagesWindow />}
			{activeTab === 1 && <ParentAnnouncement />}
			{activeTab === 2 && <ViewTeacherAnnouncement />}
		</>
	);
}

export default Messaging;
