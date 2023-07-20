import React, { useState, useEffect } from 'react';
import SelectParentAnnoucementRooms from './SelectParentAnnoucementRooms';
import ViewParentAnnouncement from './ViewParentAnnouncement';

function ParentAnnouncement() {
	const [currentScreen, setCurrentScreen] = useState(0);

	return (
		<div>
			{currentScreen === 0 && <ViewParentAnnouncement setCurrentScreen={setCurrentScreen} />}
			{currentScreen === 1 && <SelectParentAnnoucementRooms setCurrentScreen={setCurrentScreen} />}
		</div>
	);
}

export default ParentAnnouncement;
