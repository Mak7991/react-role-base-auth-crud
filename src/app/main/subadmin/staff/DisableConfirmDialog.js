import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import * as Actions from 'app/store/actions';
import './DisableConfirmDialog.css';
import { updateStaff } from 'app/services/staff/staff';
import { CircularProgress } from '@material-ui/core';

function DisableConfirmDialog({ row, setRefresh, refresh }) {
	const [isRequesting, setIsRequesting] = useState(false);
	const dispatch = useDispatch();

	const disableStaff = () => {
		setIsRequesting(true);
		const paylaod = {
			status: row.status ? 0 : 1,
			phone: row?.phone
		};
		updateStaff(paylaod, row.id)
			.then(() => {
				dispatch(
					Actions.showMessage({
						message: row.status ? 'Staff Disabled Successfuly' : 'Staff Enabled Successfuly',
						autoHideDuration: 1500,
						variant: 'success',
					})
				);
				setRefresh(!refresh);
				dispatch(Actions.closeDialog());
			})
			.catch((err) => {
				dispatch(
					Actions.showMessage({
						message: 'Failed to Update Staff Status, please refresh',
						autoHideDuration: 1500,
					})
				);
				dispatch(Actions.closeDialog());
			})
			.finally(() => {
				setIsRequesting(false);
			});
	};

	return (
		<div className="popup">
			<div>
				<div className="icon-span">
					<h2>!</h2>
				</div>
				<h1 className="disable-text">
					Are you sure you want to {row.status ? 'disable' : 'enable'} this staff?
				</h1>
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
						<button type="button" className="no-disable-btn" onClick={disableStaff}>
							Yes
						</button>
					</>
				)}
			</div>
		</div>
	);
}

export default DisableConfirmDialog;
