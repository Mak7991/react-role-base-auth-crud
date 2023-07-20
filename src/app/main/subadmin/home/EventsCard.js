import React, { useEffect, useState } from 'react';
import history from '@history';
import * as Actions from 'app/store/actions';
import MoreHorizIcon from '@material-ui/icons/MoreHoriz';
import dayjs from 'dayjs';
import { Avatar, IconButton, Menu, MenuItem, Tooltip } from '@material-ui/core';
import { useDispatch } from 'react-redux';
import DeletEventDailog from './DeleteEventConfirmDialog';

function EventsCard({ row, setRefresh, refresh, isEventsLoading, setIsEventsLoading }) {
	const [anchorEl, setAnchorEl] = useState(null);
	const dispatch = useDispatch();
	const open = Boolean(anchorEl);

	const handleClick = event => {
		setAnchorEl(event.currentTarget);
	};
	const handleClose = () => {
		setAnchorEl(null);
	};

	const updateEvent = row => {
		history.push({ pathname: `/calendar-updateevent/${row.id}` });
	};

	const DeleteEvent = ro => {
		dispatch(
			Actions.openDialog({
				children: (
					<DeletEventDailog
						row={ro}
						refresh={refresh}
						setRefresh={setRefresh}
						setAnchorEl={setAnchorEl}
						isEventsLoading={isEventsLoading}
						setIsEventsLoading={setIsEventsLoading}
					/>
				)
			})
		);
	};

	return (
		<div className="event-box" key={row.id}>
			<div className=" flex justify-between ">
				<h5 className="font-extrabold">{dayjs(row?.datetime).format('MMMM DD, YYYY')}</h5>
				<IconButton
					aria-label="more"
					aria-controls="long-menu"
					aria-haspopup="true"
					id="edit-delete-popup"
					onClick={handleClick}
					style={{ marginTop: '-15px' }}
				>
					<MoreHorizIcon />
				</IconButton>
				<Menu
					id="long-menu"
					MenuListProps={{
						'aria-labelledby': 'long-button'
					}}
					anchorEl={anchorEl}
					open={open}
					onClose={handleClose}
				>
					<MenuItem key={row.id} onClick={() => updateEvent(row)}>
						<em id="edit-event">Edit</em>
					</MenuItem>
					<MenuItem key={row.id} onClick={() => DeleteEvent(row)}>
						<em id="delete-event">Delete</em>
					</MenuItem>
				</Menu>
			</div>
			<div className="flex justify-between items-center ">
				<h5 className="event_name mr-8 flex ">
					<p
						style={{
							marginTop: '-20px',
							marginRight: '8px',
							fontWeight: '700',
							fontSize: '30px',
							color: '#FFBC00'
						}}
					>
						{' '}
						.{' '}
					</p>{' '}
					{row?.event_type?.type}!
				</h5>
				<Avatar alt="event-photo" src={row?.event_type?.icon_url} />
			</div>
			<h5 className="flex event-description">
				{row?.description ? (
					<Tooltip
						title={`${row?.student?.first_name ? row?.student?.first_name : ''} ${
							row?.student?.last_name ? row?.student?.last_name : ''
						} ${row?.description ? row?.description : ''}`}
						arrow
					>
						<span>
							{`${row?.student?.first_name ? row?.student?.first_name : ''} ${
								row?.student?.last_name ? row?.student?.last_name : ''
							} ${row?.description?.slice(0, 10) ? row?.description?.slice(0, 10) : ''} .....`}
						</span>
					</Tooltip>
				) : (
					<span>{`${row?.student?.first_name ? row?.student?.first_name : ''} ${
						row?.student?.last_name ? row?.student?.last_name : ''
					} `}</span>
				)}
			</h5>
			<div className="all-rooms">
				<div className="flex items-center" style={{ gap: 5 }}>
					{/* <AvatarGroup max={4}>
						{row.rooms.map((room, i) => (
							<>{<Avatar key={i} className="room-icon" src={room?.photo} />}</>
						))}
					</AvatarGroup> */}
					<div className="flex">
						{row.rooms.map((room, index) =>
							index < 4 ? (
								<Avatar
									key={index}
									style={{ width: 30, height: 30, marginRight: -5 }}
									className="room-icon"
									src={room?.photo}
								/>
							) : (
								''
							)
						)}
					</div>
					<h5 className="room-num">&nbsp;{row.rooms.length > 4 && `${row.rooms.length - 4} Other Rooms`} </h5>
				</div>
			</div>
		</div>
	);
}

export default EventsCard;
