/* eslint-disable consistent-return */
/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/alt-text */
import React, { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import * as Actions from 'app/store/actions';
import {
	FormControl,
	Typography,
	Select,
	MenuItem,
	Avatar,
	InputLabel,
	TextField,
	FormHelperText,
	CircularProgress,
	IconButton
} from '@material-ui/core';
import CustomButton from 'app/customComponents/CustomButton/CustomButton';
import { uploadFile } from 'app/services/imageUpload/imageUpload';
import './parentAnnouncement.css';
import { getParentAnnouncements, postParentAnnouncements } from 'app/services/announcements/ParentAnnouncements';
import { getImageUrl } from 'utils/utils';

function ParentannouncementForm({ selectedRooms, room_all, setCurrentScreen }) {
	const ref = useRef(null);
	const dispatch = useDispatch();
	const [form, setForm] = useState({});
	const [errTxts, setErrTxts] = useState({});
	const [messageTypes, setMessageTypes] = useState([]);
	const [selectedFile, setSelectedFile] = useState(null);
	const [preview, setPreview] = useState(null);
	const roomsToShowWithIcons = selectedRooms.length > 2 ? selectedRooms.slice(0, 2) : selectedRooms;
	const [isLoading, setLoading] = useState(false);

	useEffect(() => {
		getParentAnnouncements()
			.then(({ data }) => {
				setMessageTypes(data);
			})
			.catch(() => {
				dispatch(
					Actions.showMessage({
						message: 'Failed to fetch data.',
						autoHideDuration: 2500,
						variant: 'error'
					})
				);
			});
	}, []);

	const handleChange = ({ target }) => {
		const { name, value } = target;
		setErrTxts({});
		setForm({ ...form, [name]: value });
	};

	useEffect(() => {
		if (!selectedFile) {
			setPreview(null);
			return;
		}
		const objectUrl = URL.createObjectURL(selectedFile);
		setPreview(objectUrl);
		return () => URL.revokeObjectURL(objectUrl);
	}, [selectedFile]);

	function handleFileUpload(e) {
		const file = e.target.files[0];
		if (!file) {
			return;
		}
		const validExtensions = ['pdf', 'jpg', 'jpeg', 'png'];
		const fileExtension = file.name.split('.')[file.name.split('.').length - 1];
		const fileSize = 0.000001 * file.size;
		if (!validExtensions.includes(fileExtension)) {
			dispatch(
				Actions.showMessage({
					message: 'Only images or pdf files are allowed!',
					autoHideDuration: 2500,
					variant: 'error'
				})
			);
			return;
		}
		if (fileSize > 2) {
			dispatch(
				Actions.showMessage({
					message: 'File size cannot exceed 2 MBs',
					autoHideDuration: 2500,
					variant: 'error'
				})
			);
			return;
		}
		setSelectedFile(e.target.files[0]);
	}

	const addform = () => {
		setErrTxts({});

		if (!form.type) {
			setErrTxts({ ...errTxts, type: 'This field is required.' });
			return;
		}
		if (!form.message) {
			setErrTxts({ ...errTxts, message: 'This field is required.' });
			return;
		}
		if (form.message.length < 10) {
			setErrTxts({ ...errTxts, message: 'Announcement cannot be less than 10 characters long!' });
			return;
		}
		if (form.message.length > 1000) {
			setErrTxts({ ...errTxts, message: 'Announcement cannot be more than 1000 characters long!' });
			return;
		}

		form.room_all = room_all ? 1 : 0;
		form.room_id = room_all ? [] : selectedRooms.map(room => room.id);
		setLoading(true);
		if (selectedFile) {
			const filename = getImageUrl(selectedFile);
			uploadFile(selectedFile, filename)
				.then(response => {
					const attachment = `${process.env.REACT_APP_S3_BASE_URL}${response}`;
					form.attachment = attachment;
					const fileExtension = selectedFile.name.split('.')[selectedFile.name.split('.').length - 1];
					if (fileExtension === 'pdf') {
						form.attachment_type = 'pdf';
					} else {
						form.attachment_type = 'image';
					}
					postParentAnnouncements(form)
						.then(res => {
							dispatch(
								Actions.showMessage({
									message: res.data.message,
									autoHideDuration: 2500,
									variant: 'success'
								})
							);
						})
						.catch(err => {
							if (err.response?.data?.message) {
								dispatch(
									Actions.showMessage({
										message: err?.response?.data?.message,
										autoHideDuration: 2500,
										variant: 'error'
									})
								);
							} else {
								dispatch(
									Actions.showMessage({
										message: 'Failed to post announcement',
										autoHideDuration: 2500,
										variant: 'error'
									})
								);
							}
						});
				})
				.catch(err => {
					if (err.response?.data?.message) {
						dispatch(
							Actions.showMessage({
								message: err?.response?.data?.message,
								autoHideDuration: 2500,
								variant: 'error'
							})
						);
					} else {
						dispatch(
							Actions.showMessage({
								message: 'Failed to post announcement',
								autoHideDuration: 2500,
								variant: 'error'
							})
						);
					}
				})
				.finally(() => {
					setLoading(false);
					setCurrentScreen(0);
				});
		} else {
			postParentAnnouncements(form)
				.then(res => {
					dispatch(
						Actions.showMessage({
							message: res.data.message,
							autoHideDuration: 2500,
							variant: 'success'
						})
					);
				})
				.catch(err => {
					if (err.response?.data?.message) {
						dispatch(
							Actions.showMessage({
								message: err?.response?.data?.message,
								autoHideDuration: 2500,
								variant: 'error'
							})
						);
					} else {
						dispatch(
							Actions.showMessage({
								message: 'Failed to post announcement',
								autoHideDuration: 2500,
								variant: 'error'
							})
						);
					}
				})
				.finally(() => {
					setLoading(false);
					setCurrentScreen(0);
				});
		}
	};

	return (
		<div className="m-20">
			<h2 className="font-bold pt-10 pb-10" style={{ fontSize: '20px', fontWeight: '700' }}>
			<span className="">
						<IconButton
							onClick={() => {
								setCurrentScreen(0);
							}}
						>
							<img src="assets/images/arrow-long.png" alt="filter" width="24px" className="backBtn-img" />
						</IconButton>
					</span>
				
				Announcements
			</h2>
			<div className="bg-white rounded mt-12 px-60 pt-32 pb-32">
				<div className="flex flex-row recipients-container items-center">
					<h2 className="font-bold" style={{ paddingRight: '8px', fontSize: '18px' }}>
						Recipients:
					</h2>
					<span>
						{selectedRooms.length > 2 ? (
							<div className="flex flex-row items-center">
								{roomsToShowWithIcons.map((room, key) => {
									return (
										<Avatar
											src={room.thumb}
											key={key}
											style={{
												padding: '0px',
												width: '33px',
												height: '33px',
												marginRight: '2px'
											}}
										/>
									);
								})}
								<span
									className="font-bold"
									style={{ marginLeft: '6px' }}
								>{`${' '} ${selectedRooms.length - 2} other rooms`}</span>
							</div>
						) : (
							<div className="flex flex-row items-center">
								{roomsToShowWithIcons.map((room, key) => {
									return (
										<Avatar
											src={room.thumb}
											key={key}
											style={{
												padding: '0px',
												width: '33px',
												height: '33px'
											}}
										/>
									);
								})}
							</div>
						)}
					</span>
				</div>
				<div className="mt-20 half-width">
					<FormControl fullWidth error={errTxts.type}>
						<InputLabel id="type">Message Type</InputLabel>
						<Select labelId="type" value={form.type} label="type" name="type" onChange={handleChange}>
							{messageTypes.map((types, key) => {
								return (
									<MenuItem key={key} value={types.id}>
										{types.name}
									</MenuItem>
								);
							})}
						</Select>
						<FormHelperText>{errTxts.type}</FormHelperText>
					</FormControl>
				</div>
				<div className="mt-20 half-width">
					<TextField
						label="Type message"
						name="message"
						value={form.message}
						onChange={handleChange}
						error={errTxts.message}
						helperText={errTxts.message}
					/>
				</div>

				<div className="mt-20 relative" style={{ height: '103px' }}>
					<Typography className="file-upload-label">Upload File</Typography>
					{preview ? (
						<>
							{selectedFile &&
							selectedFile.name.split('.')[selectedFile.name.split('.').length - 1] !== 'pdf' ? (
								<>
									<img src={preview} style={{ width: '87px', height: '84px', objectFit: 'cover' }} />
									<div className="cross cross-announcement-img" onClick={() => setSelectedFile(null)}>
										x
									</div>
								</>
							) : (
								<>
									<img
										src="assets/images/pdf_thumbnail.png"
										style={{ width: '87px', height: '84px' }}
									/>
									<div className="cross cross-announcement-pdf" onClick={() => setSelectedFile(null)}>
										x
									</div>
								</>
							)}
						</>
					) : (
						<>
							{' '}
							<img
								src="assets/images/addFile.png"
								alt="Upload file"
								style={{ cursor: 'pointer' }}
								onClick={() => ref.current.click()}
							/>
							<input
								ref={ref}
								style={{ display: 'none' }}
								onChange={handleFileUpload}
								type="file"
								name="file"
								accept=".jpg, .png, .jpeg, .pdf"
							/>
						</>
					)}
				</div>

				{!isLoading ? (
					<div className="mt-10 text-align-center buttons-container" style={{ marginBottom: '10px' }}>
						<span
							style={{
								marginRight: '5px'
							}}
						>
							<CustomButton
								variant="secondary"
								width={140}
								onClick={() => {
									setCurrentScreen(0);
								}}
							>
								Cancel
							</CustomButton>
						</span>
						<CustomButton variant="primary" width="200px" onClick={addform}>
							Send Announcements
						</CustomButton>
					</div>
				) : (
					<div className="flex justify-center my-24">
						<CircularProgress className="mx-auto" />
					</div>
				)}
			</div>
		</div>
	);
}

export default ParentannouncementForm;
