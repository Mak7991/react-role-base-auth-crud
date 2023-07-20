import React from 'react';
import history from '@history';
import { Button } from '@material-ui/core';
import ChatApp from './ChatThread/ChatApp';

function MessagingThread() {
	return (
		<>
			<div className="p-32">
				<div className="flex gap-10">
					<Button
						onClick={() => {
							history.push({
								state: 'Open messaging',
								pathname: '/messaging'
							});
						}}
					>
						<img
							alt="Go Back"
							className="cursor-pointer"
							src="assets/images/arrow-long.png"
							style={{ width: '25px' }}
						/>
					</Button>
					<h2 className="font-bold">Chat</h2>
				</div>
				<ChatApp />
			</div>
		</>
	);
}

export default MessagingThread;
