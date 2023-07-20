import React, { useState } from 'react';
import MessagingListing from './messagingListing';
import RoomSelection from './entireRoomSelection';
import IndividualMessageStudentSelection from './individualStudentSelection';
import '../TeacherAnnouncement/teacherAnnouncement.css';
import '../messaging.css';

function MessagesWindow() {
	const [activeTab, setActiveTab] = useState(0);

	return (
		<>
			{activeTab === 0 && <MessagingListing setActiveTab={setActiveTab} />}
			{activeTab === 1 && <IndividualMessageStudentSelection setActiveTab={setActiveTab} />}
			{activeTab === 2 && <RoomSelection setActiveTab={setActiveTab} />}
		</>
	);
}

export default MessagesWindow;
