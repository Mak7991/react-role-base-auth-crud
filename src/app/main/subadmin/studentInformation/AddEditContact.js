/* eslint-disable consistent-return */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
import React, { useState, useEffect, useRef } from 'react';
import {
	TextField,
	Avatar,
	FormControl,
	MenuItem,
	InputLabel,
	Select,
	FormHelperText,
	CircularProgress,
	IconButton
} from '@material-ui/core/';
import './StudentInformation.css';
import CustomButton from 'app/customComponents/CustomButton/CustomButton';
import history from '@history';
import { getRelations } from 'app/services/students/students';
import { uploadFile } from 'app/services/imageUpload/imageUpload';
import { createContact, updateContact } from 'app/services/contacts/contacts';
import { useDispatch } from 'react-redux';
import * as Actions from 'app/store/actions';
import { getImageUrl } from 'utils/utils';

function AddEditContact() {
	const dispatch = useDispatch();
	useEffect(() => {
		if (!history.location.state?.row) {
			history.goBack();
		}
	}, [history.location.state?.row]);
	const { contact, row, isEdit } = history.location.state;
	const [relations, setRelations] = useState([]);
	const [form, setForm] = useState(
		contact?.id
			? { ...contact, student_id: row.id, relation_id: contact.relation_id || 1 }
			: { student_id: row?.id }
	);
	const [errTxts, setErrTxts] = useState({});
	const [isAdding, setIsAdding] = useState(false);
	const [selectedFile, setSelectedFile] = useState();
	const [preview, setPreview] = useState();
	const inputRef = useRef(null);

	useEffect(() => {
		if (!selectedFile) {
			setPreview(contact?.photo || null);
			return;
		}

		const objectUrl = URL.createObjectURL(selectedFile);
		setPreview(objectUrl);

		return () => URL.revokeObjectURL(objectUrl);
	}, [selectedFile, contact?.photo]);

	const onSelectFile = e => {
		if (!e.target.files || e.target.files.length === 0) {
			setSelectedFile(contact?.photo || null);
			return;
		}

		setSelectedFile(e.target.files[0]);
	};
	useEffect(() => {
		getRelations().then(res => setRelations(res.data));
	}, []);

	const handleChange = e => {
		const { name, value } = e.target;
		setErrTxts({ ...errTxts, [name]: '' });
		setForm({ ...form, [name]: value });
	};

	const handleSubmit = () => {
		setErrTxts({});

		if (!form.first_name) {
			setErrTxts({ ...errTxts, first_name: 'This field is required' });
			return;
		}
		if (form.first_name && /[^a-zA-Z]/.test(form.first_name)) {
			setErrTxts({ ...errTxts, first_name: 'Please enter a valid name.' });
			return;
		}
		if (!form.last_name) {
			setErrTxts({ ...errTxts, last_name: 'This field is required' });
			return;
		}
		if (form.last_name && /[^a-zA-Z]/.test(form.last_name)) {
			setErrTxts({ ...errTxts, last_name: 'Please enter a valid name.' });
			return;
		}
		if (!form.relation_id) {
			setErrTxts({ ...errTxts, relation_id: 'This field is required' });
			return;
		}
		if (!form.relation_with_child) {
			setErrTxts({ ...errTxts, relation_with_child: 'This field is required' });
			return;
		}
		if (!form.email) {
			setErrTxts({ ...errTxts, email: 'This field is required' });
			return;
		}
		if (!/^\S+@\S+\.\S+$/.test(form.email)) {
			setErrTxts({ ...errTxts, email: 'Please enter valid email' });
			return;
		}
		if (!form.phone) {
			setErrTxts({ ...errTxts, phone: 'This field is required' });
			return;
		}
		if (form.phone) {
			if (
				!Number.isFinite(
					Number(
						form.phone
							.split(' ')
							.join('')
							.split('-')
							.join('')
							.split('(')
							.join('')
							.split(')')
							.join('')
					)
				)
			) {
				setErrTxts({ ...errTxts, phone: 'Please enter valid phone number' });
				return;
			}
		}
		if (!(form.can_pickup === 1 || form.can_pickup === 0)) {
			setErrTxts({ ...errTxts, can_pickup: 'This field is required' });
			return;
		}
		if (isEdit && contact.role === 'parent') {
			form.is_parent = 1;
		} else {
			form.is_parent = 0;
		}
		if (selectedFile) {
			const filename = getImageUrl(selectedFile)
			setIsAdding(true);
			uploadFile(selectedFile, filename).then(response => {
				form.photo = `${process.env.REACT_APP_S3_BASE_URL}${response}`;
				form.thumb = `${process.env.REACT_APP_S3_BASE_URL}${response}`;
				if (isEdit) {
					updateContact(contact.id, { ...form, relation_id: form.relation_id === 3 ? 1 : form.relation_id })
						.then(r => {
							dispatch(
								Actions.showMessage({
									message: r.data.message,
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
										message: 'Failed to update contact.',
										autoHideDuration: 1500,
										variant: 'error'
									})
								);
							}
						})
						.finally(() => setIsAdding(false));
				} else {
					createContact(form)
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
							} else if (err.response?.data?.message) {
								dispatch(
									Actions.showMessage({
										message: err.response.data.message,
										autoHideDuration: 1500,
										variant: 'error'
									})
								);
							} else {
								dispatch(
									Actions.showMessage({
										message: 'Failed to add contact.',
										autoHideDuration: 1500,
										variant: 'error'
									})
								);
							}
						})
						.finally(() => setIsAdding(false));
				}
			});
		} else {
			setIsAdding(true);
			if (isEdit) {
				updateContact(contact.id, { ...form, relation_id: form.relation_id === 3 ? 1 : form.relation_id })
					.then(r => {
						dispatch(
							Actions.showMessage({
								message: r.data.message,
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
									message: 'Failed to update contact.',
									autoHideDuration: 1500,
									variant: 'error'
								})
							);
						}
					})
					.finally(() => setIsAdding(false));
			} else {
				createContact(form)
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
						} else if (err.response?.data?.message) {
							dispatch(
								Actions.showMessage({
									message: err.response.data.message,
									autoHideDuration: 1500,
									variant: 'error'
								})
							);
						} else {
							dispatch(
								Actions.showMessage({
									message: 'Failed to add contact.',
									autoHideDuration: 1500,
									variant: 'error'
								})
							);
						}
					})
					.finally(() => setIsAdding(false));
			}
		}
	};

	return (
		<div className="w-9/12 mx-auto overflow-scrol">
			




			<div className="flex items-center flex-nowrap justify-between mx-auto" style={{marginTop:'11px'}}>
				<span className="personal-hd info-hd stext-2xl self-end font-extrabold ">
					<h1 className="hd-main">
						{' '}
						<span className="mr-12 icon-color">
							<IconButton
								onClick={() => {
									history.goBack();
								}}
							>
								<img
									src="assets/images/arrow-long.png"
									alt="filter"
									width="24px"
									className="fiterimg"
								/>
							</IconButton>
						</span>{' '}
						Add Contact
					</h1>
				</span>

			</div>



			<div className="bg-white rounded p-32">
				<div className="flex justify-between">
					<div className="mx-40 flex-grow image-top">
						<div
							className="relative pic-upload-overlay cursor-pointer"
							onClick={() => inputRef.current.click()}
						>
							<Avatar style={{ height: '140px', width: '140px' }} src={preview} />
							<div className="ppinputoverlay contactupload">
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

					<div className="contact-width flex flex-col">
						<TextField
							name="first_name"
							onChange={handleChange}
							value={form.first_name}
							label="First Name"
							className="w-2/3 my-28 width-first-name"
							error={!!errTxts.first_name}
							helperText={errTxts.first_name}
						/>
						{form.relation_id !== 1 && form.relation_id !== 3 ? (
							<TextField
								name="relation_with_child"
								onChange={handleChange}
								value={form.relation_with_child}
								label="Relation With Child"
								className="w-2/3 my-28 width-first-name"
								error={!!errTxts.relation_with_child}
								helperText={errTxts.relation_with_child}
							/>
						) : (
							<FormControl
								className="my-28 width-relation-with-child"
								error={!!errTxts.relation_with_child}
							>
								<InputLabel id="state-label">Relation With Child</InputLabel>
								<Select
									onChange={handleChange}
									value={
										form.relation_with_child === 'Legal Guardian'
											? form.relation_with_child
											: form.relation_with_child?.toLowerCase()
									}
									name="relation_with_child"
									labelId="state-label"
									id="status"
									placeholder=""
									className="width-relation-with-child"
								>
									{form.relation_with_child === 'Legal Guardian' || form.relation_id === 3 ? (
										<MenuItem value="Legal Guardian">Legal Guardian</MenuItem>
									) : (
										[
											<MenuItem value="father">Father</MenuItem>,
											<MenuItem value="mother">Mother</MenuItem>
										]
									)}
								</Select>
								{errTxts.relation_with_child && (
									<FormHelperText>{errTxts.relation_with_child}</FormHelperText>
								)}
							</FormControl>
						)}
						<FormControl className="w-2/3 my-28" error={!!errTxts.can_pickup}>
							<div className="flex flex-col">
								<div className="hd-pickup">Can Pickup</div>
								<div className="flex">
									<div
										onClick={() => setForm({ ...form, can_pickup: 1 })}
										className="option-pickup cursor-pointer"
									>
										{' '}
										<span style={{ background: form.can_pickup === 1 ? '#4DA0EE' : 'white' }}>
											<i className="fas fa-check" />
										</span>{' '}
										Yes
									</div>
									<div
										onClick={() => setForm({ ...form, can_pickup: 0 })}
										className="option-pickup cursor-pointer"
									>
										{' '}
										<span style={{ background: form.can_pickup === 0 ? '#4DA0EE' : 'white' }}>
											<i className="fas fa-check" />
										</span>{' '}
										No
									</div>
								</div>
							</div>
							{errTxts.can_pickup && <FormHelperText>{errTxts.can_pickup}</FormHelperText>}
						</FormControl>
					</div>
					<div className="contact-width flex flex-col">
						<TextField
							error={!!errTxts.last_name}
							helperText={errTxts.last_name}
							name="last_name"
							onChange={handleChange}
							value={form.last_name}
							label="Last Name"
							className="w-2/3 my-28 width-first-name"
						/>
						<TextField
							// disabled={isEdit}
							error={!!errTxts.email}
							helperText={errTxts.email}
							name="email"
							onChange={handleChange}
							value={form.email}
							label="Email Address"
							className="w-2/3 my-28 width-first-name"
						/>
						<FormControl error={!!errTxts.emergency_contact} variant="standard" className="w-2/3 my-28">
							<div className="flex flex-col">
								<div className="hd-pickup">Emergency Contact</div>
								<div className="flex">
									<div
										onClick={() => setForm({ ...form, emergency_contact: true })}
										className="option-pickup cursor-pointer"
									>
										{' '}
										<span
											style={{
												background: form.emergency_contact === true ? '#4DA0EE' : 'white'
											}}
										>
											<i className="fas fa-check" />
										</span>{' '}
										Yes
									</div>
									<div
										onClick={() => setForm({ ...form, emergency_contact: false })}
										className="option-pickup cursor-pointer"
									>
										{' '}
										<span
											style={{
												background: form.emergency_contact === false ? '#4DA0EE' : 'white'
											}}
										>
											<i className="fas fa-check" />
										</span>{' '}
										No
									</div>
								</div>
							</div>
							{errTxts.emergency_contact && <FormHelperText>{errTxts.emergency_contact}</FormHelperText>}
						</FormControl>
					</div>
					<div className="contact-width flex flex-col">
						<FormControl className="w-2/3 my-28 width-first-name" error={!!errTxts.relation_id}>
							<InputLabel id="state-label">Select</InputLabel>
							<Select
								onChange={handleChange}
								value={form.relation_id}
								disabled={isEdit}
								name="relation_id"
								labelId="state-label"
								id="status"
								placeholder=""
							>
								{form.relation_with_child === 'Legal Guardian' && isEdit ? (
									<MenuItem value={form.relation_id}>Legal Guardian</MenuItem>
								) : (
									relations?.map(relation => {
										return (
											<MenuItem key={relation.id} value={relation.id}>
												{relation.name}
											</MenuItem>
										);
									})
								)}
							</Select>
							{errTxts.relation_id && <FormHelperText>{errTxts.relation_id}</FormHelperText>}
						</FormControl>
						<TextField
							name="phone"
							onChange={handleChange}
							value={form.phone}
							label="Phone No"
							className="w-2/3 my-28 width-first-name"
							error={!!errTxts.phone}
							helperText={errTxts.phone}
						/>
					</div>
				</div>
				{isAdding ? (
					<div className="flex justify-center my-24">
						<CircularProgress className="mx-auto" />
					</div>
				) : (
					<div className="flex justify-center w-max " style={{ gap: '20px' }}>

<CustomButton
							variant="secondary"
							onClick={() => {
								history.goBack();
							}}
						>
							Cancel
						</CustomButton>
						<CustomButton
							variant="primary"
							onClick={() => {
								handleSubmit();
							}}
						>
							{isEdit ? 'Update' : 'Add'}
						</CustomButton>
		
					</div>
				)}
			</div>
		</div>
	);
}

export default AddEditContact;
