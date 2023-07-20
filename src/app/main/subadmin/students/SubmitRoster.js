/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React, { useState, useEffect, useRef } from 'react';
import './Students.css';
import {
	Table,
	TableHead,
	TableBody,
	TableCell,
	TableContainer,
	TableRow,
	Paper,
	CircularProgress,
	Dialog,
	DialogContent,
	IconButton,
	makeStyles,
	Select,
	MenuItem,
	InputLabel,
	FormControl,
	FormHelperText,
} from '@material-ui/core';
import Dropzone from 'react-dropzone';
import * as Actions from 'app/store/actions';
import FuseAnimate from '@fuse/core/FuseAnimate';
import { getAllRooms, getRosterTypes } from 'app/services/rooms/rooms';
import { useDispatch } from 'react-redux';
import CustomButton from 'app/customComponents/CustomButton/CustomButton';
import DropboxChooser from 'react-dropbox-chooser';
import CloseIcon from '@material-ui/icons/Close';
import history from '@history';
import FuseScrollbars from '@fuse/core/FuseScrollbars';
import FileValidator from './FileValidator';
import GoogleDrivePicker from './GoogleDrivePicker';
import ProcareValidator from './ProcareValidator';

const useStyles = makeStyles({
	content: {
		position: 'relative',
		display: 'flex',
		overflow: 'auto',
		flex: '1 1 auto',
		flexDirection: 'column',
		width: '100%',
		'-webkit-overflow-scrolling': 'touch',
		zIndex: 2,
	},
});

