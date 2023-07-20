import { Avatar, IconButton, Icon } from '@material-ui/core';
import { Close } from '@material-ui/icons/';
import { useDispatch } from 'react-redux';
import * as Actions from 'app/store/actions/';
import React from 'react';
import history from '@history';
import { deleteEvent } from 'app/services/events/events';
import './calendar.css';

function EventModal({ event, setRefresh, refresh }) {
	const dispatch = useDispatch();

	const gotoUpdateEvent = (event) => {
		dispatch(Actions.closeDialog());
		history.push({ pathname: `/calendar-updateevent/${event.id}` });
	};
	const DeleteEvent = (event) => {
		dispatch(Actions.closeDialog());
		deleteEvent(event.id)
			.then((res) => {
				setRefresh(!refresh);
				dispatch(
					Actions.showMessage({
						message: res.data.message,
						autoHideDuration: 1500,
						variant: 'success',
					})
				);
			})
			.catch((err) => {
				console.log(err);
			});
	};

	return (
		// <div className="p-16 flex flex-col row-gap-16 text-large" style={{ width: 400, minHeight: 250 }}>
		// 	<div className="flex flex-col col-gap-12 text-large">
		// 		<IconButton className="p-0 self-end" onClick={() => dispatch(Actions.closeDialog())}>
		// 			<Icon>
		// 				<Close />
		// 			</Icon>
		// 		</IconButton>
		// 		<div className="flex col-gap-6 self-start items-center">
		// 			<Avatar src={event.event_type.icon_url} />
		// 			<div className="justify-self-stretch text-2xl font-semibold">{event.event_type.type}</div>
		// 		</div>
		// 	</div>
		// 	<div className="flex items-center col-gap-6 ">
		// 		<div className="text-lg font-semibold">When: </div>
		// 		<div className="text-base">{new Date(event.datetime).toDateString()}</div>
		// 	</div>
		// 	<div className="flex items-center col-gap-6">
		// 		<div className="text-lg font-semibold">Where: </div>
		// 		<div className="flex">
		// 			{event.rooms?.slice(0, 2).map(room => (
		// 				<div className="flex">
		// 					<Avatar src={room.photo} style={{ width: 30, height: 30 }} />
		// 				</div>
		// 			))}
		// 			{event.rooms.length > 2 ? `${event.rooms.length - 2} more` : ''}
		// 		</div>
		// 	</div>
		// 	{event.student ? (
		// 		<div className="flex items-center col-gap-6">
		// 			<div className="text-lg font-semibold">Who: </div>
		// 			<div className="text-base">{`${event.student.first_name} ${event.student.last_name}`}</div>
		// 		</div>
		// 	) : (
		// 		''
		// 	)}
		// 	<div className="flex col-gap-6">
		// 		<div className="text-lg font-semibold">Description: </div>
		// 		<div className="text-base">{event.description || 'No description available'}</div>
		// 	</div>
		// </div>
		<div className="flex flex-col p-24" style={{ width: 450, minHeight: 225, gap: 20 }}>
			<IconButton className="p-0 self-end" onClick={() => dispatch(Actions.closeDialog())}>
				<Icon>
					<Close />
				</Icon>
			</IconButton>
			<div className="flex flex-col row-gap-6 items-center">
				<Avatar style={{ width: 70, height: 70 }} src={event?.event_type?.icon_url} />
				<div className="justify-self-stretch text-2xl font-semibold">{event?.event_type?.type}</div>
			</div>
			<div
				className="grid grid-cols-3 items-center"
				style={{
					gap: 8,
				}}
			>
				<div className="my-8">
					<div style={{ fontSize: 10 }}>When</div>
					<div style={{ fontSize: 13 }} className="font-bold truncate break">
						{new Date(event?.datetime).toDateString()}
					</div>
				</div>
				<div className="my-8" />
				<div className="my-8">
					<div style={{ fontSize: 10 }}>Where</div>
					<div style={{ fontSize: 13, gap: 4 }} className="font-bold flex items-center">
						{event?.rooms?.slice(0, 2)?.map((room) => (
							<div className="flex">
								<Avatar src={room?.photo} style={{ width: 30, height: 30 }} />
							</div>
						))}
						{event?.rooms?.length > 2 ? `${event?.rooms?.length - 2} more` : ''}
					</div>
				</div>
				{event?.student ? (
					<>
						<div className="my-8 self-start">
							<div style={{ fontSize: 10 }}>Who</div>
							<div style={{ fontSize: 13 }} className="font-bold">
								{`${event?.student?.first_name} ${event?.student?.last_name}`}
							</div>
						</div>
						{event?.description && (
							<>
								<div className="my-8" />
								<div className="my-8" />
							</>
						)}
					</>
				) : (
					''
				)}
				{event?.description && (
					<div className="my-8 z-10 self-start col-span-3">
						<div style={{ fontSize: 10 }}>Description</div>
						<div className="flex font-bold break">{event?.description}</div>
					</div>
				)}
			</div>
			<div className="flex justify-center" style={{ marginTop: '15px' }}>
				<div>
					<button
						variant="secondary"
						width="140px"
						id={`delete-event-${event.id}`}
						onClick={() => DeleteEvent(event)}
						className="delete-btn"
					>
						<IconButton size="small">
							<img src="assets/images/dlt.png" alt="delete" width="25px" />
						</IconButton>
						Delete
					</button>
					<button
						variant="primary"
						type="submit"
						width="140px"
						fontSize="15px"
						id={`update-event-${event.id}`}
						onClick={() => gotoUpdateEvent(event)}
						className="update-btn"
					>
						<IconButton size="small">
							<img src="assets/images/circle-edit.png" alt="edit" width="25px" />
						</IconButton>
						Edit
					</button>
				</div>
			</div>
		</div>
	);
}

export default EventModal;
