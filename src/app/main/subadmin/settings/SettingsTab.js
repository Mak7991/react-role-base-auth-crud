/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React, { useState } from 'react';
import history from '@history';

import Settings from './Settings';
import Account from './Account';

function SettingTab() {
	const queryString = window.location.search;
	const sp = new URLSearchParams(queryString);
	const [activeTab, setActiveTab] = useState(sp.get('showModal') == 'true' ? 1 : 0);

	return (
		<>
			<div className="messaging-top-bar">
				<div className="flex mx-auto mr-30 ml-64 pl-32" style={{ gap: 50 }}>
					<span
						onClick={() => setActiveTab(0)}
						className="cursor-pointer messaging-personal-hd font-semibold text-1xl"
					>
						<h1 className={`${activeTab === 0 ? 'messaging-active-hd' : ''} messaging-hd`}>
							<span className="px-20">School Profile</span>
						</h1>
					</span>
					<span
						onClick={() => setActiveTab(1)}
						className="cursor-pointer messaging-personal-hd text-1xl font-semibold"
					>
						<h1 className={`${activeTab === 1 ? 'messaging-active-hd' : ''} messaging-hd`}>
							<span className="px-20">Account</span>
						</h1>
					</span>
				</div>
			</div>
			{activeTab === 0 && <Settings />}
			{activeTab === 1 && <Account />}
		</>
	);
}

export default SettingTab;
