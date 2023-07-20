import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import * as Actions from 'app/store/actions';
// import './DisableConfirmDialog.css';
import { CircularProgress } from '@material-ui/core';
import history from '@history';
import { deleteRoom } from 'app/services/rooms/rooms';

function Deleteconfirmdialogue({ row, setRefresh, refresh }) {
	const [isRequesting, setIsRequesting] = useState(false);
	const dispatch = useDispatch();
	return (
		<div className="popup">
			<div>
				<div className="icon-span">
					<h2>!</h2>
				</div>
				<h1 className="disable-text">Are you sure you want to delete the room ?</h1>
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
								deleteRoom(row.id)
									.then(res => {
										dispatch(
											Actions.showMessage({
												message: res.data.message,
												autoHideDuration: 1500,
												variant: 'success'
											})
										);
										history.push('/rooms');
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

export default Deleteconfirmdialogue;
