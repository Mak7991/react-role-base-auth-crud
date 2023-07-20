/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React, { useEffect, useState } from 'react';
import './roomspage.css';
import history from '@history';
import { useParams } from 'react-router';
import { getRoom } from 'app/services/rooms/rooms';
import { CircularProgress } from '@material-ui/core';
import RoomStudents from './RoomStudent';
import Feeds from './feeds';

function Room() {
	const [activeTab, setActiveTab] = useState(0);
	const [loading, setLoading] = useState(true);
	const { row, feeds } = history.location.state;
	// room usestate
	const [room, setRoom] = useState(row);
	// get id from useparams hook
	const { id } = useParams();
	console.log(id);
	const [feed, setFeed] = useState(feeds);
	useEffect(() => {
		if (feed) {
			setActiveTab(1);
			setFeed(false);
		}
	});
	useEffect(() => {
		if (room) {
			setLoading(false);
		} else {
			setLoading(true);
			getRoom('', '', id).then(res => {
				setRoom(res.data);
				setLoading(false);
			});
		}
	}, [id]);
	return (
		<>
			<div className="top-bar">
				<div className="flex mx-auto" style={{ gap: 20 }}>
					<span
						onClick={() => setActiveTab(0)}
						className="cursor-pointer personal-hd  font-semibold text-1xl mr-30 ml-40"
					>
						<h1 className={`${activeTab === 0 ? 'active-room-hd' : ''} room-hd`}>Students</h1>
					</span>
					<span onClick={() => setActiveTab(1)} className="cursor-pointer personal-hd text-1xl font-semibold">
						<h1 className={`${activeTab === 1 ? 'active-room-hd' : ''} room-hd`}>Feeds</h1>
					</span>
				</div>
			</div>
			{loading && (
				<div className="flex justify-center items-center h-96">
					<CircularProgress size={35} />
				</div>
			)}
			{!loading ? activeTab ? <Feeds room={room} /> : <RoomStudents row={room} /> : ''}
		</>
	);
}

export default Room;
