import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import * as Actions from 'app/store/actions';
import './DisableConfirmDialog.css';
import { updateSchoolStatus } from 'app/services/schools/schools';
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
				<h1 className="disable-text">Are you sure?</h1>
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
								updateSchoolStatus(row.id, { status: row.status ? 0 : 1 })
									.then(() => {
										dispatch(
											Actions.showMessage({
												message: row.status
													? 'School Disabled Successfuly'
													: 'School Enabled Successfuly',
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
												message:
													err?.response?.data?.message || 'Failed to update school status',
												autoHideDuration: 2000,
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

export default DisableConfirmDialog;
