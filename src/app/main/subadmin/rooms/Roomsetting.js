/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React, { useState, useEffect, useRef } from 'react';
import { TextField, Avatar, CircularProgress, IconButton } from '@material-ui/core/';
import './roomspage.css';
import CustomButton from 'app/customComponents/CustomButton/CustomButton';
import history from '@history';
import { useDispatch } from 'react-redux';
import * as Actions from 'app/store/actions';
import { updateRoom } from 'app/services/rooms/rooms';
import { uploadFile } from 'app/services/imageUpload/imageUpload';
import { HiArrowNarrowLeft } from 'react-icons/hi';
import { useHistory, useLocation } from 'react-router-dom';
import Deleteconfirmdialogue from './Deleteconfirmdialogue';
import { getImageUrl } from 'utils/utils';

function Roomsettings() {
	const dispatch = useDispatch();
	const [errTxts, setErrTxts] = useState({});
	const [isSaving, setIsSaving] = useState(false);
	const { row } = history.location.state;
	const [modifiedRow, setModifiedRow] = useState({
		name: row?.name,
		school_id: row?.school_id,
		thumb: row?.thumb,
		room_type: row?.room_type
	});
	const inputRef = useRef(null);
	const [selectedFile, setSelectedFile] = useState();
	const [preview, setPreview] = useState(row?.thumb);

	const handleChange = (e, index) => {
		const { name, value } = e.target;
		if (name === 'name') {
			setErrTxts({ ...errTxts, sn: '' });
		}
		setModifiedRow({ ...modifiedRow, [name]: value });
	};

	const handledelete = () => {
		dispatch(
			Actions.openDialog({
				children: <Deleteconfirmdialogue row={row} />
			})
		);
	};

	const handleupdate = () => {
		setErrTxts({});

		if (!modifiedRow.name) {
			setErrTxts({ ...errTxts, name: 'This field is required' });
			return;
		}
		if (
			(modifiedRow.name && modifiedRow.name.indexOf(' ') === 0) ||
			modifiedRow.name.lastIndexOf(' ') === modifiedRow.name.length - 1 ||
			/[^a-zA-Z ]/.test(modifiedRow.name)
		) {
			setErrTxts({ ...errTxts, name: 'Please enter a valid name.' });
			return;
		}

		if (selectedFile) {
			const filename = getImageUrl(selectedFile);
			setIsSaving(true);
			uploadFile(selectedFile, filename).then(response => {
				// modifiedRow.photo = `${process.env.REACT_APP_S3_BASE_URL}${response}`;
				modifiedRow.thumb = `${process.env.REACT_APP_S3_BASE_URL}${response}`;
				updateRoom(row?.id, modifiedRow)
					.then(resp => {
						dispatch(
							Actions.showMessage({
								message: resp.data.message,
								autoHideDuration: 1500,
								variant: 'success'
							})
						);
						history.push('/rooms');
					})
					.catch(err => {
						if (err.response?.data?.errors) {
							setErrTxts(err.response.data.errors);
						} else {
							dispatch(
								Actions.showMessage({
									message: 'Failed to edit student information.',
									autoHideDuration: 1500,
									variant: 'error'
								})
							);
						}
					})
					.finally(() => setIsSaving(false));
			});
		} else {
			setIsSaving(true);
			updateRoom(row?.id, modifiedRow)
				.then(resp => {
					dispatch(
						Actions.showMessage({
							message: resp.data.message,
							autoHideDuration: 1500,
							variant: 'success'
						})
					);
					history.push('/rooms');
				})
				.catch(err => {
					if (err.response?.data?.errors) {
						setErrTxts(err.response.data.errors);
					} else {
						dispatch(
							Actions.showMessage({
								message: 'Failed to edit room information.',
								autoHideDuration: 1500,
								variant: 'error'
							})
						);
					}
				})

				.finally(() => setIsSaving(false));
		}
	};

	const onSelectFile = e => {
		if (!e.target.files || e.target.files.length === 0) {
			setSelectedFile(null);
			return;
		}

		setSelectedFile(e.target.files[0]);
	};

	const handleback = () => {
		history.push({ pathname: `/rooms-room/${row?.id}`, state: { row } });
	};

	useEffect(() => {
		if (!selectedFile) {
			setPreview(row?.thumb);
			return;
		}

		const objectUrl = URL.createObjectURL(selectedFile);
		setPreview(objectUrl);

		return () => URL.revokeObjectURL(objectUrl);
	}, [selectedFile]);

	return (
		<div className="room-main mx-auto">
			<div className="flex mx-auto">
				<span className="personal-hd text-2xl font-extrabold mt-32 mb-16">
					<h1 className="" style={{ color: '#06071D',  fontWeight:'700' , fontSize:'20px' }}>
					<span className="">
							<IconButton
								onClick={() => {
									history.goBack();
								}}
							>
								<img
									src="assets/images/arrow-long.png"
									alt="filter"
									width="24px"
									className="backBtn-img"
								/>
							</IconButton>
						</span>
						{row?.room_type == 'room' ? 'Room' : 'Location'} Setting
					</h1>
				</span>
			</div>
			<div className="main-div">
				<span className="div-heading">
					<h2 className="" style={{ color: '#06071D'  , fontWeight:'700' , fontSize:'18px' }}>
						{row?.room_type == 'room' ? 'Room' : 'Location'} Information
					</h2>
				</span>
				<div className="room-infor">
					<div className="pic-room">
						<div
							className="relative pic-upload-overlay cursor-pointer"
							onClick={() => inputRef.current.click()}
						>
							<Avatar style={{ height: '140px', width: '140px' }} src={preview} className="imageupload" />
							<div className="camera-icon">
								<i className="fa fa-2x fa-camera" />
							</div>
							<input
								onChange={onSelectFile}
								type="file"
								name="image"
								id="image"
								className="hidden"
								ref={inputRef}
							/>
						</div>
					</div>
					<div className="room-name" style={{ fontWeight: 'normal' }}>
						<TextField
							// disabled={!isEditing}
							error={!!errTxts.name}
							helperText={errTxts.name}
							className="textarea-input"
							name="name"
							value={modifiedRow.name}
							onChange={handleChange}
							id="room_name"
							label={row?.room_type == 'room' ? 'Room Name' : 'Location Name'}
						/>
					</div>
				</div>
				{!isSaving ? (
					<div className="flex justify-center w-max my-24" style={{ gap: '20px' }}>
						<CustomButton
							variant="primary"
							height="55"
							width="140px"
							id="update-room-btn"
							fontSize="15px"
							onClick={handleupdate}
						>
							{row?.room_type == 'room' ? 'Update Room' : 'Update Location'}
						</CustomButton>
						<CustomButton
							variant="secondary"
							height="55"
							id="delete-room-btn"
							width="140px"
							fontSize="15px"
							onClick={handledelete}
						>
							{row?.room_type == 'room' ? 'Delete Room' : 'Delete Location'}
						</CustomButton>
					</div>
				) : (
					<div className="flex justify-center">
						<CircularProgress className="mx-auto" />
					</div>
				)}
			</div>
		</div>
	);
}

export default Roomsettings;
