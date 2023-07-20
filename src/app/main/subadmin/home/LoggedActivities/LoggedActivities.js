import { CircularProgress } from '@material-ui/core';
import { getLoggedActivities } from 'app/services/HomeService/homeService';
import React, { useState, useEffect } from 'react';
import CustomButton from 'app/customComponents/CustomButton/CustomButton';
import RoomDetail from './RoomDetail';

function LoggedActivities() {
	const [loggedActivities, setLoggedActivities] = useState([]);
	const [loading, setLoading] = useState(true);
	const [page, setPage] = useState(1);
	const [refresh, setRefresh] = useState(false);
	const [viewAll, setViewAll] = useState(false); // Logged Activity View All State

	useEffect(() => {
		let mounted = true;
		getLoggedActivities(1).then(res => {
			if (mounted) {
				setLoggedActivities(res.data.data);
				setLoading(false);
				if (res.data.current_page < res.data.last_page) {
					setPage(res.data.current_page + 1);
				}
			}
		});

		navigator.serviceWorker.addEventListener('message', handleReceiveNotification);

		return () => {
			mounted = false;
			navigator.serviceWorker.removeEventListener('message', handleReceiveNotification);
		};
	}, [refresh]);

	const handleReceiveNotification = e => {
		if (
			e.data.data.click_action === 'room_wise_reminders' ||
			e.data.data.click_action === 'reminder_dashboard_room_activities' ||
			e.data.data.click_action === 'check_in_out_data_notification'
		) {
			setRefresh(prevState => !prevState);
		}
	};

	useEffect(() => {
		let mounted = true;
		if (page !== 1) {
			getLoggedActivities(1).then(res => {
				if (mounted) {
					setLoggedActivities(res.data.data);
					setLoading(false);
					if (res.data.current_page < res.data.last_page) {
						setPage(res.data.current_page + 1);
					}
				}
			});
		}
		return () => {
			mounted = false;
		};
	}, [page]);

	return (
		<div className="first-div">
			<div className="child-man-div flex justify-between items-end">
				<h4 className="child-hd self-end" style={{ fontWeight: '700' }}>
					Today's Logged Activities
				</h4>
				{!viewAll && loggedActivities.filter(room => room.students_count).length > 5 && (
					<CustomButton
						variant="secondary"
						fontSize="15px"
						style={{
							justifyContent: 'space-evenly',
							display: 'flex',
							alignItems: 'center'
						}}
						onClick={() => setViewAll(true)}
					>
						View all <span className="chevron-right-icon">&#8250;</span>
					</CustomButton>
				)}
			</div>
			<div className="activities-div p-20 py-32 ">
				<div className={`flex flex-col row-gap-32 ${loading && 'items-center justify-center'}`}>
					{loading ? (
						<CircularProgress size={35} />
					) : loggedActivities.filter(room => room.students_count).length ? (
						viewAll ? (
							loggedActivities
								.filter(room => room.students_count)
								.map(loggedActivitie => (
									<RoomDetail
										roomDetail={loggedActivitie}
										refresh={refresh}
										setRefresh={setRefresh}
									/>
								))
						) : (
							loggedActivities
								.filter(room => room.students_count)
								.slice(0, 5)
								.map(loggedActivitie => (
									<RoomDetail
										roomDetail={loggedActivitie}
										refresh={refresh}
										setRefresh={setRefresh}
									/>
								))
						)
					) : (
						<div className="flex justify-center font-semibold">No active rooms available</div>
					)}
				</div>
			</div>
		</div>
	);
}

export default LoggedActivities;
