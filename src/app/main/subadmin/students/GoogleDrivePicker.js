import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import * as Actions from 'app/store/actions';
import axios from 'axios';
import FileValidator from './FileValidator';
import useDrivePicker from 'react-google-drive-picker';
import ProcareValidator from './ProcareValidator';
function GoogleDrivePicker({ children, rooms, handleClose, roster_type }) {
	const dispatch = useDispatch();
	const [openPicker, authResponse] = useDrivePicker();
	// const [token, setToken] = useState();
	let fileId = '';
	// The Client ID obtained from the Google API Console. Replace with your own Client ID.
	const clientId = process.env.REACT_APP_GCP_CLIENT_ID;
	const apiKey = process.env.REACT_APP_GOOGLE_API_ENDPOINT;
	// Scope to use to access user's Drive items.
	const scopes = ['https://www.googleapis.com/auth/drive.file'];

	const handleOpenPicker = () => {
		const client = window.google.accounts.oauth2.initTokenClient({
			client_id: clientId,
			scope: scopes.join(','),
			callback: (tokenResponse) => {
				console.log(tokenResponse);
				handleClose();
				openPicker({
					clientId,
					developerKey: apiKey,
					viewId: 'SPREADSHEETS',
					token: tokenResponse.access_token, // pass oauth token in case you already have one
					// showUploadView: true,
					showUploadFolders: true,
					customScopes: scopes,
					supportDrives: true,
					// multiselect: true,
					// customViews: customViewsArray, // custom view
					callbackFunction: (data) => pickerCallback(data, tokenResponse.access_token),
				});
			},
		});

		client.requestAccessToken();
	};

	// A simple callback implementation.
	function pickerCallback(data, access_token) {
		console.log(data);
		if (data.action === 'picked') {
			const validExtensions = roster_type === 'procare' ? ['csv'] : ['xlsx', 'xls'];
			if (!validExtensions.includes(data.docs[0].name.split('.')[1])) {
				dispatch(
					Actions.showMessage({
						message: 'Only excel files are allowed!',
						autoHideDuration: 2500,
						variant: 'error',
					})
				);
				return;
			}
			fileId = data.docs[0].id;
			axios
				.get(`https://www.googleapis.com/drive/v2/files/${fileId}`, {
					headers: { Authorization: `Bearer ${access_token}` },
				})
				.then((res) => {
					fetch(res.data.downloadUrl, {
						headers: { Authorization: `Bearer ${access_token}` },
					})
						.then((resp) => resp.blob())
						.then((blob) => {
							dispatch(
								Actions.openDialog({
									children:
										roster_type === 'procare' ? (
											<ProcareValidator
												file={blob}
												type="local"
												rooms={rooms}
												roster_type={roster_type}
											/>
										) : (
											<FileValidator
												file={blob}
												type="local"
												rooms={rooms}
												roster_type={roster_type}
											/>
										),

									maxWidth: 'md',
								})
							);
						});
				})
				.catch((err) => {
					console.log(err);
				});
		}
	}
	return (
		<div>
			<button type="button" onClick={handleOpenPicker}>
				{children}
			</button>
		</div>
	);
}

export default GoogleDrivePicker;
