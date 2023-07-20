/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React, { useState, useEffect, useRef } from 'react';
import {
	IconButton,
	TextField,
	FormControl,
	InputLabel,
	MenuItem,
	Select,
	FormHelperText,
	CircularProgress,
} from '@material-ui/core';
import Dropzone from 'react-dropzone';
import CustomButton from 'app/customComponents/CustomButton/CustomButton';
import { useDispatch } from 'react-redux';
import * as Actions from 'app/store/actions/';
import CloseIcon from '@material-ui/icons/Close';
import { addAttachments } from 'app/services/students/students';
import DatePicker from 'app/customComponents/CustomDatePicker/CustomDatePicker';
import { uploadFile } from 'app/services/imageUpload/imageUpload';
import { getImageUrl } from 'utils/utils';

function AttachmentModal({ refresAttachments, id }) {
	const inputRef = useRef(null);
	const dispatch = useDispatch();
	const [data, setData] = useState({ file: null, category: null, expiry_date: null });
	const [loading, setLoading] = useState(false);
	const [category, setCategory] = useState(null);
	const [selectedFile, setSelectedFile] = useState(null);
	const handleClose = () => {
		dispatch(Actions.closeDialog());
	};
	const handleDropFile = (file) => {
		if (file[0].name.split('.')[1] !== 'pdf') {
			dispatch(Actions.showMessage({ message: 'Only PDF file allowed', variant: 'error' }));
			return;
		}
		if (file[0].size > 20000000) {
			dispatch(Actions.showMessage({ message: 'File size must be less than 20 MB', variant: 'error' }));
			return;
		}
		setSelectedFile(file[0]);
	};
	const onSelectFile = (e) => {
		if (e.target.files[0].name.split('.')[1] !== 'pdf') {
			dispatch(Actions.showMessage({ message: 'Only PDF file allowed', variant: 'error' }));
			return;
		}
		if (e.target.files[0].size > 20000000) {
			dispatch(Actions.showMessage({ message: 'File size must be less than 20 MB', variant: 'error' }));
			return;
		}
		setSelectedFile(e.target.files[0]);
	};

	const handleSubmit = async () => {
		if (!selectedFile) {
			dispatch(Actions.showMessage({ message: 'File is required', variant: 'error' }));
			return;
		}
		if (!data.category) {
			dispatch(Actions.showMessage({ message: 'Category is required', variant: 'error' }));
			return;
		}
		// if (!data.expiry_date) {
		// 	dispatch(Actions.showMessage({ message: 'Expiry Date is required', variant: 'error' }));
		// 	return;
		// }

		const filename = getImageUrl(selectedFile);
		setLoading(true);
		uploadFile(selectedFile, filename).then((url) => {
			const file = `${process.env.REACT_APP_S3_BASE_URL}${url}`;
			const payload = {
				file,
				name: selectedFile.name,
				file_type: 'pdf',
				student_id: id,
				category: data.category,
				expiry_date: data.expiry_date,
			};
			addAttachments(payload)
				.then(() => {
					dispatch(Actions.closeDialog());
					refresAttachments();
				})
				.catch((err) => console.log(err))
				.finally(() => setLoading(false));
		});
	};

	return (
		<div className="p-32 py-24" style={{ width: 550 }}>
			<div className="flex justify-between items-center">
				<p className="text-xl" style={{ fontWeight: '700' }}>
					Upload Attachment
				</p>
				<div>
					<IconButton style={{ color: 'black' }} size="medium" onClick={handleClose}>
						<CloseIcon />
					</IconButton>
				</div>
			</div>
			{selectedFile ? (
				<div className="flex items-center justify-center relative attachment-file-div">
					<img
						alt=""
						// onClick={() => downloadPDF(item.attachment)}
						className="cursor-pointer self-center"
						src="assets/images/pdf_thumbnail.png"
						style={{ width: '80px', height: '80px' }}
					/>
					<div className="absolute cross-icon-attachment" onClick={() => setSelectedFile(null)}>
						x
					</div>
				</div>
			) : (
				<Dropzone multiple={false} onDrop={handleDropFile}>
					{({ getRootProps }) => (
						<div {...getRootProps({ className: 'dropzone' })}>
							<div className="fileUpload-div">
								<div className="cloud-div">
									<div className="cloud" onClick={() => inputRef.current.click()}>
										<img alt="computer" src="assets/images/cloud.svg" height="20%" width="20%" />
									</div>
									<input
										onChange={onSelectFile}
										type="file"
										name="fileSelect"
										id="fileSelect"
										className="hidden"
										ref={inputRef}
										accept=".pdf"
									/>
									<p>Drag & drop your file here</p>
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
											onClick={() => inputRef.current.click()}
										>
											Browse Files
										</CustomButton>
									</div>
								</div>
							</div>
						</div>
					)}
				</Dropzone>
			)}
			<div style={{ display: 'flex', justifyContent: 'space-between' }}>
				<FormControl variant="standard" className="w-5/12 student-select">
					<InputLabel id="categoryLabel">Select Category</InputLabel>
					<Select
						name="category"
						onChange={(e) => {
							const { value } = e.target;
							setCategory(value);
							setData({ ...data, category: value });
						}}
						labelId="categoryLabel"
						id="category"
						label="Select Category"
					>
						<MenuItem value="Medical Form">Medical Form</MenuItem>
						<MenuItem value="EpiPen Form">EpiPen Form</MenuItem>
						<MenuItem value="Court documents">Court documents</MenuItem>
						<MenuItem value="Student Health Records">Student Health Records</MenuItem>
						<MenuItem value="Immunization Document">Immunization Document</MenuItem>
						<MenuItem value="Medication permission form">Medication permission form </MenuItem>
						<MenuItem value="Distracted Adult">Distracted Adult</MenuItem>
						<MenuItem value="Influenza Brochure">Influenza Brochure</MenuItem>
						<MenuItem value="Enrollment Agreement">Enrollment Agreement</MenuItem>
						<MenuItem value="Enrollment Application">Enrollment Application</MenuItem>
						<MenuItem value="Other">Other</MenuItem>
					</Select>
				</FormControl>

				<DatePicker
					value={data.expiry_date}
					setValue={(date) => setData({ ...data, expiry_date: date.format('YYYY-MM-DD') })}
					label="Expiry date"
					width="41%"
					disablePast
				/>
			</div>
			{category === 'Other' && (
				<TextField
					name="category"
					onChange={(e) => setData({ ...data, category: e.target.value })}
					value={data.category || ''}
					label="Category"
					className="w-5/12 mt-16"
				/>
			)}
			<div className="flex justify-center mt-24">
				{loading ? (
					<CircularProgress size={35} />
				) : (
					<CustomButton variant="primary" onClick={handleSubmit} width={150}>
						Done
					</CustomButton>
				)}
			</div>
		</div>
	);
}

export default AttachmentModal;
