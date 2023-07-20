import React, { useEffect, useState } from 'react';
import FuseAnimate from '@fuse/core/FuseAnimate';
import {
	Button,
	TextField,
	CircularProgress,
	FormControl,
	InputLabel,
	Select,
	MenuItem,
	FormHelperText
} from '@material-ui/core';
import history from '@history';
import CustomButton from 'app/customComponents/CustomButton/CustomButton';
import { registerCamera } from 'app/services/liveStreaming/liveStreaming';
import { useDispatch } from 'react-redux';
import * as Actions from 'app/store/actions';
import { getRooms } from 'app/services/rooms/rooms';
import './Live.css';

function CameraRegistration() {
	const dispatch = useDispatch();
	const [errTxts, setErrTxts] = useState({});
	const [form, setForm] = useState({});
	const [isAdding, setIsAdding] = useState(false);
	const [rooms, setRooms] = useState([]);
	const [roomPage, setRoomPage] = useState(1);

	useEffect(() => {
		getRooms('', roomPage)
			.then(res => {
				setRooms([...rooms, ...res.data.data]);
				if (res.data.current_page < res.data.last_page) {
					setRoomPage(roomPage + 1);
				}
			})
			.catch(err => {
				dispatch(
					Actions.showMessage({
						message: 'Failed to get rooms.',
						autoHideDuration: 1500,
						variant: 'error'
					})
				);
			});
	}, [roomPage, dispatch]);

	const handleChange = e => {
		const { name, value } = e.target;
		setErrTxts({ ...errTxts, [name]: '' });
		setForm({ ...form, [name]: value });
	};

	const handleSubmit = ev => {
		setErrTxts({});

		if (!form.camera_mac_address) {
			setErrTxts({ ...errTxts, camera_mac_address: 'This field is required' });
			return;
		}
		if (!form.room_id) {
			setErrTxts({ ...errTxts, room_id: 'This field is required' });
			return;
		}

		if (form) {
			setIsAdding(true);
			registerCamera(form)
				.then(resp => {
					dispatch(
						Actions.showMessage({
							message: resp.data.message,
							autoHideDuration: 1500,
							variant: 'success'
						})
					);
					setIsAdding(false);
					history.goBack();
				})
				.catch(err => {
					if (err.response?.data?.errors) {
						setErrTxts(err.response.data.errors);
						setIsAdding(false);
					} else {
						dispatch(
							Actions.showMessage({
								message: 'Failed to register camera.',
								autoHideDuration: 1500,
								variant: 'error'
							})
						);
						setIsAdding(false);
					}
				})
				.finally(() => setIsAdding(false));
		} else {
			dispatch(
				Actions.showMessage({
					message: 'Failed to register camera.',
					autoHideDuration: 1500,
					variant: 'error'
				})
			);
			setIsAdding(false);
		}
	};

	return (
		<FuseAnimate animation="transition.slideLeftIn" duration={600}>
			<div className="add-camera-div mx-auto">
				<div>
					<div className="flex gap-10">
						<Button
							onClick={() => {
								history.goBack();
							}}
						>
							<img
								alt="Go Back"
								className="cursor-pointer"
								src="assets/images/arrow-long.png"
								style={{ width: '25px' }}
							/>
						</Button>
						<h2 className="font-bold">Camera Registration</h2>
					</div>
					<div className="bg-white rounded form-main-div">
						<div className="form-inner-div">
							<div className="flex-shrink-0 " style={{ marginBottom: '20px' }}>
								<span className="font-bold add-camera-heading">Camera Information</span>
							</div>
							<div className="bg-white rounded mx-auto" style={{ paddingBottom: '70px' }}>
								<div className="grid grid-cols-2" style={{ gap: 40 }}>
									<TextField
										helperText={errTxts.camera_mac_address}
										error={!!errTxts.camera_mac_address}
										onChange={handleChange}
										value={form.camera_mac_address}
										style={{ width: '100%' }}
										name="camera_mac_address"
										label="Camera MAC"
									// placeholder='DC:BB:17:9A:CE:86'
									/>
									<FormControl error={!!errTxts.room_id} style={{ width: '100%' }}>
										<InputLabel id="country_code_label">Room Name</InputLabel>
										<Select
											name="room_id"
											value={form.room_id}
											onChange={handleChange}
											labelId="room_id"
											id="room_id"
										>
											{rooms.length ? (
												rooms.map(room => {
													return (
														<MenuItem key={room.id} value={room.id}>
															<span id={room.id}>{room.name}</span>
														</MenuItem>
													);
												})
											) : (
												<MenuItem>Loading...</MenuItem>
											)}
										</Select>
										{errTxts.room_id && <FormHelperText>{errTxts.room_id}</FormHelperText>}
									</FormControl>
								</div>
							</div>
							<div className="flex justify-center w-max mt-40" style={{ gap: '20px' }}>
								{isAdding ? (
									<div className="flex justify-center">
										<CircularProgress className="mx-auto" />
									</div>
								) : (
									<>
										<CustomButton
											variant="secondary"
											width={140}
											onClick={() => {
												history.goBack();
											}}
										>
											Cancel
										</CustomButton>

										<CustomButton
											variant="primary"
											width={140}
											onClick={() => {
												handleSubmit();
											}}
										>
											Add
										</CustomButton>

									</>
								)}
							</div>
						</div>
					</div>
				</div>
			</div>
		</FuseAnimate>
	);
}

export default CameraRegistration;
