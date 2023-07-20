/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React, { useState } from 'react';
import './livestreamin.css';
import history from '@history';

import Historycamera from './historycamera/Historycamera';
import Live from './live/Live';
import CameraListing from './cameraListing/CameraListing';
import SavedClips from './savedClips/SavedClips';

function Livestreaming() {
	const [activeTab, setActiveTab] = useState(0);
	if (history.location.state) {
		setActiveTab(0);
		delete history.location.state;
	}

	return (
		<>
			<div className="messaging-top-bar">
				<div className="flex mx-auto mr-30 ml-64 pl-32" style={{ gap: 50 }}>
					<span
						onClick={() => setActiveTab(0)}
						className="cursor-pointer messaging-personal-hd font-semibold text-1xl"
					>
						<h1 className={`${activeTab === 0 ? 'messaging-active-hd' : ''} messaging-hd`}>
							<span className="px-20">Live</span>
						</h1>
					</span>
					<span
						onClick={() => setActiveTab(1)}
						className="cursor-pointer messaging-personal-hd text-1xl font-semibold"
					>
						<h1 className={`${activeTab === 1 ? 'messaging-active-hd' : ''} messaging-hd`}>
							<span className="px-20">History</span>
						</h1>
					</span>

					{/* <span
						onClick={() => setActiveTab(2)}
						className="cursor-pointer messaging-personal-hd text-1xl font-semibold"
					>
						<h1 className={`${activeTab === 2 ? 'messaging-active-hd' : ''} messaging-hd`}>
							<span className="px-20">Saved Clips</span>
						</h1>
					</span> */}
					<span
						onClick={() => setActiveTab(3)}
						className="cursor-pointer messaging-personal-hd text-1xl font-semibold"
					>
						<h1 className={`${activeTab === 3 ? 'messaging-active-hd' : ''} messaging-hd`}>
							<span className="px-20">Camera Listing</span>
						</h1>
					</span>
				</div>
			</div>
			{activeTab === 0 && <Live />}
			{activeTab === 1 && <Historycamera />}

			{activeTab === 2 && <SavedClips />}
			{activeTab === 3 && <CameraListing />}
		</>
	);
}

export default Livestreaming;
