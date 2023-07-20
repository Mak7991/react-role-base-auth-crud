import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import * as Actions from 'app/store/actions';
import { CircularProgress } from '@material-ui/core';
import { delConversation } from 'app/services/messages/messages';

function DeleteChatConfirm({ setRefresh, refresh, setIsDeletingConvo, msgId, key }) {
	const [isRequesting, setIsRequesting] = useState(false);
	const dispatch = useDispatch();
	return (
		<div className="popup">
			<div>
				<div className="icon-span">
					<h2>!</h2>
				</div>
				<h1 className="disable-text">Are you sure you want to delete the messages?</h1>
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
								delConversation(msgId)
									.then((res) => {
										setRefresh((prevState) => {
											return !prevState;
										});
										dispatch(
											Actions.showMessage({
												message: 'Conversation deleted successfully',
												variant: 'success',
											})
										);
									})
									.catch((err) => {
										console.log(err);
										dispatch(
											Actions.showMessage({
												message: 'Failed to delete conversation',
												variant: 'error',
											})
										);
									})
									.finally(() => {
										setIsRequesting(false);
										dispatch(Actions.closeDialog());
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

export default DeleteChatConfirm;