function SubmitRoster() {
	const classes = useStyles();
	const dispatch = useDispatch();
	const inputRef = useRef(null);
	const [open, setOpen] = useState(false);
	const [selectedFile, setSelectedFile] = useState();
	const [isAdding, setIsAdding] = useState(false);
	const [rooms, setRooms] = useState([]);
	const [rosterTypes, setRosterTypes] = useState([]);
	const [rosterType, setRosterType] = useState('');
	const [rosterErr, setRosterErr] = useState('');

	const handleClickOpen = () => {
		if (rosterType) {
			setOpen(true);
		} else {
			setRosterErr('Required');
		}
	};

	const handleClose = () => {
		setOpen(false);
	};

	useEffect(() => {
		getAllRooms().then((res) => {
			setRooms(res.data.map((room) => room.name));
		});
		getRosterTypes().then((res) => {
			setRosterTypes(res.data.data);
		});
	}, []);

	const DropBoxSubmit = (file) => {
		if (file) {
			const today = new Date();
			setIsAdding(true);
			const type = 'drop_box';
			const { link } = file;
			fetch('https://content.dropboxapi.com/2/sharing/get_shared_link_file', {
				headers: {
					Authorization: `Bearer ${process.env.REACT_APP_DROPBOX_API_TOKEN}`,
					'Dropbox-API-Arg': JSON.stringify({ url: link }),
				},
				method: 'POST',
			})
				.then((res) => res.blob())
				.then((blob) => {
					setOpen(false);
					dispatch(
						Actions.openDialog({
							children:
								rosterType === 'procare' ? (
									<ProcareValidator file={file} type="local" rooms={rooms} />
								) : (
									<FileValidator file={file} type="local" rooms={rooms} />
								),
							maxWidth: 'md',
						})
					);
				})
				.catch((err) => console.log({ ...err }));
		} else {
			dispatch(
				Actions.showMessage({
					message: 'Failed to Post File.',
					autoHideDuration: 1500,
					variant: 'error',
				}),
				setOpen(false)
			);
		}
	};

	const handleSubmit = (file) => {
		if (file) {
			const validExtensions = rosterType === 'procare' ? ['csv'] : ['xlsx', 'xls'];
			if (!validExtensions.includes(file.name.split('.')[1])) {
				dispatch(
					Actions.showMessage({
						message: 'Only excel files are allowed!',
						autoHideDuration: 2500,
						variant: 'error',
					})
				);
				return;
			}
			setOpen(false);
			dispatch(
				Actions.openDialog({
					children:
						rosterType === 'procare' ? (
							<ProcareValidator file={file} type="local" rooms={rooms} />
						) : (
							<FileValidator file={file} type="local" rooms={rooms} />
						),
					maxWidth: 'md',
				})
			);
		} else {
			dispatch(
				Actions.showMessage({
					message: 'Failed to Post File.',
					autoHideDuration: 2000,
					variant: 'error',
				}),
				setOpen(false)
			);
		}
	};

	const onSelectFile = (e) => {
		if (!e.target.files || e.target.files.length === 0) {
			setSelectedFile(undefined);
			return;
		}
		setSelectedFile(e.target.files[0].name);
		handleSubmit(e.target.files[0]);
	};

	const handleDropFile = (file) => {
		if (!file[0]) {
			setSelectedFile(undefined);
			return;
		}
		setSelectedFile(file[0]);
		handleSubmit(file[0]);
	};

	const selectDropBox = (files) => {
		setSelectedFile(files[0]);
		DropBoxSubmit(files[0]);
	};

	function launchOneDrivePicker() {
		const odOptions = {
			clientId: process.env.REACT_APP_AZURE_CLIENT_ID,
			action: 'download',
			multiSelect: false,
			advanced: {
				redirectUri: `https://${
					process.env.REACT_APP_ENV !== 'production' ? `${process.env.REACT_APP_ENV}` : 'admin'
				}.perfectdaylive.com/students-submitroster`,
			},
			success: (file) => {
				if (file) {
					const validExtensions = rosterType === 'procare' ? ['csv'] : ['xlsx', 'xls'];
					if (!validExtensions.includes(file.value[0].name.split('.')[1])) {
						dispatch(
							Actions.showMessage({
								message: 'Only excel files are allowed!',
								autoHideDuration: 2500,
								variant: 'error',
							})
						);
						return;
					}
					fetch(file.value[0]['@microsoft.graph.downloadUrl'])
						.then((res) => res.blob())
						.then((blob) => {
							setOpen(false);
							dispatch(
								Actions.openDialog({
									children:
										rosterType === 'procare' ? (
											<ProcareValidator file={blob} type="local" rooms={rooms} />
										) : (
											<FileValidator file={blob} type="local" rooms={rooms} />
										),
									maxWidth: 'md',
								})
							);
						})
						.catch((err) => console.log(err));
				} else {
					dispatch(
						Actions.showMessage({
							message: 'Failed to Post File.',
							autoHideDuration: 1500,
							variant: 'error',
						}),
						setOpen(false)
					);
				}
			},
			cancel: () => {
				/* cancel handler */
				console.log('cancel');
			},
			error: (error) => {
				/* error handler */
				console.log('error', error);
			},
		};
		window.OneDrive.open(odOptions);
	}

	return (
		<FuseAnimate animation="transition.slideLeftIn" duration={600}>
			<FuseScrollbars className={classes.content} scrollToTopOnRouteChange>
				<div style={{ padding: 50 }}>
					<div className="form-heading" style={{ fontSize: '20px' }}>
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
						Student Roster
					</div>
					<div className="form-container bg-white">
						<form>
							<h2 className="form-section-heading" style={{ fontSize: '18px' }}>
								Submit Your Roster
							</h2>
							<hr />
							<div className="roster-main-div">
								<div className="para-one-heading">
									<p className="point-one">1</p>
									<h2 style={{ fontSize: '18px' }}>Prepare Your Roster</h2>
								</div>
								<div className="para-one-content flex justify-between">
									<div>
										<p className="paragraph-one">
											You will need a file with the student and family information. Otherwise, you
											can use our{' '}
											<a
												style={{ cursor: 'pointer' }}
												target="_blank"
												href="assets/files/UploadRoster.xlsx"
											>
												Roster Template .
											</a>
										</p>
									</div>

									<div style={{ width: '100%', display: 'block' }}>
										<TableContainer
											id="Scrollable-table"
											component={Paper}
											className="submit-roaster-table"
										>
											<Table stickyHeader className="student-table" style={{ width: '100%' }}>
												<TableHead>
													<TableRow>
														<TableCell
															style={{ width: '25%' }}
															className="bg-white studentTableHeader"
															align="left"
														>
															Student Name
														</TableCell>
														<TableCell
															style={{ width: '25%' }}
															className="bg-white studentTableHeader"
															align="left"
														>
															Rooms
														</TableCell>
														<TableCell
															style={{ width: '25%' }}
															className="bg-white studentTableHeader"
															align="left"
														>
															Parent Name
														</TableCell>
														<TableCell
															className="bg-white studentTableHeader"
															align="left"
															component="th"
															scope="row"
															style={{ width: '25%' }}
															colSpan={8}
														>
															Parent Email
														</TableCell>
													</TableRow>
												</TableHead>
												<TableBody className="">
													<TableRow>
														<TableCell>Alex Smith</TableCell>
														<TableCell>Infants</TableCell>
														<TableCell>Joshua Marshall</TableCell>
														<TableCell>joshua@gmail.com</TableCell>
													</TableRow>
													<TableRow>
														<TableCell>Mai Doe</TableCell>
														<TableCell>Toddlers</TableCell>
														<TableCell>Sarah Jhonson</TableCell>
														<TableCell>sarah@gmail.com</TableCell>
													</TableRow>
												</TableBody>
											</Table>
										</TableContainer>
									</div>
								</div>

								<div className="para-two-heading">
									<p className="point-two">2</p>
									<h2 style={{ fontSize: '18px' }}>Submit Your File</h2>
								</div>
								<div className="para-two-content flex justify-between items-center">
									<div className="para-two-content-paragraph">
										<p>Upload your roster and the perfect day will take care of the rest.</p>
									</div>
									<div className="submit-file-div">
										<div className="upload-file-div">
											<div className="w-full">
												<FormControl error={!!rosterErr} className="w-1/2 mx-auto mb-32">
													<InputLabel id="roster_type_label">Select</InputLabel>
													<Select
														name="roster_type"
														onChange={(e) => {
															setRosterType(e.target.value);
															setRosterErr('');
														}}
														labelId="roster_type_label"
														id="roster_type"
														label="Select"
														placeholder="Select"
													>
														{rosterTypes.map((item) => (
															<MenuItem value={item.slug}>
																<div className="flex">
																	<img src={item.photo} />
																	<div>{item.name}</div>
																</div>
															</MenuItem>
														))}
													</Select>
													{rosterErr && (
														<FormHelperText>
															<div className="text-xs">{rosterErr}</div>
														</FormHelperText>
													)}
												</FormControl>
											</div>
											<CustomButton
												variant="primary"
												height="40px"
												width="200px"
												fontSize="15px"
												onClick={handleClickOpen}
											>
												Submit Your Roster
											</CustomButton>
											{isAdding ? (
												<div className="flex justify-center my-24">
													<CircularProgress className="mx-auto" />
												</div>
											) : (
												<Dialog
													open={open}
													onClose={handleClose}
													aria-labelledby="alert-dialog-title"
													aria-describedby="alert-dialog-description"
												>
													<div className="dialog-header">
														<p style={{ fontSize: '20px', fontWeight: '700' }}>
															Upload Files
														</p>
														<div className="dialog-icon">
															<IconButton onClick={handleClose}>
																<CloseIcon />
															</IconButton>
														</div>
													</div>
													<DialogContent
														style={{
															justifyContent: 'center',
															textAlign: 'center',
															marginBottom: 20,
														}}
													>
														<Dropzone multiple={false} onDrop={handleDropFile}>
															{({ getRootProps }) => (
																<div {...getRootProps({ className: 'dropzone' })}>
																	<div className="fileUpload-div">
																		<div className="cloud-div">
																			<div
																				className="cloud"
																				onClick={() => inputRef.current.click()}
																			>
																				<img
																					alt="computer"
																					src="assets/images/cloud.svg"
																					height="20%"
																					width="20%"
																				/>
																			</div>
																			<input
																				onChange={onSelectFile}
																				type="file"
																				name="fileSelect"
																				id="fileSelect"
																				className="hidden"
																				ref={inputRef}
																				accept=".xlsx, .xls"
																			/>
																			<p>Drag & drop your files here</p>
																			<span>OR</span>
																			<div
																				style={{
																					justifyContent: 'center',
																					alignSelf: 'center',
																					display: 'flex',
																					width: '100%',
																				}}
																			>
																				<CustomButton
																					type="file"
																					marginTop={10}
																					variant="primary"
																					height="40px"
																					width="180px"
																					fontSize="15px"
																					onClick={() =>
																						inputRef.current.click()
																					}
																				>
																					Browse Files
																				</CustomButton>
																			</div>
																		</div>
																	</div>
																</div>
															)}
														</Dropzone>
														<div
															style={{ display: 'flex', justifyContent: 'space-between' }}
														>
															<div className="upload-options">
																<IconButton onClick={() => inputRef.current.click()}>
																	<img
																		alt="computer"
																		src="assets/images/computer.svg"
																		height="100%"
																		width="100%"
																		style={{
																			display: 'flex',
																			alignSelf: 'center',
																			alignItems: 'center',
																		}}
																	/>
																	<input
																		onChange={onSelectFile}
																		type="file"
																		name="fileSelect"
																		id="fileSelect"
																		className="hidden"
																		ref={inputRef}
																		accept=".xlsx, .xls, .csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
																	/>
																	<p
																		style={{
																			fontSize: '14px',
																			fontWeight: '800',
																			marginTop: 10,
																		}}
																	>
																		My Computer
																	</p>
																</IconButton>
															</div>

															{
																// Google Drive picker
															}
															<GoogleDrivePicker
																handleClose={handleClose}
																rooms={rooms}
																roster_type={rosterType}
															>
																<div className="upload-options">
																	<IconButton>
																		<img
																			alt="google-drive"
																			src="assets/images/google-drive.svg"
																			height="100%"
																			width="100%"
																			style={{
																				display: 'flex',
																				alignSelf: 'center',
																				alignItems: 'center',
																			}}
																		/>
																		<p
																			style={{
																				fontSize: '14px',
																				fontWeight: '800',
																				marginTop: 18,
																			}}
																		>
																			Google Drive
																		</p>
																	</IconButton>
																</div>
															</GoogleDrivePicker>

															{
																// One Drive picker
															}

															<div className="upload-options">
																<IconButton onClick={() => launchOneDrivePicker()}>
																	<img
																		alt="one-drive"
																		src="assets/images/one-drive.svg"
																		height="100%"
																		width="100%"
																		id="OpenOneDrive"
																		style={{
																			display: 'flex',
																			alignSelf: 'center',
																			alignItems: 'center',
																			marginTop: 10,
																		}}
																	/>
																	<p
																		style={{
																			fontSize: '14px',
																			fontWeight: '800',
																			marginTop: 22,
																		}}
																	>
																		One Drive
																	</p>
																</IconButton>
															</div>

															{
																// Dropbox picker
															}

															<div className="upload-options">
																<IconButton onClick={() => {}}>
																	<DropboxChooser
																		id="rosterFile"
																		appKey={`${process.env.REACT_APP_ENV_DROPBOX_APP_KEY}`}
																		success={(files) => selectDropBox(files)}
																		cancel={() => console.log('closed')}
																		multiselect={false}
																		linkType="preview"
																		extensions={['.xls', '.xlsx', '.csv']}
																	>
																		<img
																			alt="Drop-Box"
																			src="assets/images/dropbox.svg"
																			height="100%"
																			width="100%"
																			style={{
																				display: 'flex',
																				alignSelf: 'center',
																				alignItems: 'center',
																				width: 60,
																			}}
																		/>
																		<p
																			style={{
																				fontSize: '14px',
																				fontWeight: '800',
																				marginTop: 32,
																			}}
																		>
																			Dropbox
																		</p>
																	</DropboxChooser>
																</IconButton>
															</div>
														</div>
													</DialogContent>
												</Dialog>
											)}
										</div>
									</div>
								</div>
							</div>
						</form>
					</div>
				</div>
			</FuseScrollbars>
		</FuseAnimate>
	);
}

export default SubmitRoster;
