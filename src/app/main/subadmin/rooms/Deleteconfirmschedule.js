import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import * as Actions from 'app/store/actions';
import { CircularProgress } from '@material-ui/core';
import { deleteSchedule } from 'app/services/rooms/roomsschedules';

function Deleteconfirmschedule({ row, setRefresh, refresh }) {
	const [isRequesting, setIsRequesting] = useState(false);
	const dispatch = useDispatch();
	return (
		<div className="popup">
			<div>
				<div className="icon-span">
					<h2>!</h2>
				</div>
				<h1 className="disable-text">Are you sure you want to delete ?</h1>
				{isRequesting ? (
					<CircularProgress size={35} />
				) : (
					<>
						
						<button
							type="button"
							className="no-disable-btn"
							onClick={() => dispatch(Actions.closeDialog())}
						>
							No
						</button>
						<button
							type="button"
							className="no-disable-btn"
							onClick={() => {
								setIsRequesting(true);
								deleteSchedule(row.id)
									.then(res => {
										setRefresh(!refresh);
										dispatch(
											Actions.showMessage({
												message: res.data.message,
												autoHideDuration: 1500,
												variant: 'success'
											})
										);
										dispatch(Actions.closeDialog());
									})
									.catch(err => {
										dispatch(
											Actions.showMessage({
												message: err.response.data.message,
												variant: 'error'
											})
										);
										dispatch(Actions.closeDialog());
									})
									.finally(() => {
										setIsRequesting(false);
									});
							}}
						>
							Yes
						</button>
					</>
				)}
			</div>
		</div>
	);
}

export default Deleteconfirmschedule;
