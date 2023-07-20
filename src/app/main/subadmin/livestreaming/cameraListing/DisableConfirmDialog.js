import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import * as Actions from 'app/store/actions';
import './DisableConfirmDialog.css';
import { deleteCamera } from 'app/services/liveStreaming/liveStreaming';
import { CircularProgress } from '@material-ui/core';

function DisableConfirmDialog({ row, setRefresh, refresh }) {
	const [isRequesting, setIsRequesting] = useState(false);
	const dispatch = useDispatch();
	return (
		<div className="popup">
			<div>
				<div className="icon-span">
					<h2>!</h2>
				</div>
				<h1 className="disable-text"> Are you sure you want to disconnect?</h1>
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
								deleteCamera(row.id)
									.then(() => {
										dispatch(
											Actions.showMessage({
												message: 'Camera Deleted Successfully',
												autoHideDuration: 1500,
												variant: 'success'
											})
										);
										setRefresh(!refresh);
										dispatch(Actions.closeDialog());
									})
									.catch(err => {
										dispatch(
											Actions.showMessage({
												message: 'Failed to Delete Camera',
												variant: 'error',
												autoHideDuration: 1500
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

export default DisableConfirmDialog;
