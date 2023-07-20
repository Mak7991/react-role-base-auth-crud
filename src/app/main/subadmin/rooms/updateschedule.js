/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable consistent-return */
import React, { useState, useEffect, useRef } from 'react';
import { TextField, CircularProgress, Avatar, InputAdornment, IconButton } from '@material-ui/core/';
import './roomspage.css';
import CustomButton from 'app/customComponents/CustomButton/CustomButton';
import { useDispatch } from 'react-redux';
import history from '@history';
import * as Actions from 'app/store/actions';
import { updateschedule } from 'app/services/rooms/roomsschedules';
import { uploadFile } from 'app/services/imageUpload/imageUpload';
import CustomTimePicker from 'app/customComponents/CustomTimePicker/CustomTimePicker';
import { getImageUrl } from 'utils/utils';

function Updateschedulee() {
	const dispatch = useDispatch();
	const [form, setForm] = useState(history.location.state.row);
	const [errTxts, setErrTxts] = useState({});
	const [isLoading, setIsLoading] = useState(false);
	const [selectedFile, setSelectedFile] = useState();
	const inputRef = useRef(null);
	const [preview, setPreview] = useState(history.location.state.row.thumb);
	const { row } = history.location.state;

	const [startTime, setStartTime] = useState(
		new Date('', '', '', Number(form.start_time.split(':')[0]), Number(form.start_time.split(':')[1]))
	);
	const [endTime, setEndTime] = useState(
		new Date('', '', '', Number(form.end_time.split(':')[0]), Number(form.end_time.split(':')[1]))
	);
	const { id } = history.location.state.row;

	const handleChange = (ev) => {
		const { name, value } = ev.target;
		setErrTxts({ ...errTxts, [name]: '' });
		setForm({ ...form, [name]: value });
	};

	const handleTimeChange = (value, name) => {
		setErrTxts({ ...errTxts, [name]: '' });
		setForm({ ...form, [name]: value });
	};

	//
	useEffect(() => {
		if (!selectedFile) {
			setPreview(history.location.state.row.thumb);
			return;
		}

		const objectUrl = URL.createObjectURL(selectedFile);
		setPreview(objectUrl);

		return () => URL.revokeObjectURL(objectUrl);
	}, [selectedFile]);

	const onSelectFile = (e) => {
		if (!e.target.files || e.target.files.length === 0) {
			setSelectedFile(null);
			return;
		}

		setSelectedFile(e.target.files[0]);
	};

	const handleSubmit = () => {
		setErrTxts({});
		if (!form.start_time) {
			setErrTxts({ ...errTxts, start_time: 'This field is required' });
			return;
		}
		if (form.start_time < '06:00') {
			setErrTxts({ ...errTxts, start_time: 'Start time should be greater than 06:00 AM' });
			return;
		}
		if (form.start_time > '19:00') {
			setErrTxts({ ...errTxts, start_time: 'Start time should be less than 07:00 PM' });
			return;
		}
		if (!form.end_time) {
			setErrTxts({ ...errTxts, end_time: 'This field is required' });
			return;
		}
		if (form.start_time > form.end_time) {
			setErrTxts({ ...errTxts, end_time: 'End time should be greater than start time' });
			return;
		}
		if (form.end_time < '06:00') {
			setErrTxts({ ...errTxts, end_time: 'End time should be greater than 06:00' });
			return;
		}
		if (form.end_time > '19:00') {
			setErrTxts({ ...errTxts, end_time: 'End time should be less than 19:00' });
			return;
		}
		if (form.end_time < form.start_time) {
			setErrTxts({ ...errTxts, end_time: 'End time should be greater than start time' });
			return;
		}
		if (!form.subject) {
			setErrTxts({ ...errTxts, subject: 'This field is required' });
			return;
		}
		if (form.subject.charAt(0) === ' ' || form.subject.charAt(form.subject.length - 1) === ' ') {
			setErrTxts({ ...errTxts, subject: 'Please enter a valid subject' });
			return;
		}
		if (form.subject && /[^a-zA-Z ]/.test(form.subject)) {
			setErrTxts({ ...errTxts, subject: 'Please enter a valid subject' });
			return;
		}
		if (form.type && /[^a-zA-Z ,]/.test(form.type)) {
			setErrTxts({ ...errTxts, type: 'Please enter a valid activity type' });
			return;
		}
		if (form.type.charAt(0) === ' ' || form.type.charAt(form.type.length - 1) === ' ') {
			setErrTxts({ ...errTxts, type: 'Please enter a valid subject' });
			return;
		}

		const data = JSON.parse(JSON.stringify(form));

		if (selectedFile) {
			const filename = getImageUrl(selectedFile)
			setIsLoading(true);
			uploadFile(selectedFile, filename).then((response) => {
				// data.photo = `${process.env.REACT_APP_S3_BASE_URL}${response}`;
				data.thumb = `${process.env.REACT_APP_S3_BASE_URL}${response}`;
				data.is_default_image = false;
				updateschedule(data, row.id)
					.then((resp) => {
						dispatch(
							Actions.showMessage({
								message: resp.data.message,
								autoHideDuration: 1500,
								variant: 'success',
							})
						);
						history.goBack();
					})
					.catch((err) => {
						if (err.response?.data?.errors) {
							setErrTxts(err.response.data.errors);
						} else {
							dispatch(
								Actions.showMessage({
									message: err.response.data.message,
									autoHideDuration: 1500,
									variant: 'error',
								})
							);
						}
					})
					.finally(() => setIsLoading(false));
			});
		} else {
			setIsLoading(true);
			if (form.is_default_image === true) {
				form.thumb = null;
				form.is_default_image = true;
			}
			updateschedule(form, id)
				.then((resp) => {
					dispatch(
						Actions.showMessage({
							message: resp.data.message,
							autoHideDuration: 1500,
							variant: 'success',
						})
					);
					history.goBack();
				})
				.catch((err) => {
					if (err.response?.data?.errors) {
						setErrTxts(err.response.data.errors);
					} else {
						dispatch(
							Actions.showMessage({
								message: err.response.data.message,
								autoHideDuration: 1500,
								variant: 'error',
							})
						);
					}
				})
				.finally(() => setIsLoading(false));
		}
	};
	return (
		<div className="room-main mx-auto">
			<div className="flex mx-auto">
				<span className="personal-hd text-2xl font-extrabold mt-32 mb-16">
					<h1 className="" style={{ color: '#06071D', fontWeight: '700', fontSize: '20px' }}>
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
						Edit Schedules
					</h1>
				</span>
			</div>
			<div className="main-div add-div">
				<span className="div-heading">
					<h2 className="" style={{ color: '#06071D', fontWeight: '700', fontSize: '18px' }}>
						Schedules Information
					</h2>
				</span>

				<div className="addscheduleform">
					<div className="grid grid-cols-2 mt-32" style={{ gap: 40 }}>
						<span className="insert-form margin-bottom">
							<CustomTimePicker
								value={startTime}
								setValue={setStartTime}
								width="91%"
								disabled={false}
								label="Start Time"
								errTxts={errTxts}
								name="start_time"
								handleTimeChange={handleTimeChange}
							/>
						</span>
						<span className="insert-form margin-bottom">
							<CustomTimePicker
								value={endTime}
								setValue={setEndTime}
								width="91%"
								disabled={false}
								label="End Time"
								errTxts={errTxts}
								name="end_time"
								handleTimeChange={handleTimeChange}
							/>
						</span>
						<span className="insert-form margin-bottom input-subject">
							<TextField
								name="subject"
								onChange={handleChange}
								value={form.subject}
								label="Subject"
								error={!!errTxts.subject}
								helperText={errTxts.subject}
								className="w-11/12 "
								InputProps={{
									endAdornment: (
										<InputAdornment>
											<div
												className="row-span-2"
												style={{
													justifySelf: 'center',
													marginBottom: '2px',
													paddingLeft: '10px',
												}}
											>
												{preview ? (
													<>
														<Avatar
															src={preview}
															style={{ width: 30, height: 30, marginBottom: '10px' }}
														/>
														<div
															className="cross"
															onClick={() => {
																setPreview(null);
																setForm({
																	...form,
																	thumb: null,
																	is_default_image: true,
																});
															}}
														>
															x
														</div>
													</>
												) : (
													<>
														<input
															onChange={onSelectFile}
															type="file"
															name="image"
															id="image"
															className="hidden"
															ref={inputRef}
														/>
														<button
															onClick={() => inputRef.current.click()}
															type="button"
															className="btn-image"
														>
															upload image
														</button>
													</>
												)}
											</div>
										</InputAdornment>
									),
								}}
							/>
						</span>
						<span className="insert-form margin-bottom">
							<TextField
								name="type"
								value={form.type}
								onChange={handleChange}
								label="Activity Type"
								className="w-11/12"
								error={!!errTxts.type}
								helperText={errTxts.type}
							/>
						</span>
					</div>
				</div>

				{isLoading ? (
					<div className="flex justify-center my-24">
						<CircularProgress className="mx-auto" />
					</div>
				) : (
					<div className="flex justify-center w-max my-24" style={{ gap: '20px' }}>
						<CustomButton
							variant="secondary"
							width="140px"
							fontSize="15px"
							onClick={() => {
								history.goBack();
							}}
						>
							Cancel
						</CustomButton>
						<CustomButton
							variant="primary"
							width="140px"
							fontSize="15px"
							onClick={() => {
								handleSubmit();
							}}
						>
							Update
						</CustomButton>
					</div>
				)}
			</div>
		</div>
	);
}

export default Updateschedulee;
