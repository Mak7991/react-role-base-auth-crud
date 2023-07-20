/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React, { useState, useEffect } from 'react';
import {
	TextField,
	CircularProgress,
	FormControl,
	FormHelperText,
	MenuItem,
	InputLabel,
	Select,
	IconButton
} from '@material-ui/core';
import CustomButton from 'app/customComponents/CustomButton/CustomButton';
import './AddParent.css';
import history from '@history';
import { addMultipleParents } from 'app/services/students/students';
import { useDispatch } from 'react-redux';
import * as Actions from 'app/store/actions';

function AddParent() {
	const dispatch = useDispatch();
	const [form, setForm] = useState({});
	const [errTxts, setErrTxts] = useState({});
	const [isLoading, setIsLoading] = useState(false);
	const { row } = history.location.state;
	const [role, setRole] = useState('parent');

	useEffect(() => {
		if (!row) {
			history.goBack();
		}
	}, []);

	const handleChange = ev => {
		const { name, value } = ev.target;
		setErrTxts({ ...errTxts, [name]: [] });
		setForm({ ...form, [name]: value });
	};

	const handleSubmit = ev => {
		ev.preventDefault();
		setErrTxts({});
		if (!form.parent_first_name) {
			setErrTxts({ ...errTxts, parent_first_name: 'This field is required' });
			return;
		}
		if (form.parent_first_name && /[^a-zA-Z]/.test(form.parent_first_name)) {
			setErrTxts({ ...errTxts, parent_first_name: 'Please enter a valid name.' });
			return;
		}
		if (!form.parent_last_name) {
			setErrTxts({ ...errTxts, parent_last_name: 'This field is required' });
			return;
		}
		if (form.parent_last_name && /[^a-zA-Z]/.test(form.parent_last_name)) {
			setErrTxts({ ...errTxts, parent_last_name: 'Please enter a valid name.' });
			return;
		}
		if (!form.parent_phone) {
			setErrTxts({ ...errTxts, parent_phone: 'This field is required' });
			return;
		}
		if (!form.relation_with_child) {
			setErrTxts({ ...errTxts, relation_with_child: 'This field is required' });
			return;
		}
		if (!(form.emergency_contact === true || form.emergency_contact === false)) {
			setErrTxts({ ...errTxts, emergency_contact: 'This field is required' });
			return;
		}
		if (!(form.can_pickup === 1 || form.can_pickup === 0)) {
			setErrTxts({ ...errTxts, can_pickup: 'This field is required' });
			return;
		}
		if (form.parent_phone) {
			if (
				!Number.isFinite(
					Number(
						form.parent_phone
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
				setErrTxts({ ...errTxts, parent_phone: 'Please enter valid phone number' });
				return;
			}
			if (!form.parent_email) {
				setErrTxts({ ...errTxts, parent_email: 'This field is required' });
				return;
			}
			if (!/^\S+@\S+\.\S+$/.test(form.parent_email)) {
				setErrTxts({ ...errTxts, parent_email: 'Please enter valid email' });
				return;
			}
		}
		form.parent_id = row.parent_id;
		setIsLoading(true);
		addMultipleParents(form)
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
							message: 'Failed to add Parent.',
							autoHideDuration: 1500,
							variant: 'error'
						})
					);
				}
				setIsLoading(false);
			});
	};

	return (
		<div className="addParent-main-div">
			<div className="form-heading">
				{' '}
				<span className="">
					<IconButton
						onClick={() => {
							history.push('/students');
						}}
					>
						<img src="assets/images/arrow-long.png" alt="filter" width="24px" className="" />
					</IconButton>
				</span>{' '}
				Add Parent
			</div>
			<div className="form-addparent-container bg-white">
				<form onSubmit={handleSubmit}>
					<h2 className="form-section-heading" style={{fontSize:'18px'}}>

						Parent Information</h2>
					<div className="flex flex-col row-gap-32">
						<div className="flex justify-between">
							<TextField
								className="w-1/3"
								onChange={handleChange}
								name="parent_first_name"
								label="First Name"
								id="fname-student"
								error={!!errTxts.parent_first_name?.length}
								helperText={errTxts.parent_first_name}
							/>
							<TextField
								className="w-1/3"
								onChange={handleChange}
								name="parent_last_name"
								label="Last Name"
								id="lname-student"
								error={!!errTxts.parent_last_name?.length}
								helperText={errTxts.parent_last_name}
							/>
						</div>
						<div className="flex justify-between">
							<TextField
								className="w-1/3"
								onChange={handleChange}
								name="parent_phone"
								label="Contact Number"
								id="contact-parent"
								error={!!errTxts.parent_phone?.length}
								helperText={errTxts.parent_phone}
							/>
							<TextField
								className="w-1/3"
								onChange={handleChange}
								name="parent_email"
								label="Email Address"
								id="email-parent"
								error={!!errTxts.parent_email?.length}
								helperText={errTxts.parent_email}
							/>
						</div>
						<div className="flex justify-between">
							<FormControl variant="standard" className="w-1/3">
								<InputLabel shrink id="selectLabel">
									Select*
								</InputLabel>
								<Select
									value={role}
									onChange={e => setRole(e.target.value)}
									labelId="selectLabel"
									id="Select"
									label="Select*"
								>
									<MenuItem value="parent">
										<span id="parent">Parent</span>
									</MenuItem>
									<MenuItem value="legal-guardian">
										<span id="legal-guardian">Legal Guardian</span>
									</MenuItem>
								</Select>
							</FormControl>
							<FormControl
								error={errTxts.relation_with_child?.length}
								variant="standard"
								className="w-1/3"
							>
								<InputLabel id="relationLabel">Relation with Child*</InputLabel>
								<Select
									onChange={handleChange}
									labelId="relationLabel"
									id="childRelation"
									label="Relation with Child*"
									name="relation_with_child"
								>
									{role === 'parent' ? (
										// fragment not working so used array
										[
											<MenuItem value="father">
												<span id="father">Father</span>
											</MenuItem>,
											<MenuItem value="mother">
												<span id="mother">Mother</span>
											</MenuItem>
										]
									) : (
										<MenuItem value="Legal Guardian">
											<span id="legal-guardian">Legal Guardian</span>
										</MenuItem>
									)}
								</Select>
								{errTxts.relation_with_child && (
									<FormHelperText>{errTxts.relation_with_child}</FormHelperText>
								)}
							</FormControl>
						</div>
					</div>
					<div className="flex justify-between">
						<FormControl className="w-1/3 mt-24" error={!!errTxts.can_pickup}>
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
						<FormControl error={!!errTxts.emergency_contact} variant="standard" className="w-1/3 mt-24">
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



					<div className="btnedit">
						{!isLoading ? (
							<div className=" center-btn">
								<CustomButton
									variant="secondary"
									width={140}
									onClick={() => {
										history.goBack();
									}}
								>
									Cancel
								</CustomButton>


								<CustomButton variant="primary" type="submit" width={140} fontSize="15px">
									Submit
								</CustomButton>

							</div>
						) : (
							<div className="flex justify-center">
								<CircularProgress className="mx-auto" />
							</div>
						)}
					</div>



				</form>
			</div>
		</div>
	);
}

export default AddParent;
