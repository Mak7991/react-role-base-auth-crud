import React, { useEffect, useState } from 'react';
import { CircularProgress, FormControlLabel, Checkbox, Typography, Paper, IconButton } from '@material-ui/core';
import { getAllRooms } from 'app/services/rooms/rooms';
import { useDispatch } from 'react-redux';
import * as Actions from 'app/store/actions';
import CustomButton from 'app/customComponents/CustomButton/CustomButton';
import AnnouncementForm from './entireRoomAnnouncementForm';
import './../parentAnnouncement/parentAnnouncement.css';
import history from '@history';
function RoomSelection({ setActiveTab }) {
	const dispatch = useDispatch();
	const [selectAll, setSelectAll] = useState(false);
	const [allRooms, setAllRooms] = useState([]);
	const [isRoomsLoading, setRoomsLoading] = useState(false);
	const [selectedRooms, setSelectedRooms] = useState([]);
	const [displayParentannouncementForm, setDisplayParentannouncementForm] = useState(false);

	useEffect(() => {
		setRoomsLoading(true);
		getAllRooms()
			.then(({ data }) => {
				setAllRooms(data);
			})
			.catch(() => {
				dispatch(
					Actions.showMessage({
						message: 'Failed to fetch data, please refresh',
						variant: 'error'
					})
				);
			})
			.finally(() => {
				setRoomsLoading(false);
			});
	}, []);

	useEffect(() => {
		if (selectAll) {
			setSelectedRooms(allRooms);
		} else {
			setSelectedRooms([]);
		}
	}, [selectAll]);

	function handleRoomSelection(room) {
		let roomsArray = selectedRooms;

		if (!roomsArray.includes(room)) {
			roomsArray = [...roomsArray, room];
			setSelectedRooms(roomsArray);
			return;
		}
		if (roomsArray.includes(room)) {
			roomsArray = roomsArray.filter(r => r.id !== room.id);
			setSelectedRooms(roomsArray);
		}
	}

	return (
		<>
			{!displayParentannouncementForm && (
				<div className="m-32">
					<div className="flex justify-between items-center">
						<span style={{ paddingTop: '3px' }}>
							<Typography variant="subtitle1" className="font-bold">
								<h1 style={{ fontSize: '20px', display: 'inlineblock' }}>
									<span className="">
										<IconButton
											onClick={() => {
												setActiveTab(0);
											}}
										>
											<img
												src="assets/images/arrow-long.png"
												alt="filter"
												width="24px"
												className="backBtn-img"
											/>
										</IconButton>
									</span>

									Select Room</h1>

							</Typography>
						</span>
						<span>
							<FormControlLabel
								control={
									<Checkbox
										size="small"
										checked={selectAll}
										name="selectAll"
										style={{ color: 'blue' }}
										onChange={() => setSelectAll(!selectAll)}
									/>
								}
								label={<Typography variant="subtitle1">{!selectAll ? 'S' : 'Des'}elect all</Typography>}
							/>
						</span>
					</div>
					<div className="bg-white rounded mt-28 p-32 rooms-list-container">
						{isRoomsLoading ? (
							<div className="load-spinner text-align-center">
								<CircularProgress size={35} />
							</div>
						) : (
							<div className="grid grid-cols-7 gap-28 p-12 rooms-grid">
								{allRooms.map((room, key) => {
									let roomName = room.name.split(' ');
									roomName = roomName.map(string => {
										return string[0].toUpperCase() + string.slice(1);
									});
									roomName = roomName.join(' ');

									return (
										<Paper
											onClick={() => handleRoomSelection(room)}
											key={key}
											elevation={5}
											className={`room-paper text-align-center `}
										>
											<div>
												<div>
													<img
														src={
															selectedRooms.includes(room)
																? 'assets/images/tick.jpg'
																: room.thumb
														}
														alt={room.name}
														className="img-pic"
													/>
												</div>
												<div className="hd-ann">
													<Typography
														variant="subtitle1"
														className="mt-12"
														style={{
															overflow: 'hidden',
															textOverflow: 'ellipsis',
															whiteSpace: 'nowrap'
														}}
													>
														{roomName}
													</Typography>
												</div>
											</div>
										</Paper>
									);
								})}
							</div>
						)}
						<div>
							{!isRoomsLoading && (
								<div className="flex justify-center buttons-containers">
									<span>
										<CustomButton
											variant="secondary"
											width={140}
											onClick={() => {
												setActiveTab(0);
											}}
										>
											Cancel
										</CustomButton>
									</span>
									<CustomButton
										variant="primary"
										width={140}
										onClick={() => {
											if (selectedRooms.length === 0) {
												dispatch(
													Actions.showMessage({
														message: 'Please select the room first!',
														variant: 'error'
													})
												);
											} else {
												setDisplayParentannouncementForm(true);
											}
										}}
									>
										Next
									</CustomButton>
								</div>
							)}
						</div>
					</div>
				</div>
			)}
			{displayParentannouncementForm && (
				<AnnouncementForm
					setActiveTab={setActiveTab}
					selectedRooms={selectedRooms}
					all_room={selectedRooms.length === allRooms.length}
					selectAll={selectAll}
				/>
			)}
		</>
	);
}

export default RoomSelection;
