import React, { useState } from 'react';
import { checkIn } from 'app/services/students/students';
import { CircularProgress } from '@material-ui/core';
import './rooms.css';
import { useDispatch } from 'react-redux';
import * as Actions from 'app/store/actions';
import CustomButton from 'app/customComponents/CustomButton/CustomButton';
import PickupCard from './PickupCard';

function Pickups({ stuData, roomId, setActiveId }) {
	const [isLoading, setIsLoading] = useState(false);

	const dispatch = useDispatch();

	const checkInGeneric = () => {
		const data = {
			student_id: [stuData.id],
			room_id: roomId,
			family_id: 0,
			is_parent: 0
		};
		setIsLoading(true);
		checkIn(data)
			.then(res => {
				setActiveId(0);
				dispatch(
					Actions.showMessage({
						variant: 'success',
						message: res.data.message
					})
				);
				// setRefresh(!refresh);
			})
			.catch(err => {
				dispatch(
					Actions.showMessage({
						variant: 'error',
						message: 'Failed to update student status'
					})
				);
			})
			.finally(() => setIsLoading(false));
	};
	return (
		<div className="pickups">
			{stuData.parents ? (
				<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
					<h4 className="mb-28 font-extrabold" style={{ fontSize: '20px' }}>
						Parents
					</h4>
					{stuData.checkin_status === 'checkin' ? (
						<></>
					) : (
						// <button type="button" onClick={checkInGeneric} disabled={checkedIn && checkedOut}>
						// 	{!isLoading ? 'Check In' : <CircularProgress size={25} color="white" />}
						// </button>
						<>
							{!isLoading ? (
								<CustomButton onClick={checkInGeneric}>Check In</CustomButton>
							) : (
								<CircularProgress size={25} />
							)}
						</>
					)}
				</div>
			) : (
				<></>
			)}

			{/* {stuData.parent.can_pickup ? (
				<PickupCard
					key={stuData.parent.id}
					pickup={stuData.parent}
					checkedIn=
					studentId={stuData.id}
					roomId={roomId}
					setActiveId={setActiveId}
					// refresh={refresh}
					// setRefresh={setRefresh}
					isLoading={isLoading}
					setIsLoading={setIsLoading}
				/>
			) : (
				<></>
			)} */}
			{stuData.parents.map(parent => (
				<PickupCard
					key={parent.id}
					pickup={parent}
					checkedIn={stuData.checkin_status === 'checkin'}
					studentId={stuData.id}
					roomId={roomId}
					setActiveId={setActiveId}
					// refresh={refresh}
					// setRefresh={setRefresh}
					isLoading={isLoading}
					setIsLoading={setIsLoading}
				/>
			))}
			{stuData.approved_pickups.length ? <h4 className="mb-28 font-extrabold">Approved Pickups</h4> : ''}
			{stuData.approved_pickups.map(pickup => {
				return (
					<PickupCard
						key={pickup.id}
						pickup={pickup}
						checkedIn={stuData.checkin_status === 'checkin'}
						studentId={stuData.id}
						roomId={roomId}
						setActiveId={setActiveId}
						// refresh={refresh}
						// setRefresh={setRefresh}
						isLoading={isLoading}
						setIsLoading={setIsLoading}
					/>
				);
			})}
		</div>
	);
}

export default Pickups;
