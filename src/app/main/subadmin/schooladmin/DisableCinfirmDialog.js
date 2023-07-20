import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import * as Actions from 'app/store/actions';
import './DisableCinfirmDialog.css';
import { updateSubAdmin } from 'app/services/subSchoolAdmin/SubSchoolAdmin';
import { CircularProgress } from '@material-ui/core';

function DisableConfirmDialog({ row, setRefresh, refresh }) {
	const [isRequesting, setIsRequesting] = useState(false);
	const dispatch = useDispatch();

	const disablesubAdmin = () => {
		setIsRequesting(true);
		const data = {
			acitvate_status: row.status ? 0 : 1
		};
		updateSubAdmin(data, row?.id)
			.then(() => {
				dispatch(
					Actions.showMessage({
						message: `Sub Admin ${row.status ? 'Disabled' : 'Enabled'} Successfuly`,
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
						message: 'Failed to Update Sub Admin Status, please refresh',
						autoHideDuration: 1500
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
				Are you sure you want to {row.status ? 'disable' : 'enable'} this sub Admin?
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
						<button type="button" className="no-disable-btn" onClick={disablesubAdmin}>
							Yes
						</button>
					</>
				)}
			</div>
		</div>
	);
}

export default DisableConfirmDialog;
