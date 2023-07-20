import React from 'react';
import { Icon } from '@material-ui/core';
import { History } from '@material-ui/icons';

function ExpiredLink() {
	return (
		<>
			<div className="flex flex-col h-full items-center justify-center">
				<History style={{ fontSize: 120, color: '#42C2FA', marginBottom: '20px', marginTop: '-80px' }} />
				<div className="text-xl font-900">Oh no! the form link has expired.</div>
			</div>
		</>
	);
}

export default ExpiredLink;
