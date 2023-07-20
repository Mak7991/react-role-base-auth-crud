import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import * as Actions from 'app/store/actions';
import { CircularProgress } from '@material-ui/core';
import { deleteEvent } from 'app/services/events/events';

function DeletEventDailog({ row, setRefresh, refresh, setAnchorEl, isEventsLoading, setIsEventsLoading }) {
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
							id="no-delete-event-btn"
							className="no-disable-btn"
							onClick={() => dispatch(Actions.closeDialog())}
						>
							No
						</button>

						<button
							type="button"
							className="no-disable-btn"
							id="yes-delete-event-btn"
							onClick={() => {
								setAnchorEl(null);
								setIsRequesting(true);
								deleteEvent(row.id)
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

export default DeletEventDailog;
