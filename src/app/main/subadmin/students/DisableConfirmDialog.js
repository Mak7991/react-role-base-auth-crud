import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import * as Actions from 'app/store/actions';
import './DisableConfirmDialog.css';
import { updateStudentStatus } from 'app/services/students/students';
import { CircularProgress } from '@material-ui/core';

function DisableConfirmDialog({ row, setRefresh, setHasMore }) {
	const [isRequesting, setIsRequesting] = useState(false);
	const dispatch = useDispatch();
	return (
		<div className="popup">
			<div>
				<div className="icon-span">
					<h2>!</h2>
				</div>
				<h1 className="disable-text">Are you sure you want to {row.status ? 'disable' : 'enable'} it?</h1>
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
								updateStudentStatus({ student_id: row.id, status: row.status ? 0 : 1 })
									.then(() => {
										setHasMore(false);
										dispatch(
											Actions.showMessage({
												message: row.status
													? `${row.first_name} ${row.last_name} is disabled successfully from ladybird academy`
													: `${row.first_name} ${row.last_name} is enabled successfully from ladybird academy`,
												autoHideDuration: 1500,
												variant: 'success',
											})
										);
										setRefresh((prevState) => !prevState);
										dispatch(Actions.closeDialog());
									})
									.catch((err) => {
										dispatch(
											Actions.showMessage({
												message: 'Failed to Update Student Status, please refresh',
												variant: 'error',
												autoHideDuration: 1500,
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
