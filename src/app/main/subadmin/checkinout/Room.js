import FusePageSimple from '@fuse/core/FusePageSimple';
import { makeStyles } from '@material-ui/core/styles';
import React, { useEffect, useRef, useState } from 'react';
import history from '@history';
import { getPickups } from 'app/services/students/students';
import { CircularProgress } from '@material-ui/core';
import { useParams } from 'react-router';
import StudentTable from './StudentTable';
import Pickups from './Pickups';
import { useDispatch } from 'react-redux';
import * as Actions from 'app/store/actions/';

const useStyles = makeStyles({
	layoutRoot: {},
});

function Room() {
	const dispatch = useDispatch();
	const classes = useStyles();
	const pageLayout = useRef(null);
	const [row] = useState(history?.location?.state);
	const [activeId, setActiveId] = useState(null);
	const [stuData, setStuData] = useState([]);
	const [isLoading, setIsLoading] = useState(false);
	const [refresh, setRefresh] = useState(false);
	const { id } = useParams();

	useEffect(() => {
		if (!id) {
			history.goBack();
		}
	}, [id]);

	useEffect(() => {
		if (activeId) {
			setIsLoading(true);
			getPickups(activeId)
				.then((res) => {
					res.data.parents = res.data.parents.filter((family) => family.can_pickup);
					res.data.approved_pickups = res.data.approved_pickups.filter((family) => family.can_pickup);
					setStuData(res.data);
				})
				.catch((err) => {
					if (err.response.status === 404) {
						history.push('/checkinout');
					}
					dispatch(
						Actions.showMessage({
							message: 'The contact does not exist',
							variant: 'error',
						})
					);
					setIsLoading(false);
				})
				.finally(() => {
					setIsLoading(false);
				});
		}
	}, [activeId]);

	useEffect(() => {
		navigator.serviceWorker.addEventListener('message', handleReceiveNotification);
		return () => {
			navigator.serviceWorker.removeEventListener('message', handleReceiveNotification);
		};
	}, []);

	const handleReceiveNotification = (e) => {
		if (e.data.data.click_action === 'check_in_out_data_notification') {
			setRefresh((prevState) => !prevState);
		}
	};
	return (
		<FusePageSimple
			classes={{
				root: classes.layoutRoot,
			}}
			content={
				<div className="room-bg-1">
					<StudentTable row={row} setActiveId={setActiveId} activeId={activeId} refresh={refresh} />
				</div>
			}
			rightSidebarContent={
				activeId && (
					<div className="p-16 pl-14 mt-36 room-bg-2 mb-64">
						{isLoading && (
							<div className="w-1/4 mx-auto">
								<CircularProgress size={25} />
							</div>
						)}
						{!isLoading && (
							<Pickups
								stuData={stuData}
								roomId={id}
								setActiveId={setActiveId}
								// refresh={refresh}
								// setRefresh={setRefresh}
							/>
						)}
					</div>
				)
			}
			innerScroll
			ref={pageLayout}
		/>
	);
}

export default Room;
