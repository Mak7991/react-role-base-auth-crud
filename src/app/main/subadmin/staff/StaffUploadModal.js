/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React, { useState, useEffect, useRef } from 'react';
import { IconButton, TextField, FormControl, InputLabel, MenuItem, Select, CircularProgress } from '@material-ui/core';
import Dropzone from 'react-dropzone';
import CustomButton from 'app/customComponents/CustomButton/CustomButton';
import { useDispatch } from 'react-redux';
import * as Actions from 'app/store/actions/';
import CloseIcon from '@material-ui/icons/Close';
import { addAttachments } from 'app/services/students/students';
import DatePicker from 'app/customComponents/CustomDatePicker/CustomDatePicker';
import { uploadFile } from 'app/services/imageUpload/imageUpload';
import { getImageUrl } from 'utils/utils';

function StaffUploadModal({ setAttachFile }) {
	const inputRef = useRef(null);
	const dispatch = useDispatch();
	const [data, setData] = useState({ expiry_date: null });
	const [loading, setLoading] = useState(false);
	const [selectedFile, setSelectedFile] = useState(null);
	const handleClose = () => {
		dispatch(Actions.closeDialog());
	};
	const handleDropFile = (file) => {
		if (file[0].size > 20000000) {
			dispatch(Actions.showMessage({ message: 'File size must be less than 20 MB', variant: 'error' }));
			return;
		}
		setSelectedFile(file[0]);
	};
	const onSelectFile = (e) => {
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
		setLoading(true);
        setAttachFile(selectedFile)
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
			<div className="flex justify-between">
				<DatePicker
					value={data.expiry_date}
					setValue={(date) => setData({ ...data, expiry_date: date.format('YYYY-MM-DD') })}
					label="Expiry date"
					width="41%"
					disablePast
				/>
			</div>
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

export default StaffUploadModal;
