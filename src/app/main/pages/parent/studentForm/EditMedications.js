/* eslint-disable consistent-return */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/control-has-associated-label */
import React, { useState } from 'react';
import './StudentForm.css';
import CustomButton from 'app/customComponents/CustomButton/CustomButton';
import history from '@history';
import { DeleteRounded } from '@material-ui/icons';
import { TextField, InputLabel, MenuItem, FormControl, Select, CircularProgress, IconButton } from '@material-ui/core/';
import CustomDatePicker from 'app/customComponents/CustomDatePicker/CustomDatePicker';
import { addMedications } from 'app/services/students/students';
import { makeStyles } from '@material-ui/core/styles';
import { useDispatch } from 'react-redux';
import FuseScrollbars from '@fuse/core/FuseScrollbars';
import * as Actions from 'app/store/actions';
import dayjs from 'dayjs';

const useStyles = makeStyles((theme) => ({
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
}));

function EditMedications() {
	const classes = useStyles();
	const dispatch = useDispatch();
	const [isSaving, setIsSaving] = useState(false);
	const { student } = history.location.state;
	const [modifiedStudent, setModifiedStudent] = useState({
		...student,
		doctor: student.doctor?.name,
	});
	const [modifiedMedications, setModifiedMedications] = useState([...student.medications]);
	const [errTxts, setErrTxts] = useState({});

	const handleSubmit = () => {
		const medicationData = {
			doctor_name: modifiedStudent.doctor,
			allergies: modifiedStudent.allergies,
			is_medical_condition: modifiedStudent.is_medical_condition || 0,
			student_id: student.id,
			medication_data: modifiedMedications,
			description: modifiedStudent.description,
		};
		let isError = false;
		modifiedMedications.forEach((med, i) => {
			if (!med.name) {
				isError = true;
				setErrTxts((prevState) => ({ ...prevState, [`med.${i}.name`]: 'This field is required' }));
			}
			if (!med.frequency) {
				isError = true;
				setErrTxts((prevState) => ({ ...prevState, [`med.${i}.frequency`]: 'This field is required' }));
			}
			if (!med.start_date) {
				isError = true;
				setErrTxts((prevState) => ({ ...prevState, [`med.${i}.start_date`]: 'This field is required' }));
			}
			if (!med.end_date) {
				isError = true;
				setErrTxts((prevState) => ({ ...prevState, [`med.${i}.end_date`]: 'This field is required' }));
			}
		});
		if (isError) {
			return;
		}
		setIsSaving(true);
		addMedications(medicationData)
			.then((resp) => {
				dispatch(
					Actions.showMessage({
						message: resp.data.message,
						variant: 'success',
					})
				);
				setIsSaving(false);
				history.goBack();
			})
			.catch((err) => {
				dispatch(
					Actions.showMessage({
						message: err.resonse.data.message,
						variant: 'error',
					})
				);
				setIsSaving(false);
			});
	};

	const handleChange = (e) => {
		const { name, value } = e.target;
		setErrTxts({ ...errTxts, [name]: '' });
		if (name === 'is_medical_condition' && value === 0) {
			setModifiedStudent({ ...modifiedStudent, [name]: value, description: '' });
			return;
		}
		setModifiedStudent({ ...modifiedStudent, [name]: value });
	};

	const handleMedicationChange = (e, index) => {
		const { name, value } = e.target;
		setErrTxts({ ...errTxts, [`med.${index}.${name}`]: '' });
		const temp = { ...modifiedMedications[index], [name]: value };
		setModifiedMedications([...modifiedMedications.slice(0, index), temp, ...modifiedMedications.slice(index + 1)]);
	};

	const setStartDate = (date, index) => {
		delete errTxts[`med.${index}.start_date`];
		const temp = { ...modifiedMedications[index], start_date: date ? dayjs(date).format('YYYY-MM-DD') : '' };
		setModifiedMedications([...modifiedMedications.slice(0, index), temp, ...modifiedMedications.slice(index + 1)]);
	};
	const setEndDate = (date, index) => {
		delete errTxts[`med.${index}.end_date`];
		const temp = { ...modifiedMedications[index], end_date: date ? dayjs(date).format('YYYY-MM-DD') : '' };
		setModifiedMedications([...modifiedMedications.slice(0, index), temp, ...modifiedMedications.slice(index + 1)]);
	};

	const addMedication = () => {
		setModifiedMedications([...modifiedMedications, { name: '', frequency: '', start_date: '', end_date: '' }]);
	};

	const removeMedication = (index) => {
		setErrTxts({});
		const temp = [...modifiedMedications.slice(0, index), ...modifiedMedications.slice(index + 1)];
		setModifiedMedications(temp);
	};

	return (
		<FuseScrollbars className={classes.content} scrollToTopOnRouteChange>
			<div className="P-m">
				<div className="stdinfo flex items-center flex-nowrap justify-between mx-auto">
					<span className="personal-hd text-2xl self-end font-extrabold ">
						<h1></h1>
					</span>
				</div>

				<div className="stdinfo flex items-center flex-nowrap justify-between mx-auto">
					<span className="personal-hd info-hd stext-2xl self-end font-extrabold ">
						<h1 className="hd-main">
							{' '}
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
							Edit Medical
						</h1>
					</span>
				</div>

				<div className="editwidth">
					<div className="per-detail bg-white mx-auto">
						<div className="flex justify-between width-30-fields">
							<TextField
								helperText={errTxts.allergies}
								error={errTxts.allergies}
								onChange={handleChange}
								value={modifiedStudent.allergies}
								name="allergies"
								label="Allergies"
							/>
							<TextField
								helperText={errTxts.doctor}
								error={errTxts.doctor}
								onChange={handleChange}
								value={modifiedStudent.doctor}
								name="doctor"
								label="Doctor"
							/>
							<FormControl variant="standard" className="">
								<InputLabel id="relationLabel">Medical Condition</InputLabel>
								<Select
									onChange={handleChange}
									labelId="relationLabel"
									id="medical-condition"
									label="Medical Condtion"
									name="is_medical_condition"
									defaultValue={modifiedStudent.is_medical_condition || 0}
								>
									<MenuItem value={1}>Yes</MenuItem>
									<MenuItem value={0}>No</MenuItem>
								</Select>
							</FormControl>
						</div>
						{modifiedStudent.is_medical_condition === 1 ? (
							<div className="mt-12">
								<TextField
									helperText={errTxts.description}
									error={errTxts.description}
									onChange={handleChange}
									value={modifiedStudent.description}
									name="description"
									label="Description"
									className="w-full"
								/>
							</div>
						) : (
							''
						)}
						<hr className="mt-32" style={{ color: 'lightgrey' }} />
						<div className="mt-20">
							<div className="bg-blue-100 px-40 py-12 flex justify-around">
								<div className="font-bold med-table-headers w-3/12">Medication</div>
								<div className="font-bold med-table-headers w-3/12">Frequency</div>
								<div className="font-bold med-table-headers w-3/12">Start Date</div>
								<div className="font-bold med-table-headers w-3/12">End Date</div>
								<div />
							</div>
							{modifiedStudent.is_medical_condition === 1 ? (
								modifiedMedications.length ? (
									modifiedMedications.map((medication, index) => {
										return (
											<>
												<div className="mt-10 px-40 py-12 flex items-center justify-around">
													<div className="w-3/12">
														<TextField
															helperText={errTxts[`med.${index}.name`]}
															error={errTxts[`med.${index}.name`]}
															onChange={(e) => handleMedicationChange(e, index)}
															value={medication.name}
															name="name"
															label="Medication"
														/>
													</div>
													<div className="w-3/12">
														<TextField
															helperText={errTxts[`med.${index}.frequency`]}
															error={errTxts[`med.${index}.frequency`]}
															onChange={(e) => handleMedicationChange(e, index)}
															value={medication.frequency}
															name="frequency"
															label="Frequency"
														/>
													</div>
													<div className="w-3/12">
														<CustomDatePicker
															errTxts={errTxts[`med.${index}.start_date`]}
															value={medication.start_date}
															setValue={(date) => setStartDate(date, index)}
															label="Start Date"
															width="90%"
															disablePast
															maxDate={modifiedMedications[index].end_date}
														/>
													</div>
													<div className="w-3/12">
														<CustomDatePicker
															errTxts={errTxts[`med.${index}.end_date`]}
															value={medication.end_date}
															setValue={(date) => setEndDate(date, index)}
															label="End Date"
															width="90%"
															minDate={modifiedMedications[index].start_date}
														/>
													</div>
													<div
														className="cursor-pointer mt-28"
														style={{ color: '#42B2E9' }}
														onClick={() => removeMedication(index)}
													>
														<DeleteRounded />
													</div>
												</div>
												<hr className="mt-10" style={{ color: 'lightgrey' }} />
											</>
										);
									})
								) : (
									<>
										<div className="flex justify-center mt-20 font-bold text-lg">No Medication</div>
										<hr className="mt-10" style={{ color: 'lightgrey' }} />
									</>
								)
							) : (
								<>
									<div className="flex justify-center mt-20 font-bold text-lg">
										No Medical Condition
									</div>
									<hr className="mt-10" style={{ color: 'lightgrey' }} />
								</>
							)}
							{modifiedStudent.is_medical_condition === 1 && (
								<>
									<div className="mt-10 px-40 py-12 flex justify-around">
										<div
											onClick={addMedication}
											className="flex cursor-pointer items-center justify-start w-full"
										>
											<img src="assets/images/add-med.png" style={{ width: 40 }} alt="" /> + Add
											Medication
										</div>
									</div>
									<hr className="mt-10" style={{ color: 'lightgrey' }} />
								</>
							)}
						</div>
					</div>
					<div className="btnedit">
						{!isSaving ? (
							<div className=" center-btn">
								<CustomButton
									variant="secondary"
									onClick={() => {
										history.goBack();
									}}
								>
									Cancel
								</CustomButton>
								<CustomButton variant="primary" onClick={handleSubmit}>
									Update
								</CustomButton>
							</div>
						) : (
							<div className="flex justify-center">
								<CircularProgress className="mx-auto" />
							</div>
						)}
					</div>
				</div>
			</div>
		</FuseScrollbars>
	);
}

export default EditMedications;
