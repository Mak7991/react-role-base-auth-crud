/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/control-has-associated-label */
import React, { useState, useEffect, useRef, useTimeout } from 'react';
import './StudentInformation.css';
import CustomButton from 'app/customComponents/CustomButton/CustomButton';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faPlus } from '@fortawesome/free-solid-svg-icons';
import { Box, IconButton, CircularProgress, FormControl, MenuItem, Select, Avatar } from '@material-ui/core';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import history from '@history';
import { generateAgeString, getAgeDetails } from 'utils/utils';
import { getImmunizations, updateImmunizationList } from 'app/services/immunizations/Immunization';
import { useDispatch } from 'react-redux';
import * as Actions from 'app/store/actions/';
import TextareaAutosize from '@material-ui/core/TextareaAutosize';
import {
	addAttachments,
	changeCheckInCode,
	deleteAttachment,
	getStudent,
	updateStudent,
} from 'app/services/students/students';
import dayjs from 'dayjs';
import CustomDatePicker from 'app/customComponents/CustomDatePicker/CustomDatePicker';
import { uploadFile } from 'app/services/imageUpload/imageUpload';
import { VisibilityOutlined, VisibilityOffOutlined } from '@material-ui/icons';
import { useParams } from 'react-router-dom';
import FuseScrollbars from '@fuse/core/FuseScrollbars';
import { makeStyles } from '@material-ui/core/styles';
import ImmunizationListDialog from './ImmunizationFilterDialog';
import HomeRoomDialog from './HomeRoomDialog';
import AttachmentModal from './AttachmentModal';
import DeleteconfirmContact from './DeleteconfirmContact';
import { getImageUrl } from 'utils/utils';

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

