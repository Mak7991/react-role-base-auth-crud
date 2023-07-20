/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable consistent-return */
import React, { useState, useEffect, useRef } from 'react';
import { TextField, Avatar, CircularProgress, IconButton } from '@material-ui/core/';
import './roomspage.css';
import CustomButton from 'app/customComponents/CustomButton/CustomButton';
import history from '@history';
import { createRoom } from 'app/services/rooms/rooms';
import { uploadFile } from 'app/services/imageUpload/imageUpload';
import { useDispatch, useSelector } from 'react-redux';
import * as Actions from 'app/store/actions';
import { getImageUrl } from 'utils/utils';

function AddLocation() {
	const dispatch = useDispatch();
	const user = useSelector(({ auth }) => auth.user);
	console.log(user);
	const [form, setForm] = useState({});
	const [errTxts, setErrTxts] = useState({});
	const [isAdding, setIsAdding] = useState(false);
	const [selectedFile, setSelectedFile] = useState(null);
	const [preview, setPreview] = useState();
	const [schoolId, setSchoolId] = useState(null);
	const inputRef = useRef(null);

	useEffect(() => {
		if (!selectedFile) {
			setPreview(undefined);
			return;
		}

		const objectUrl = URL.createObjectURL(selectedFile);
		setPreview(objectUrl);

		return () => URL.revokeObjectURL(objectUrl);
	}, [selectedFile]);

	const onSelectFile = e => {
		if (!e.target.files || e.target.files.length === 0) {
			setSelectedFile(undefined);
			return;
		}

		setSelectedFile(e.target.files[0]);
	};

	const handleChange = e => {
		const { name, value } = e.target;
		setErrTxts({ ...errTxts, [name]: '' });
		setForm({ ...form, [name]: value });
	};

	const handleSubmit = () => {
		setErrTxts({});
		if (!form.name) {
			setErrTxts({ ...errTxts, name: 'This field is required' });
			return;
		}
		if (
			(form.name && form.name.indexOf(' ') === 0) ||
			form.name.lastIndexOf(' ') === form.name.length - 1 ||
			/[^a-zA-Z ]/.test(form.name)
		) {
			setErrTxts({ ...errTxts, name: 'Please enter a valid name.' });
			return;
		}

		form.school_id = user.school?.id || user.data?.school?.id;
		form.room_type = 'place';
		if (selectedFile) {
			const filename = getImageUrl(selectedFile);
			setIsAdding(true);
			uploadFile(selectedFile, filename).then(response => {
				// form.photo = `${process.env.REACT_APP_S3_BASE_URL}${response}`;
				form.name = form.name.trim();
				form.thumb = `${process.env.REACT_APP_S3_BASE_URL}${response}`;
				createRoom(form)
					.then(resp => {
						dispatch(
							Actions.showMessage({
								message: resp.data.message,
								autoHideDuration: 1500,
								variant: 'success'
							})
						);
						history.goBack();
					})
					.catch(err => {
						if (err.response?.data?.errors) {
							setErrTxts(err.response.data.errors);
						} else {
							dispatch(
								Actions.showMessage({
									message: 'Failed to add Room.',
									autoHideDuration: 1500,
									variant: 'error'
								})
							);
						}
					})
					.finally(() => setIsAdding(false));
			});
		} else {
			setIsAdding(true);
			form.name = form.name.trim();
			form.thumb = `${
				process.env.REACT_APP_S3_BASE_URL
			}${'public/images/front/2021-12-23_12_02_58_room.jpeg'}`;
			createRoom(form)
				.then(resp => {
					dispatch(
						Actions.showMessage({
							message: resp.data.message,
							autoHideDuration: 1500,
							variant: 'success'
						})
					);
					history.goBack();
				})
				.catch(err => {
					if (err.response?.data?.errors) {
						setErrTxts(err.response.data.errors);
					} else {
						dispatch(
							Actions.showMessage({
								message: 'Failed to add room.',
								autoHideDuration: 1500,
								variant: 'error'
							})
						);
					}
				})
				.catch(err => {
					if (err.response?.data?.errors) {
						setErrTxts(err.response.data.errors);
					} else {
						dispatch(
							Actions.showMessage({
								message: 'Failed to add room.',
								autoHideDuration: 1500,
								variant: 'error'
							})
						);
					}
				})
				.finally(() => setIsAdding(false));
		}
	};

	return (
		<div className="room-main mx-auto">
			<div className="flex mx-auto">
				<span className="personal-hd text-2xl font-extrabold mt-32 mb-16">
				<h1 className="" style={{ color: '#06071D'  , fontWeight:'700' , fontSize:'20px' }}>
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
						Add Location
					</h1>
				</span>
			</div>
			<div className="main-div">
				<span className="div-heading">
				<h2 className="" style={{ color: '#06071D'  , fontWeight:'700' , fontSize:'18px' }}>
						Location Information
					</h2>
				</span>
				<div className="room-infor">
					<div className="pic-room">
						<div
							id="upload-room-img"
							className="relative pic-upload-overlay cursor-pointer"
							onClick={() => inputRef.current.click()}
						>
							<Avatar style={{ height: '120px', width: '120px' }} src={preview} />
							<div className="camera-icon ">
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
							id="room"
							name="name"
							onChange={handleChange}
							label="Location Name"
							className="textarea-input"
							error={!!errTxts.name}
							helperText={errTxts.name}
						/>

						{/* <h4>room name</h4>
						<h5>{row.name}</h5> */}
					</div>
				</div>

				{isAdding ? (
					<div className="flex justify-center my-24">
						<CircularProgress className="mx-auto" />
					</div>
				) : (
					<div className="flex justify-center w-max my-24" style={{ gap: '20px' }}>

<CustomButton
							id="cancel"
							variant="secondary"
							height="55"
							width="140px"
							fontSize="15px"
							onClick={() => {
								history.goBack();
							}}
						>
							Cancel
						</CustomButton>



						<CustomButton
							id="add-room"
							variant="primary"
							height="55"
							width="140px"
							fontSize="15px"
							onClick={() => {
								handleSubmit();
							}}
						>
							Submit
						</CustomButton>
			
					</div>
				)}
			</div>
		</div>
	);
}

export default AddLocation;
