import React from 'react';
import { Avatar, CircularProgress } from '@material-ui/core';
import { useDispatch } from 'react-redux';
import * as Actions from 'app/store/actions';
import { checkIn, checkOut } from 'app/services/students/students';
import CustomButton from 'app/customComponents/CustomButton/CustomButton';

function PickupCard({ pickup, checkedIn, studentId, roomId, isLoading, setActiveId, setIsLoading }) {
	const dispatch = useDispatch();

	const openImage = () => {
		dispatch(
			Actions.openDialog({
				children: (
					<>
						<div className="bg-white">
							<img src={pickup.photo} alt="" />
						</div>
					</>
				)
			})
		);
	};

	const handleCheckInOut = () => {
		setIsLoading(true);
		const data = {
			student_id: [studentId],
			room_id: roomId,
			family_id: pickup.id,
			is_parent: pickup.role === 'parent' ? 1 : 0
		};
		if (!checkedIn) {
			checkIn(data)
				.then(res => {
					setActiveId(0);
					console.log(res);
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
		} else {
			checkOut(data)
				.then(res => {
					console.log(res);
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
							message: err.response?.data?.message
						})
					);
				})
				.finally(() => setIsLoading(false));
		}
	};

	return (
		<div className="my-10 pickup-card p-10 ">
			<div className="flex">
				<Avatar
					style={{ height: '45px', width: '45px', cursor: 'pointer' }}
					alt="Pickup-Profile-Pic"
					className="pickup-profile-img mr-4"
					onClick={() => openImage(pickup.photo)}
					src={pickup.photo}
				/>

				<div className="pickup-info max-w-full text-xs pr-4">
					<h5 className="font-extrabold">{`${pickup.first_name} ${pickup.last_name}`}</h5>
					<p className="pickup-card-email">{pickup.email}</p>
					<h6>{pickup.relation_with_child}</h6>
					<hr />
					<span>
						<i className="fa fa-phone" aria-hidden="true" />
					</span>
					<h3> {pickup.phone}</h3>
				</div>
			</div>
			{!isLoading ? (
				<CustomButton onClick={handleCheckInOut}>{checkedIn ? 'Check Out' : 'Check In'}</CustomButton>
			) : (
				<div>
					<CircularProgress size={25} color="white" />
				</div>
			)}
		</div>
	);
}

export default PickupCard;