function StudentInformation() {
	const classes = useStyles();

	const dispatch = useDispatch();
	const params = useParams();

	const attachmentFile = useRef(null);
	const [isEditing, setIsEditing] = useState(false);
	const [isSaving, setIsSaving] = useState(false);
	const [immunizations, setImmunizations] = useState([]);
	const [student, setStudent] = useState();
	const [isLoading, setIsLoading] = useState(true);
	const [notes, setNotes] = useState({
		student_exempt: student?.student_exempt,
		notes: student?.notes || 'no record',
	});
	const [refresh, setRefresh] = useState(0);
	const [age, setAge] = useState('');
	const [isEditingDates, setIsEditingDates] = useState(false);
	const [modifiedImmunizations, setModifiedImmunizations] = useState([]);
	const [due, setDue] = useState([]);
	const [overDue, setOverDue] = useState([]);
	const [isFileLoading, setIsFileLoading] = useState(true);
	const [isHidden, setIsHidden] = useState(true);
	const [checkinLoading, setCheckinLoading] = useState(false);
	const [hiddenCodes, setHiddenCodes] = useState([]);
	const [changeCodeLoader, setChangeCodeLoader] = useState([]);

	useEffect(() => {
		setIsLoading(true);
		getStudent(params?.id)
			.then((res) => {
				setStudent(res?.data);
				setHiddenCodes(res?.data?.parents.concat(res.data.approved_pickups)?.map((parent) => true));
				setChangeCodeLoader(res?.data?.parents.concat(res.data.approved_pickups).map((parent) => false));
				setNotes({ student_exempt: res?.data?.student_exempt, notes: res.data.notes });
				setModifiedImmunizations(res?.data?.immunizations.filter((imm) => imm.is_enabled));
				setIsLoading(false);
				setIsFileLoading(false);
			})
			.catch((err, ...rest) => {
				if (err.response?.status === 404) {
					history.push('/students');
				}
				setIsFileLoading(false);
				setIsLoading(false);
			});
	}, [refresh, params?.id]);

	useEffect(() => {
		if (student) {
			setAge(getAgeDetails(dayjs(student?.date_of_birth), dayjs()));
		}
	}, [student]);

	useEffect(() => {
		getImmunizations().then((res) => setImmunizations(res.data));
	}, []);

	const handleImmunizationFilter = (list) => {
		setIsEditingDates(false);
		dispatch(
			Actions.openDialog({
				children: (
					<ImmunizationListDialog
						refresh={refresh}
						setRefresh={setRefresh}
						rows={list}
						enabled={student.immunizations}
						studentId={student.id}
					/>
				),
			})
		);
	};

	const goToEditStudent = () => {
		history.push({ pathname: '/students-editstudent', state: { student } });
	};

	const goToEditMedications = () => {
		history.push({ pathname: '/students-editmedications', state: { student } });
	};

	const handleHomeRoomDialog = (data) => {
		if (data.checkin_status === 'checkout') {
			dispatch(
				Actions.openDialog({
					children: <HomeRoomDialog row={data} refresh={refresh} setRefresh={setRefresh} />,
				})
			);
		} else {
			dispatch(
				Actions.showMessage({
					message: 'Student is checked in',
					autoHideDuration: 2000,
					variant: 'error',
				})
			);
		}
	};

	const handleCheckInCodeShowHide = (index) => {
		const temp = [...hiddenCodes];
		temp[index] = !hiddenCodes[index];
		setHiddenCodes(temp);
	};

	const handleFileSelect = (ev) => {
		let flag = 0;
		if (ev.target.files.length + student.attachments.length > 3) {
			dispatch(
				Actions.showMessage({
					message: 'Maximum 3 Files allowed',
					variant: 'error',
				})
			);
			return;
		}
		Array.prototype.forEach.call(ev.target.files, (file) => {
			if (file.name.split('.')[1] !== 'pdf') {
				dispatch(
					Actions.showMessage({
						message: 'Only PDF files are allowed',
						variant: 'error',
					})
				);
				flag = 1;
				return;
			}
			if (file.size > 2000000) {
				dispatch(
					Actions.showMessage({
						message: 'File size must be less than 2 MB.',
						variant: 'error',
					})
				);
				flag = 1;
			}
		});
		if (flag) {
			return;
		}
		// Handle File Submit on S3 and send attachments to backend
		const attachments = [];
		setIsFileLoading(true);
		Array.prototype.forEach.call(ev.target.files, async (file, index) => {
			const { length } = ev.target.files;
			const filename = getImageUrl(file);
			setIsSaving(true);
			attachments[index] = {
				file: `${process.env.REACT_APP_S3_BASE_URL}${await uploadFile(file, filename)}`,
				name: file.name,
				file_type: 'pdf',
			};
			if (attachments.filter((f) => f?.file).length === length) {
				const data = {
					attachments: [...student.attachments, ...attachments],
					student_id: student.id,
				};
				addAttachments(data)
					.then((res) => {
						dispatch(
							Actions.showMessage({
								message: res.data.message,
								variant: 'success',
							})
						);
						getStudentForFile();
					})
					.catch((err) => {
						dispatch(
							Actions.showMessage({
								message: err.response.data.message,
								variant: 'error',
							})
						);
						setIsFileLoading(false);
					});
			}
		});
	};

	const handleRemoveAttachment = (id) => {
		setIsFileLoading(true);
		deleteAttachment(id)
			.then(() => {
				dispatch(
					Actions.showMessage({
						message: 'File removed successfully',
						variant: 'success',
					})
				);
				getStudentForFile();
			})
			.catch((err) => {
				dispatch(
					Actions.showMessage({
						message: err.response.data.message,
						variant: 'error',
					})
				);
				setIsFileLoading(false);
			});
	};

	const getStudentForFile = () => {
		getStudent(params?.id)
			.then((res) => {
				setStudent(res.data);
				setNotes({ student_exempt: res.data.student_exempt, notes: res.data.notes });
				setModifiedImmunizations(res.data.immunizations.filter((imm) => imm.is_enabled));
				setIsFileLoading(false);
			})
			.catch((err) => {
				setIsFileLoading(false);
			});
	};

	const goToAddEditContact = (edit, contact) => {
		history.push({ pathname: '/students-contact', state: { isEdit: edit, row: student, contact } });
	};

	const handleExempt = (immu, i) => {
		const temp = [...modifiedImmunizations];
		const index = temp.findIndex((item) => item.id === immu.id);
		temp[index].is_exempted = temp[index].is_exempted ? 0 : 1;
		setModifiedImmunizations(temp);
	};

	const handleImmunizationSave = () => {
		for (let index = 0; index < modifiedImmunizations.length; index += 1) {
			if (modifiedImmunizations[index].is_exempted && !modifiedImmunizations[index].exempt_reason) {
				dispatch(
					Actions.showMessage({
						message: `Please select exempt reason for ${
							modifiedImmunizations[index].immunization.name.split('-')[0]
						}`,
						variant: 'error',
					})
				);
				return;
			}
		}
		updateImmunizationList(student.id, modifiedImmunizations)
			.then((res) => {
				setRefresh(refresh + 1);
				setIsEditingDates(false);
			})
			.catch((err) => {
				console.log({ ...err });
			});
	};

	const calculateDueOverDue = () => {
		const duedoses = [];
		const overDuedoses = [];
		for (let i = 0; i < student.immunizations.length; i += 1) {
			if (student.immunizations[i].is_enabled === 1 && student.immunizations[i].is_exempted === 0) {
				let overdueCount = 0;
				for (let j = 0; j < student.immunizations[i].meta.length; j += 1) {
					if (
						student.immunizations[i].meta[j].max_duration < age?.allMonths &&
						!student.immunizations[i].meta[j].date &&
						student.immunizations[i].meta[j].is_recurring === '0' &&
						student.immunizations[i].meta[j].skip === 0
					) {
						overdueCount += 1;
					}
				}
				overDuedoses.push({
					count: overdueCount,
					name: student.immunizations[i].immunization.name.split('-')[0].split('(')[0],
				});
			}
		}
		setOverDue(overDuedoses);

		for (let i = 0; i < student.immunizations.length; i += 1) {
			if (student.immunizations[i].is_enabled === 1 && student.immunizations[i].is_exempted === 0) {
				for (let j = 0; j < student.immunizations[i].meta.length; j += 1) {
					if (
						student.immunizations[i].meta[j].max_duration >= age?.allMonths &&
						!student.immunizations[i].meta[j].date &&
						student.immunizations[i].meta[j].is_recurring === '0' &&
						student.immunizations[i].meta[j].skip === 0
					) {
						duedoses.push(
							`${student.immunizations[i].immunization.name.split('-')[0].split('(')[0]} dose ${
								j + 1
							} rec. ${student.immunizations[i].meta[j].duration_text}`
						);
						break;
					}
				}
			}
		}
		setDue(duedoses);
	};

	useEffect(() => {
		if (student) {
			calculateDueOverDue();
		}
	}, [age]);

	const changeCode = (parentId, index) => {
		if (index || index === 0) {
			const temp = [...changeCodeLoader];
			temp[index] = true;
			setChangeCodeLoader(temp);
		} else {
			setCheckinLoading(true);
		}
		changeCheckInCode(parentId)
			.then((resp) => {
				getStudent(params?.id)
					.then((res) => {
						setStudent(res.data);
						setNotes({ student_exempt: res.data.student_exempt, notes: res.data.notes });
						setModifiedImmunizations(res.data.immunizations.filter((imm) => imm.is_enabled));
					})
					.catch((err) => {
						console.log({ ...err });
					})
					.finally(() => {
						if (index || index === 0) {
							const temp = [...changeCodeLoader];
							temp[index] = false;
							setChangeCodeLoader(temp);
						} else {
							setCheckinLoading(false);
						}
					});
			})
			.catch((err) => {
				console.log({ ...err });
			});
	};

	const openAttachmentModal = () => {
		dispatch(
			Actions.openDialog({
				children: <AttachmentModal refresAttachments={getStudentForFile} id={params?.id} />,
			})
		);
	};

	const handledelete = (familie) => {
		dispatch(
			Actions.openDialog({
				children: (
					<DeleteconfirmContact student={params} row={familie} refresh={refresh} setRefresh={setRefresh} />
				),
			})
		);
	};

	return (
		<>
			<FuseScrollbars className={classes.content} scrollToTopOnRouteChange>
				<div className="P-m">
					<div className="stdinfo flex items-center flex-nowrap justify-between mx-auto">
						<span className="personal-hd info-hd stext-2xl self-end font-extrabold ">
							<h1 className="hd-main">
								{' '}
								<span className="mr-12 icon-color">
									<IconButton
										onClick={() => {
											history.push('/students');
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
								Personal Information
							</h1>
						</span>
						<div className="personal-button flex justify-between">
							<span className="mx-4 ">
								<CustomButton
									variant="secondary"
									height="46"
									width="100px"
									fontSize="15px"
									onClick={goToEditStudent}
									disabled={isLoading}
								>
									<FontAwesomeIcon icon={faEdit} />
									<span> Edit </span>
								</CustomButton>
							</span>
						</div>
					</div>
					<div className="bg-white rounded p-32 py-44 mx-auto">
						<div className="flex">
							<div className="mx-64 flex-shrink-0" style={{ marginRight: '8.6rem' }}>
								<Avatar style={{ height: '140px', width: '140px' }} src={student?.photo} />
							</div>
							{isLoading ? (
								<div className="flex align-center justify-center">
									<CircularProgress size={35} />
								</div>
							) : (
								<div
									className="grid grid-cols-3 flex-grow pl-20"
									style={{ gap: '30px', marginRight: '6.4rem' }}
								>
									<div className="">
										<div style={{ fontSize: 14 }}>Name</div>
										<div
											style={{ fontSize: 16 }}
											className="font-bold turncate break-word capitalize"
										>
											{student?.first_name} {student?.last_name}
										</div>
									</div>
									<div className="">
										<div style={{ fontSize: 14 }}>Birthday</div>
										<div style={{ fontSize: 16 }} className="font-bold turncate break-word">
											{dayjs(student?.date_of_birth).format('MMM DD, YYYY')}
										</div>
									</div>
									<div className="">
										<div style={{ fontSize: 14 }}>Age</div>
										<div style={{ fontSize: 16 }} className="font-bold turncate break-word">
											{generateAgeString(student?.date_of_birth)}
										</div>
									</div>
									<div className="">
										<div style={{ fontSize: 14 }}>Gender</div>
										<div
											style={{ fontSize: 16 }}
											className="font-bold turncate break-word capitalize"
										>
											{student?.gender}
										</div>
									</div>
									{/* <div className="">
									<div style={{ fontSize: 14 }}>Allergies</div>
									<div style={{ fontSize: 16 }} className="font-bold turncate break-word">
										{student.allergies ||
											`${student.first_name} ${student.last_name} has no allergies`}
									</div>
								</div>
								<div className="">
									<div style={{ fontSize: 14 }}>Prescribed Medication</div>
									<div style={{ fontSize: 16 }} className="font-bold turncate break-word">
										{student.medications ||
											`${student.first_name} ${student.last_name} has no medications`}
									</div>
								</div>
								<div className="">
									<div style={{ fontSize: 14 }}>Doctor's Name</div>
									<div style={{ fontSize: 16 }} className="font-bold turncate break-word">
										{student.doctor?.name ||
											`${student.first_name} ${student.last_name} has no Doctor on record`}
									</div>
								</div>
								<div className="">
									<div style={{ fontSize: 14 }}>Doctor's Contact No.</div>
									<div style={{ fontSize: 16 }} className="font-bold turncate break-word">
										{student.doctor?.phone ||
											`${student.first_name} ${student.last_name} has no Doctor on record`}
									</div>
								</div>
								<div className="">
									<div style={{ fontSize: 14 }}>Medical Condition</div>
									<div style={{ fontSize: 16 }} className="font-bold turncate break-word">
										{student.is_medical_condition ||
											`${student.first_name} ${student.last_name} has no medical condition on record`}
									</div>
								</div> */}
									<div className="">
										<div style={{ fontSize: 14 }}>Address</div>
										<div style={{ fontSize: 16 }} className="font-bold turncate break-word">
											{student?.address1 ||
												`${student?.first_name} ${student?.last_name} has no address on record`}
										</div>
									</div>
									<div className="">
										<div style={{ fontSize: 14 }}>Country</div>
										<div
											style={{ fontSize: 16 }}
											className="font-bold turncate break-word capitalize"
										>
											{student?.country?.name}
										</div>
									</div>
									<div className="">
										<div style={{ fontSize: 14 }}>State</div>
										<div
											style={{ fontSize: 16 }}
											className="font-bold turncate break-word capitalize"
										>
											{student?.state?.name}
										</div>
									</div>
									<div className="">
										<div style={{ fontSize: 14 }}>City</div>
										<div
											style={{ fontSize: 16 }}
											className="font-bold turncate break-word capitalize"
										>
											{student?.city?.name}
										</div>
									</div>
									<div className="">
										<div style={{ fontSize: 14 }}>Zipcode</div>
										<div
											style={{ fontSize: 16 }}
											className="font-bold turncate break-word capitalize"
										>
											{student?.zip_code}
										</div>
									</div>
								</div>
							)}
						</div>
					</div>

					<div className="P-m">
						<div className="stdinfo flex items-center flex-nowrap justify-between mx-auto">
							<span className="personal-hd text-2xl self-end font-extrabold ">
								<h1 className="hd-main">Medical</h1>
							</span>
							<div className="personal-button flex justify-between">
								<span className="mx-4">
									<CustomButton
										variant="secondary"
										height="46"
										width="100px"
										fontSize="15px"
										onClick={goToEditMedications}
										disabled={isLoading}
									>
										<FontAwesomeIcon icon={faEdit} />
										<span> Edit </span>
									</CustomButton>
								</span>
							</div>
						</div>
						<div className="per-detail bg-white mx-auto">
							{isLoading ? (
								<div className="flex align-center justify-center">
									<CircularProgress size={35} />
								</div>
							) : (
								<>
									<div className="grid grid-cols-3">
										<div className="flex flex-col items-start medical-info-1">
											<div>Allergies</div>
											<div className="font-bold" style={{ fontSize: 16 }}>
												{student?.allergies ||
													`${student?.first_name} ${student?.last_name} has no allergies`}
											</div>
										</div>
										<div className="flex flex-col items-start medical-info-2">
											<div>Doctor</div>
											<div className="font-bold" style={{ fontSize: 16 }}>
												{student?.doctor?.name ||
													`${student?.first_name} ${student?.last_name} has no Doctor on record`}
											</div>
										</div>
										<div className="flex flex-col items-start medical-info-1">
											<div>Medical Condition</div>
											<div className="font-bold" style={{ fontSize: 16 }}>
												{student?.is_medical_condition === 1
													? 'Yes'
													: `${student?.first_name} ${student?.last_name} has no medical condition on record`}
											</div>
										</div>
									</div>
									<div className="flex">
										<div className="flex flex-col items-start mt-32">
											<div>Description</div>
											<div className="font-bold" style={{ fontSize: 16 }}>
												{student.is_medical_condition ? student.description || 'N/A' : 'N/A'}
											</div>
										</div>
									</div>
									<hr className="mt-32" style={{ color: 'lightgrey' }} />
									<div className="mt-20">
										<div className="bg-blue-100 px-40 pr-0 py-12 flex justify-between">
											<div className="font-bold med-table-headers w-2/6">Medication</div>
											<div className="font-bold med-table-headers w-2/6">Frequency</div>
											<div className="font-bold med-table-headers w-2/6">Start Date</div>
											<div className="font-bold med-table-headers w-1/6">End Date</div>
										</div>
										{student?.is_medical_condition === 1 ? (
											student?.medications.length ? (
												student?.medications.map((medication) => {
													return (
														<>
															<div className="mt-10 px-40 pr-0 py-12 flex justify-between">
																<div className="w-2/6">{medication.name}</div>
																<div className="w-2/6">{medication.frequency}</div>
																<div className="w-2/6">{medication.start_date}</div>
																<div className="w-1/6">{medication.end_date}</div>
															</div>
															<hr className="mt-20" style={{ color: 'lightgrey' }} />
														</>
													);
												})
											) : (
												<div className="flex justify-center mt-20 font-bold text-lg">
													No Medication
												</div>
											)
										) : (
											<div className="flex justify-center mt-20 font-bold text-lg">
												No Medical Condition
											</div>
										)}
									</div>
								</>
							)}
						</div>
					</div>

					<div className="P-m stdinfo flex justify-between mx-auto">
						<div style={{ width: '48%' }}>
							<div className="flex items-center flex-nowrap justify-between mx-auto">
								<span className="text-2xl self-end font-extrabold ">
									<h1 className="hd-main">Rooms</h1>
								</span>
								<div className="flex justify-between">
									<span className="mx-4">
										<CustomButton
											variant="secondary"
											height="46"
											width="100px"
											fontSize="15px"
											disabled={isLoading}
											onClick={() => handleHomeRoomDialog(student)}
										>
											<FontAwesomeIcon icon={faEdit} />
											<span> Edit </span>
										</CustomButton>
									</span>
								</div>
							</div>
							<div className="flex items-center flex-nowrap  mx-auto bg-white p-32">
								{isLoading ? (
									<div className="flex align-center justify-center">
										<CircularProgress size={35} />
									</div>
								) : (
									<div className="room-detail">
										<h4>Homeroom</h4>
										<div className="text-2xl mt-2 font-bold capitalize" style={{ fontSize: 17 }}>
											{student?.home_room?.name || 'No Homeroom set'}
										</div>
									</div>
								)}
							</div>
						</div>
						<div style={{ width: '48%' }}>
							<div className="flex items-center flex-nowrap justify-between mx-auto">
								<span className="text-2xl self-end font-extrabold ">
									<h1 className="hd-main">Official Documents</h1>
								</span>
								<span>
									<div>
										<CustomButton
											variant="secondary"
											height="46"
											width="180px"
											fontSize="15px"
											disabled={isLoading}
											onClick={openAttachmentModal}
										>
											<FontAwesomeIcon icon={faPlus} />
											<span className="addstd"> Add an attachment </span>
										</CustomButton>
									</div>
								</span>
							</div>
							<div
								className={`flex flex-col mx-auto bg-white ${isFileLoading && 'justify-center'}`}
								style={{ minHeight: '110px' }}
							>
								{isLoading || isFileLoading ? (
									<div className="flex align-center justify-center">
										<CircularProgress size={35} />
									</div>
								) : (
									<>
										<div>
											<div className="bg-blue-100 px-40 py-12 flex justify-between">
												<div className="font-bold med-table-headers w-1/4">Category</div>
												<div className="font-bold med-table-headers w-1/4">File Name</div>
												<div className="font-bold med-table-headers w-1/4">Expiry Date</div>
												<div className="font-bold med-table-headers w-1/4">Attachment</div>
											</div>
											<div style={{ maxHeight: 300, overflow: 'auto' }}>
												{student?.attachments.length ? (
													student?.attachments?.map((attachment) => {
														return (
															<>
																<div
																	className="mx-8 px-32 py-8 flex justify-between items-center"
																	style={{ gap: 20 }}
																>
																	<div className="w-1/4 truncate">
																		{attachment?.category}
																	</div>
																	<div className="w-1/4 truncate">
																		{attachment?.name}
																	</div>
																	<div className="w-1/4 truncate">
																		{attachment?.expiry_date ? (
																			<div className="w-1/4">
																				{dayjs(
																					new Date(attachment?.expiry_date)
																				).format('MMM DD, YYYY')}
																			</div>
																		) : (
																			<div className="w-1/4 pick-center">-</div>
																		)}
																	</div>
																	<div className="w-1/4 relative">
																		<a
																			href={attachment.file}
																			target="_blank"
																			rel="noopener noreferrer"
																		>
																			<img
																				style={{
																					width: '30px',
																					marginTop: '-5px',
																				}}
																				src="assets/images/pdf-icon.png"
																				className="cursor-pointer mx-auto"
																				alt="file"
																			/>
																		</a>
																		<div
																			className="remove-attachment"
																			onClick={() =>
																				handleRemoveAttachment(attachment.id)
																			}
																		>
																			x
																		</div>
																	</div>
																</div>
																<hr className="mx-8" style={{ color: 'lightgrey' }} />
															</>
														);
													})
												) : (
													<div className="flex justify-center mt-20 font-bold text-lg">
														No Attachment
													</div>
												)}
											</div>
										</div>
									</>
								)}
							</div>
						</div>
					</div>
					<div className="contact-detail">
						<div className="stdinfo flex items-center flex-nowrap justify-between mx-auto">
							<span className="text-2xl self-end">
								<h1 className="hd-main">Contacts</h1>
							</span>
							<div className="personal-button flex justify-between">
								<span className="mx-4 addplus">
									<CustomButton
										variant="secondary"
										height="46"
										width="174px"
										fontSize="15px"
										disabled={isLoading}
										onClick={() => goToAddEditContact(0)}
									>
										<FontAwesomeIcon icon={faPlus} />
										<span className="addstd"> Add a Contact </span>
									</CustomButton>
								</span>
							</div>
						</div>
						<div className="contact-table">
							<TableContainer>
								<Table stickyHeader className={` table-1366x657`} aria-label="simple table">
									<TableHead>
										<TableRow>
											<TableCell
												className="bg-white school-table-header"
												style={{ width: '15%' }}
											>
												Contact
											</TableCell>
											<TableCell
												className="bg-white school-table-header"
												style={{ width: '15%' }}
											>
												Email
											</TableCell>
											<TableCell
												className="bg-white school-table-header"
												style={{ width: '15%' }}
											>
												Phone
											</TableCell>
											<TableCell
												className="bg-white school-table-header"
												style={{ width: '15%' }}
											>
												Emergency Contact
											</TableCell>
											<TableCell
												className="bg-white school-table-header"
												style={{ width: '10%' }}
												align="center"
											>
												Can pickup
											</TableCell>
											<TableCell
												className="bg-white school-table-header action-div"
												style={{ width: '23%' }}
											>
												Checkin code
											</TableCell>
											{/* <TableCell className="bg-white" style={{ width: '10%' }} align="center" /> */}
											<TableCell
												className="bg-white school-table-header action-div"
												style={{ width: '7%' }}
											>
												Action
											</TableCell>
										</TableRow>
									</TableHead>
									<TableBody>
										{isLoading ? (
											<TableRow>
												<TableCell align="center" colSpan={8}>
													<CircularProgress size={35} />
												</TableCell>
											</TableRow>
										) : (
											<>
												{student?.parents
													.concat(student.approved_pickups)
													?.map((familie, index) => (
														<TableRow key={familie.id}>
															<TableCell style={{ fontWeight: 700 }}>
																<div className="grid grid-cols-2 auto-col-min auto-row-min">
																	<div className="flex items-center">
																		<Avatar
																			className="mr-4"
																			alt="parent-face"
																			src={familie.photo}
																		/>
																		<div className="flex flex-col items-center">
																			<div className="parent-name truncate ">
																				{familie.first_name} {familie.last_name}
																			</div>
																			<div className="parent-relation self-start truncate std-parent">
																				{familie.relation_with_child}
																			</div>
																		</div>
																	</div>
																</div>
															</TableCell>
															<TableCell className="break-all">{familie.email}</TableCell>
															<TableCell>{familie.phone}</TableCell>
															<TableCell>
																{familie?.emergency_contact === true ? 'Yes' : 'No'}
															</TableCell>
															<TableCell className="pick-center">
																{familie.can_pickup ? 'Yes' : 'No'}
															</TableCell>
															<TableCell>
																<div className="flex items-center">
																	{hiddenCodes[index]
																		? familie.parent_schools[0].checkin_code
																				.split('')
																				.map(() => '*')
																				.join('')
																		: familie.parent_schools[0].checkin_code}
																	<IconButton
																		onClick={() => handleCheckInCodeShowHide(index)}
																	>
																		{hiddenCodes[index] ? (
																			<VisibilityOffOutlined />
																		) : (
																			<VisibilityOutlined />
																		)}
																	</IconButton>
																	<div className="flex justify-center">
																		{familie.parent_schools[0]
																			.checkin_code_request ? (
																			changeCodeLoader[index] ? (
																				<div className="flex align-center justify-center">
																					<CircularProgress size={35} />
																				</div>
																			) : (
																				<CustomButton
																					variant="primary"
																					type="submit"
																					width="140px"
																					height="30px"
																					fontSize="11px"
																					onClick={() =>
																						changeCode(familie.id, index)
																					}
																				>
																					Change Checkin Code
																				</CustomButton>
																			)
																		) : (
																			<span />
																		)}
																	</div>
																</div>
															</TableCell>
															<TableCell component="th" scope="row">
																<div className="flex justify-between items-end">
																	<IconButton
																		size="small"
																		onClick={() => goToAddEditContact(1, familie)}
																	>
																		<img
																			src="assets/images/circle-edit.png"
																			alt="edit"
																			width="25px"
																		/>
																	</IconButton>
																	{familie.verified_at === null ? (
																		<IconButton
																			size="small"
																			onClick={() => handledelete(familie)}
																		>
																			<img
																				src="assets/images/dlt.png"
																				alt="edit"
																				width="25px"
																			/>
																		</IconButton>
																	) : (
																		<></>
																	)}
																</div>
															</TableCell>
														</TableRow>
													))}
											</>
										)}
									</TableBody>
								</Table>
							</TableContainer>
						</div>
					</div>
					<div className="P-m">
						<div className="immunization  items-center flex-nowrap  mx-auto">
							<h4 className="hd-main">Immunizations</h4>
							<p>
								Immunizations tracks past student immunization dates and calculates overdue and due
								vaccines based on CDC recommendations.
							</p>
							<div className="flex items-start">
								<div className="box-imm flex items-center flex-nowrap justify-between mx-auto mr-44">
									<h3 className="space-btm hd-two">CDC Recommendations</h3>
									<div className="recomd-imm">
										<div className="flex mb-10" style={{ gap: 30 }}>
											<div className="font-bold mr-10 mb-4">
												<span className="bg-red rounded-full py-4 px-12 text-white font-extrabold mr-4">
													!
												</span>
												{overDue.filter((item) => item.count !== 0).length} Overdue
											</div>
											<div>
												<p className="px-16 ml-32" style={{ paddingTop: 0, paddingBottom: 10 }}>
													{overDue.map((item) => {
														if (item.count !== 0) {
															return (
																<>
																	{item.name}: {item.count}
																	{item.count === 1 ? ' dose ' : ' doses '} over due
																	<br />
																</>
															);
														}
														return '';
													})}
													{overDue.filter((item) => item.count !== 0).length === 0
														? 'No over due doses'
														: ''}
												</p>
											</div>
										</div>
										<div className="flex mt-10" style={{ gap: 63 }}>
											<div className="font-bold mr-10">
												<span className="bg-green rounded-full py-4 px-6 text-white font-extrabold mr-4">
													<i className="fas fa-check" />
												</span>
												{due.length} Due
											</div>
											<div>
												<p className="px-16 ml-32" style={{ paddingTop: 0, paddingBottom: 10 }}>
													{due.map((item) => (
														<>
															{item}
															<br />
														</>
													))}
													{due.length === 0 ? 'No dose due' : ''}
												</p>
											</div>
										</div>
									</div>
								</div>
								<div className="box-imm flex items-center flex-nowrap justify-between mx-auto">
									<div className="flex items-center flex-nowrap justify-between mx-auto">
										<span className="self-end">
											<h3 className=" self-end flex justify-between hd-two">Notes</h3>
										</span>
										{isEditing ? (
											!isSaving ? (
												<div className="btnss">
													<span>
														<CustomButton
															variant="secondary"
															onClick={() => {
																setIsEditing(false);
																setNotes({
																	student_exempt: student.student_exempt,
																	notes: student.notes,
																});
															}}
														>
															Cancel
														</CustomButton>
													</span>
													<span className="mr-4">
														<CustomButton
															variant="primary"
															onClick={() => {
																const form = { ...student, ...notes };
																setIsSaving(true);
																if (!form.notes) {
																	delete form.notes;
																}
																updateStudent(student.id, {
																	...form,
																	is_medical_condition:
																		form.is_medical_condition || '',
																	allergies: student.allergies || '',
																	medications: student.medications || '',
																	address1: student.address1 || '',
																	address2: student.address2 || '',
																	zip_code: student.zip_code || 0,
																})
																	.then((res) => {
																		setIsSaving(false);
																		setIsEditing(false);
																		setRefresh(refresh + 1);
																	})
																	.catch((err) => setIsSaving(false));
															}}
														>
															Save
														</CustomButton>
													</span>
												</div>
											) : (
												<div className="flex align-center justify-center">
													<CircularProgress size={35} />
												</div>
											)
										) : (
											<></>
										)}
										<div className="personal-button flex justify-between">
											{!isEditing ? (
												<CustomButton
													variant="secondary"
													disabled={isLoading}
													onClick={() => {
														setIsEditing(true);
													}}
												>
													<span>
														{' '}
														<FontAwesomeIcon icon={faEdit} />{' '}
													</span>
													<span> Edit </span>
												</CustomButton>
											) : (
												''
											)}
										</div>
									</div>
									<div className="recomd notesrecord">
										{isLoading ? (
											<div className="flex align-center justify-center">
												<CircularProgress size={35} />
											</div>
										) : (
											<div>
												<h4 className="font-bold text-lg">Student Exempt</h4>
												<h6 className="font-bold text-base">
													{student?.student_exempt ? 'Yes' : 'No'}
												</h6>
												<br />
												<h4>Notes</h4>
												{!isEditing ? (
													<TextareaAutosize
														disabled
														style={{ width: 450, height: 45 }}
														onChange={(e) => setNotes({ ...notes, notes: e.target.value })}
														value={
															notes.notes ||
															`${student?.first_name} ${student?.last_name} has no notes on record.`
														}
													/>
												) : (
													<TextareaAutosize
														className="notes-textarea"
														disabled={isSaving}
														style={{ height: 49, width: 450, lineheight: 19 }}
														onChange={(e) => setNotes({ ...notes, notes: e.target.value })}
														value={notes.notes || ''}
													/>
												)}
											</div>
										)}
									</div>
								</div>
							</div>
						</div>
					</div>
					<div className="P-m Immunizations-inner">
						<Box className=" mx-auto pb-10">
							<div className="w-full flex justify-between  mx-auto">
								<h4 className="hd-main">Immunizations</h4>
								<div>
									<IconButton
										className="mr-4"
										size="small"
										disabled={isLoading}
										onClick={() => handleImmunizationFilter(immunizations)}
									>
										<img
											src="assets/images/setting-icon.png"
											alt="filter"
											width="35px"
											className="fiterimg"
										/>
									</IconButton>
									{isEditingDates ? (
										<CustomButton variant="primary" onClick={handleImmunizationSave}>
											Done
										</CustomButton>
									) : (
										<CustomButton
											variant="secondary"
											height="39px"
											width="140px"
											fontSize="15px"
											disabled={isLoading}
											onClick={() => setIsEditingDates(true)}
										>
											<div className="flex justify-center items-center">
												<FontAwesomeIcon icon={faEdit} />
												<span className="spacebtn">Edit All Dates</span>
											</div>
										</CustomButton>
									)}
								</div>
							</div>
						</Box>
						<Box className="bg-white p-12 w-5/6 mx-auto mb-44 Immunizations-table">
							<table style={{ width: '100%' }}>
								<thead>
									<tr style={{ borderBottom: '1px solid #DBDBDB' }}>
										{!isEditingDates ? <th style={{ style: '25%' }} /> : ''}
										<th
											style={{
												width: '15%',
												height: '55px',
												color: '#002E6C',
												fontWeight: '700',
											}}
										>
											Dose 1
										</th>
										<th
											style={{
												width: '15%',
												height: '55px',
												color: '#002E6C',
												fontWeight: '700',
											}}
										>
											Dose 2
										</th>
										<th
											style={{
												width: '15%',
												height: '55px',
												color: '#002E6C',
												fontWeight: '700',
											}}
										>
											Dose 3
										</th>
										<th
											style={{
												width: '15%',
												height: '55px',
												color: '#002E6C',
												fontWeight: '700',
											}}
										>
											Dose 4
										</th>
										<th
											style={{
												width: '15%',
												height: '55px',
												color: '#002E6C',
												fontWeight: '700',
											}}
										>
											Dose 5
										</th>
									</tr>
								</thead>
								<tbody>
									<tr style={{ columnSpan: 6 }} className="age-height	">
										<td style={{ color: '#06071D', fontWeight: '800' }}>
											Student age:
											{generateAgeString(student?.date_of_birth)}
										</td>
									</tr>
									{student?.immunizations
										?.filter((imm) => imm.is_enabled)
										.map((immu, i) => {
											return (
												<React.Fragment key={immu.id}>
													<tr className="bg-blue-200 tr-blue">
														<td
															className="p-8"
															colSpan="6"
															style={{ color: '#06071D', fontWeight: '800' }}
														>
															<div className="flex items-center justify-between">
																<div>{immu.immunization.name}</div>
																{isEditingDates && (
																	<div
																		style={{ gap: 20 }}
																		className="flex items-center align-center"
																	>
																		{immu.is_exempted ? (
																			<FormControl className="font-normal">
																				<Select
																					name="reason"
																					id="reason"
																					placeholder="Exempt Reason"
																					defaultValue="0"
																					value={immu.exempt_reason || '0'}
																					onClick={(e) => {
																						const temp = [
																							...modifiedImmunizations,
																						];
																						const index = temp.findIndex(
																							(item) =>
																								item.id === immu.id
																						);
																						temp[index].exempt_reason =
																							e.target.value;
																						setModifiedImmunizations(temp);
																					}}
																				>
																					<MenuItem value="0" disabled>
																						Exempt Reason
																					</MenuItem>
																					<MenuItem value="medical">
																						Medical
																					</MenuItem>
																					<MenuItem value="personal-believe">
																						Personal believe
																					</MenuItem>
																					<MenuItem value="immue">
																						Immune
																					</MenuItem>
																					<MenuItem value="unknown">
																						Unknown
																					</MenuItem>
																					<MenuItem value="other">
																						Other
																					</MenuItem>
																				</Select>
																			</FormControl>
																		) : (
																			''
																		)}
																		<div
																			className="flex items-center cursor-pointer"
																			style={{ gap: 10 }}
																			onClick={() => handleExempt(immu, i)}
																		>
																			<div
																				className="tick-wrapper-edit-dates"
																				style={{
																					backgroundColor: immu.is_exempted
																						? '#4DA0EE'
																						: 'white',
																				}}
																			>
																				<i className="fas fa-check" />
																			</div>
																			<div className="font-bold">Exempt</div>
																		</div>
																	</div>
																)}
															</div>
														</td>
													</tr>
													{isEditingDates && !immu.is_exempted ? (
														<tr>
															{modifiedImmunizations[
																modifiedImmunizations?.findIndex(
																	(item) => item.id === immu.id
																)
															]?.meta.map((dose, ind) => {
																return dose.skip ? (
																	<td>
																		<SkippedDate
																			setModifiedImmunizations={
																				setModifiedImmunizations
																			}
																			modifiedImmunizations={
																				modifiedImmunizations
																			}
																			doseIndex={ind}
																			immuIndex={i}
																		/>
																	</td>
																) : (
																	<td>
																		<EditImmunizationDateDiv
																			setModifiedImmunizations={
																				setModifiedImmunizations
																			}
																			modifiedImmunizations={
																				modifiedImmunizations
																			}
																			doseIndex={ind}
																			immuIndex={i}
																			studentAge={student?.date_of_birth}
																		/>
																	</td>
																);
															})}
															{[1, 2, 3, 4, 5]
																.slice(0, 5 - immu.meta.length)
																.map((num) => {
																	return (
																		<td>
																			<EditImmunizationDateDiv disabledDiv />
																		</td>
																	);
																})}
														</tr>
													) : isEditingDates && immu.is_exempted ? (
														<div className="py-28 px-6">Uncheck exempt to add dates.</div>
													) : (
														<>
															<tr className="records">
																<td
																	className="p-8 "
																	style={{ color: '#06071D', fontWeight: '800' }}
																>
																	Student Records
																</td>
																{immu.is_exempted ? (
																	<>
																		<td
																			className="p-8 text-center"
																			style={{
																				backgroundColor: '#FFF8C7',
																				fontWeight: '600',
																				fontSize: '15px',
																			}}
																		>
																			Exempt
																		</td>
																		<td
																			className="p-8"
																			colSpan={4}
																			style={{ backgroundColor: '#FFF8C7' }}
																		/>
																	</>
																) : (
																	immu.meta.map((dose) => {
																		if (dose.is_recurring === '1') {
																			return (
																				<td
																					style={{
																						fontWeight: '600',
																						fontSize: '15px',
																					}}
																					className="p-8 text-center"
																				/>
																			);
																		}
																		if (dose.skip) {
																			return (
																				<td
																					style={{
																						fontWeight: '600',
																						fontSize: '15px',
																					}}
																					className="p-8 text-center"
																				>
																					Skipped
																				</td>
																			);
																		}
																		return (
																			<td
																				className="p-8 text-center"
																				style={{
																					backgroundColor: dose.date
																						? 'white'
																						: age?.allMonths <=
																						  dose.max_duration
																						? '#DFFFED'
																						: '#FFEBEA',
																					fontWeight: '600',
																					fontSize: '15px',
																				}}
																			>
																				{dose.date
																					? dayjs(dose.date).format(
																							'MM/DD/YYYY'
																					  )
																					: age?.allMonths <= dose.max_duration
																					? 'Due'
																					: 'Overdue'}
																			</td>
																		);
																	})
																)}
															</tr>

															<tr className="records-second">
																<td
																	className="p-8"
																	style={{ color: '#06071D', fontWeight: '800' }}
																>
																	CDC Recommendation
																</td>
																{immu.meta.map((dose) => {
																	return (
																		<td
																			className="p-8 text-center"
																			style={{
																				color: '#06071D',
																				fontWeight: '600',
																				fontSize: '15px',
																			}}
																		>
																			{dose.duration_text}
																		</td>
																	);
																})}
															</tr>
														</>
													)}
												</React.Fragment>
											);
										})}
								</tbody>
							</table>
						</Box>
					</div>
				</div>
			</FuseScrollbars>
		</>
	);
}

export default StudentInformation;

const EditImmunizationDateDiv = ({
	modifiedImmunizations,
	setModifiedImmunizations,
	immuIndex,
	doseIndex,
	disabledDiv,
	studentAge,
}) => {
	const [disabled, setDisabled] = useState(!!doseIndex);

	useEffect(() => {
		let t = false;
		for (let i = 0; i < doseIndex; i += 1) {
			if (
				modifiedImmunizations[immuIndex]?.meta[i].date === null &&
				!modifiedImmunizations[immuIndex]?.meta[i].skip
			) {
				t = true;
				break;
			}
		}
		setDisabled(t);
	}, [modifiedImmunizations]);

	const handleSkip = () => {
		if (disabledDiv) {
			return;
		}
		if (doseIndex !== 0) {
			if (
				modifiedImmunizations[immuIndex].meta[doseIndex - 1].date === null &&
				!modifiedImmunizations[immuIndex].meta[doseIndex - 1].skip
			) {
				return;
			}
		}
		const temp = [...modifiedImmunizations];
		temp[immuIndex].meta[doseIndex].skip = 1;
		setModifiedImmunizations(temp);
	};
	const handleDateChange = (date) => {
		const temp = [...modifiedImmunizations];
		temp[immuIndex].meta[doseIndex].date = date ? dayjs(date).format('YYYY-MM-DD') : '';
		setModifiedImmunizations(temp);
	};
	return (
		<div className="flex flex-col align-left p-16 pr-20" style={{ gap: 20 }}>
			<CustomDatePicker
				value={disabledDiv ? '' : modifiedImmunizations[immuIndex].meta[doseIndex].date}
				setValue={handleDateChange}
				label="Date"
				disabled={disabled || disabledDiv}
				minDate={
					!disabledDiv
						? doseIndex === 0
							? studentAge
							: modifiedImmunizations[immuIndex].meta[doseIndex - 1].skip
							? studentAge
							: modifiedImmunizations[immuIndex].meta[doseIndex - 1].date
						: 0
				}
				disableFuture
			/>
			<div className="flex items-center cursor-pointer" style={{ gap: 10 }} onClick={handleSkip}>
				<div className="tick-wrapper-edit-dates">
					<i className="fas fa-check" />
				</div>
				<div>Skip</div>
			</div>
		</div>
	);
};

const SkippedDate = ({ modifiedImmunizations, setModifiedImmunizations, immuIndex, doseIndex }) => {
	const handleNotSkip = () => {
		const temp = [...modifiedImmunizations];
		temp[immuIndex].meta[doseIndex].skip = 0;
		setModifiedImmunizations(temp);
	};

	return (
		<div className="flex items-center align-left py-20">
			<div className="flex items-center cursor-pointer" onClick={handleNotSkip} style={{ gap: 10 }}>
				<div className="tick-wrapper-edit-dates" style={{ background: '#4DA0EE' }}>
					<i className="fas fa-check" />
				</div>
				<div>Skipped</div>
			</div>
		</div>
	);
};
