import { Avatar, CircularProgress } from '@material-ui/core';
import CustomButton from 'app/customComponents/CustomButton/CustomButton';
import { remindStaff } from 'app/services/HomeService/homeService';
import history from '@history';
import React, { useState } from 'react';
import './room-detail.css';

function RoomDetail({ roomDetail, refresh, setRefresh }) {
	const [loading, setLoading] = useState(false);

	const handleClick = () => {
		if (roomDetail.is_enable_activites_reminder) {
			setLoading(true);
			remindStaff(roomDetail.id)
				.then(() => {
					setRefresh(!refresh);
				})
				.finally(() => {
					setTimeout(() => {
						setLoading(false);
					}, 1000);
				});
		} else {
			history.push('/reports-activity', { room: roomDetail.id, date: new Date().toISOString().split('T')[0] });
		}
	};
	return (
		<div className="flex col-gap-16">
			<div className="acitivty-count-wrapper">
				<div className="activity-count flex flex-col items-center">
					<div className="text-2xl font-bold">{roomDetail.total_activity_count}</div>
					<div className="font-semibold text-black">Activities</div>
				</div>
			</div>
			<div className="flex flex-col flex-grow row-gap-16 mt-8">
				<div className="flex text-lg font-bold col-gap-4">
					<Avatar src={roomDetail.photo} style={{ width: 30, height: 30 }} />
					<div>{roomDetail.name}</div>
				</div>
				<hr color="lightgray" />
				{roomDetail.show_student_label ? (
					<div className="flex items-center col-gap-4">
						{roomDetail.student_needs_activity === 0 ? (
							<Avatar src="assets/images/tick-icon.png" style={{ width: 30, height: 30 }} />
						) : (
							<Avatar src="assets/images/icon.png" style={{ width: 30, height: 30 }} />
						)}
						<div className="flex items-center col-gap-4">
							{roomDetail.student_needs_activity === 0 ? (
								<>
									<span className="font-semibold" style={{ color: '#13A594' }}>
										All students
									</span>
									<div>have activities logged</div>
								</>
							) : (
								<>
									<span className="text-red-900 font-semibold">
										{roomDetail.student_needs_activity} students
									</span>
									<div>need activities logged</div>
								</>
							)}
						</div>
					</div>
				) : (
					''
				)}
				<div className="flex justify-between items-center">
					<div className="flex justify-between shrink col-gap-16">
						{roomDetail.activity_count_data.map(item =>
							item.activity_id in roomDetail.activity_data ? (
								<div key={item.activity_id} className="activity-counts flex col-gap-2 items-center">
									<img
										// width={25}
										src={
											item.activity_id === 1
												? 'assets/images/diaper.png'
												: item.activity_id === 3
												? 'assets/images/nap.png'
												: 'assets/images/post.png'
										}
										alt="img"
									/>
									{`${item.total} ${roomDetail.activity_data[item.activity_id]?.name || ''}`}
								</div>
							) : (
								''
							)
						)}
					</div>
					<div>
						{loading ? (
							<div className="flex justify-between">
								<CircularProgress size={35} />
							</div>
						) : (
							<CustomButton
								width={115}
								variant={!roomDetail.is_enable_activites_reminder ? 'secondary' : 'primary'}
								onClick={handleClick}
							>
								{!roomDetail.is_enable_activites_reminder ? 'View Details' : 'Remind Staff'}
							</CustomButton>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}

export default RoomDetail;
