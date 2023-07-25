/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React, { useState, useEffect, useRef } from 'react';
import './SubmitRoster.css';
import {
	Table,
	TableHead,
	TableBody,
	TableCell,
	TableContainer,
	TableRow,
	Paper,
	makeStyles,
} from '@material-ui/core';
import Dropzone from 'react-dropzone';
import * as Actions from 'app/store/actions';
import FuseAnimate from '@fuse/core/FuseAnimate';
import { useDispatch } from 'react-redux';
import CustomButton from 'app/customComponents/CustomButton/CustomButton';
import FuseScrollbars from '@fuse/core/FuseScrollbars';
import moment from 'moment';

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

function FileUpload() {
	const classes = useStyles();
	const dispatch = useDispatch();
	const inputRef = useRef(null);
	const [selectedFile, setSelectedFile] = useState();
	const [attachFile, setAttachFile] = useState([]);

	const handleDropFile = (file) => {
		if (!file[0]) {
			setSelectedFile(undefined);
			return;
		}
		setSelectedFile(file[0]);
		handleSubmit(file[0]);
	};

	const handleSubmit = (file) => {
		console.log('file__', file)
	
		const validExtensions = ['pdf', 'jpg', 'jpeg', 'png'];
		const fileSize = 0.000001 * file.size;
		if (file) {
			if (!validExtensions.includes(file.name.split('.')[1])) {
				dispatch(
					Actions.showMessage({
						message: 'Only images or pdf files are allowed!',
						autoHideDuration: 2500,
						variant: 'error',
					})
				);
				return;
			}
			if (fileSize > 2) {
				dispatch(
					Actions.showMessage({
						message: 'File size cannot exceed 2 MBs',
						autoHideDuration: 2500,
						variant: 'error',
					})
				);
				return;
			}
		} else {
			dispatch(
				Actions.showMessage({
					message: 'Failed to Post File.',
					autoHideDuration: 2000,
					variant: 'error',
				}),
			);
		}
		setAttachFile([...attachFile]);
	};

	const handleFileUpload = (e) => {
		console.log("files___", e.target.files)
		const file = e.target.files;
		const file_name = Object.keys(file).map((key) => file[key]);
		if (!file_name) {
			return;
		}
		const validExtensions = ['pdf', 'jpg', 'jpeg', 'png'];
		const fileSize = 0.000001 * file_name.map((s) => s.size);
		if (validExtensions.includes(file_name.map((f) => f.name.split('.')[1]))) {
			dispatch(
				Actions.showMessage({
					message: 'Only images or pdf files are allowed!',
					autoHideDuration: 2500,
					variant: 'error',
				})
			);
			return;
		}
		if (fileSize > 2) {
			dispatch(
				Actions.showMessage({
					message: 'File size cannot exceed 2 MBs',
					autoHideDuration: 2500,
					variant: 'error',
				})
			);
			return;
		}
		setAttachFile([...attachFile, ...file_name]);
	};

	return (
		<FuseAnimate animation="transition.slideLeftIn" duration={600}>
			<FuseScrollbars className={classes.content} scrollToTopOnRouteChange>
				<div style={{ padding: 50 }}>
					<div className="form-container bg-white">
						<div className="roster-main-div">
							<div className="para-two-content flex justify-between items-center">
								<div className="submit-file-div">
									<div className="upload-file-div">

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
																style={{ display: 'none' }}
																onChange={handleFileUpload}
																type="file"
																ref={inputRef}
																accept=".jpg, .png, .jpeg, .pdf"
																multiple
															/>
															<span>Drag & drop your files here</span>
															<br />
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
									</div>
									<div className='mx-auto mt-20'>
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
															Product Name
														</TableCell>
														<TableCell
															style={{ width: '25%' }}
															className="bg-white studentTableHeader"
															align="left"
														>
															Date
														</TableCell>
														<TableCell
															style={{ width: '25%' }}
															className="bg-white studentTableHeader"
															align="left"
														>
															Size
														</TableCell>
														<TableCell
															className="bg-white studentTableHeader"
															align="left"
															component="th"
															scope="row"
															style={{ width: '25%' }}
															colSpan={8}
														>
															type
														</TableCell>
													</TableRow>
												</TableHead>
												<TableBody className="">
													{!attachFile.length ? (
														<TableRow>
															<TableCell align="center" colSpan={8}>
																No File
															</TableCell>
														</TableRow>
													) : attachFile?.map((row, i) => {
														return (
															<TableRow key={i}>
																<TableCell>
																	{row?.name.split('.')[row?.name.split('.').length - 1] !== 'pdf' ? (
																		<div key={i} className="attach_file_div">
																			<img
																				src={URL.createObjectURL(row)}
																				style={{
																					width: '30px',
																					height: '30px',
																					objectFit: 'cover',
																				}}
																			/>
																		</div>
																	) : (
																		<div key={i} className="attach_file_div">
																			<img
																				src="assets/images/pdf_thumbnail.png"
																				style={{
																					width: '30px',
																					height: '30px',
																					objectFit: 'cover',
																				}}
																			/>
																		</div>
																	)
																	}
																	<span>{row?.name}</span>
																	
																</TableCell>
																<TableCell>{moment(row?.lastModifiedDate).format('L')}</TableCell>
																<TableCell>{row?.size}</TableCell>
																<TableCell>{row?.type}</TableCell>
															</TableRow>
														)
													})}
												</TableBody>
											</Table>
										</TableContainer>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</FuseScrollbars>
		</FuseAnimate>
	);
}

export default FileUpload;
