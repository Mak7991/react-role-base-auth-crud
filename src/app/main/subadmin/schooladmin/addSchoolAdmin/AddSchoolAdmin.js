import React, { useEffect, useState, useRef } from 'react';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import FuseAnimate from '@fuse/core/FuseAnimate';
import {
	Avatar,
	Button,
	Checkbox,
	CircularProgress,
	FormControl,
	FormHelperText,
	InputLabel,
	ListItemIcon,
	ListItemText,
	MenuItem,
	Select,
	TextField
} from '@material-ui/core';
import history from '@history';
import './addSchoolAdmin.css';
import CustomButton from 'app/customComponents/CustomButton/CustomButton';
import { useDispatch, useSelector } from 'react-redux';
import * as Actions from 'app/store/actions';
import { uploadFile } from 'app/services/imageUpload/imageUpload';
import FuseScrollbars from '@fuse/core/FuseScrollbars';
import { getAllPermission, addSubAdmin } from '../../../../services/subSchoolAdmin/SubSchoolAdmin';
import { getImageUrl } from 'utils/utils';

const useStyles = makeStyles({
	content: {
		position: 'relative',
		display: 'flex',
		overflow: 'auto',
		flex: '1 1 auto',
		flexDirection: 'column',
		width: '100%',
		'-webkit-overflow-scrolling': 'touch',
		zIndex: 2
	},
	root: {
		color: 'white'
	},
	select: {
		'&:before': {
			borderBottom: 'none'
		},
		'&:after': {
			borderBottom: 'none'
		},
		'&:not(.Mui-disabled):hover::before': {
			borderBottom: 'none'
		},
		'& .MuiSelect-select:focus': {
			backgroundColor: 'inherit'
		}
	},
	icon: {
		fill: 'white'
	}
});
export default function AddSchoolAdminProfile() {
	const classes = useStyles();
	const schoolId = useSelector(({ auth }) => auth?.user?.school?.id);
	const authRole = useSelector(({ auth }) => auth?.user);
	const dispatch = useDispatch();
	const [errTxts, setErrTxts] = useState({});
	const [form, setForm] = useState({});
	const [isAdding, setIsAdding] = useState(false);
	const [roles, setRoles] = useState([]);
	const [rolesPage, setRolesPage] = useState(1);
	const [selected, setSelected] = useState([]);
	const [preview, setPreview] = useState(null);
	const [selectedFile, setSelectedFile] = useState(null);

	const inputRef = useRef(null);

	const isAllSelected = roles.length > 0 && selected.length === roles.length;
	const ITEM_HEIGHT = 48;
	const ITEM_PADDING_TOP = 8;
	const MenuProps = {
		PaperProps: {
			style: {
				maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
				width: 250
			}
		},
		getContentAnchorEl: null,
		anchorOrigin: {
			vertical: 'bottom',
			horizontal: 'center'
		},
		transformOrigin: {
			vertical: 'top',
			horizontal: 'center'
		},
		variant: 'menu'
	};

	useEffect(() => {
		getAllPermission()
			.then(res => {
				console.log(res);
				setRoles(res.data.data);
				setSelected(res.data.data);
				setForm({ ...form, permissions: res.data.data });
			})
			.catch(err => {
				dispatch(
					Actions.showMessage({
						message: 'Failed to fetch data, please refresh',
						variant: 'error'
					})
				);
			});
	}, []);

	useEffect(() => {
		if (!selectedFile) {
			setPreview(null);
			return;
		}

		const objectUrl = URL.createObjectURL(selectedFile);
		setPreview(objectUrl);

		return () => URL.revokeObjectURL(objectUrl);
	}, [selectedFile]);

	const handleChange = (e, val) => {
		const { name, value } = e.target;
		setErrTxts({ ...errTxts, [name]: '' });
		// setForm({ ...form, [name]: value });
		// console.log(value);

		if (name === 'permissions') {
			// const setPer = val?.props?.value;
			// const perfilter = selected.some(item => item.id === setPer?.id);

			// if (!perfilter) {
			// 	setSelected(prev => [...prev, setPer]);
			// } else {
			// 	setSelected(prev => prev.filter(item => item.id !== setPer.id));
			// }
			setSelected(value);
			setForm({ ...form, [name]: value });
		} else {
			setForm({ ...form, [name]: value });
		}
		if (name === 'permissions' && value[value.length - 1] === 'all') {
			setSelected(selected.length === roles.length ? [] : roles);
			setForm({ ...form, permissions: selected.length === roles.length ? [] : roles });
		}
	};
	console.log(selected, 'selected');

	const onSelectFile = e => {
		if (!e.target.files || e.target.files.length === 0) {
			setSelectedFile(null);
			return;
		}

		setSelectedFile(e.target.files[0]);
	};
	const handleSubmit = ev => {
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
		if (form.permissions.length < 1) {
			setErrTxts({ ...errTxts, permissions: 'This field is required' });
			return;
		}
		// const tempRoomId = form.roles_id;
		// if (form.roles_id[0] === 'all') {
		// 	delete form.roles_id;
		// } else {
		form.permissions = selected.map(roles => roles.id);
		form.paths = selected.map(roles => roles.path);
		form.designation = 'sub_admin';
		form.status = 1;
		if (authRole?.role[0] == 'school_admin') {
			form.school_id = authRole?.data?.school?.id;
		} else {
			form.school_id = schoolId;
		}
		// }
		if (selectedFile) {
			const filename = getImageUrl(selectedFile);
			setIsAdding(true);
			uploadFile(selectedFile, filename).then(response => {
				form.profile_image_url = `${process.env.REACT_APP_S3_BASE_URL}${response}`;
				// form.thumb = `${process.env.REACT_APP_S3_BASE_URL}${response}`;
				addSubAdmin(form)
					.then(resp => {
						dispatch(
							Actions.showMessage({
								message: 'Sub Admin added successfully',
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
									message: 'Failed to Add sub admin.',
									autoHideDuration: 1500,
									variant: 'error'
								})
							);
						}
					})
					.finally(() => setIsAdding(false));
			});
		} else {
			setIsAdding(true);
			addSubAdmin(form)
				.then(resp => {
					dispatch(
						Actions.showMessage({
							message: 'Sub Admin added successfully',
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
								message: 'Failed to Add sub admin.',
								autoHideDuration: 1500,
								variant: 'error'
							})
						);
					}
				})
				.finally(() => setIsAdding(false));
		}
	};

	return (
		<FuseScrollbars className={classes.content} scrollToTopOnRouteChange>
			<FuseAnimate animation="transition.slideLeftIn" duration={600}>
				<div className="add-schoolAdmin-div mx-auto">
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
							<h2 className="font-bold">Add School Admin</h2>
						</div>
						<div className="bg-white rounded-12 form-admin-main-div">
							<div className="form-admin-inner-div">
								<div className="flex-shrink-0 " style={{ marginBottom: '20px' }}>
									<span className="font-bold" style={{ fontSize: '18px' }}>
										Admin Information
									</span>
								</div>
								<div className="bg-white rounded mx-auto" style={{ paddingBottom: '70px' }}>
									<div className="profile-div">
										<div
											onClick={() => inputRef.current.click()}
											// id="upload-img"
											className="profile-image-div"
											// style={{ justifySelf: 'center' }}
										>
											<Avatar
												className="profile-image"
												src={preview}
												style={{ width: 160, height: 160, cursor: 'pointer' }}
											/>
											<div className="schooladmin-pp-overlay">
												<i className="fa fa-2x fa-camera" style={{ cursor: 'pointer' }} />
											</div>
											<input
												onChange={onSelectFile}
												type="file"
												name="image"
												// id="image"
												className="hidden"
												ref={inputRef}
											/>
										</div>

										<div className="grid grid-cols-2" style={{ columnGap: 100, rowGap: 40 }}>
											<TextField
												helperText={errTxts.first_name}
												error={!!errTxts.first_name}
												onChange={handleChange}
												value={form.first_name}
												style={{ width: '100%' }}
												name="first_name"
												label="First Name"
											/>
											<TextField
												helperText={errTxts.last_name}
												error={!!errTxts.last_name}
												onChange={handleChange}
												value={form.last_name}
												style={{ width: '100%' }}
												name="last_name"
												label="Last Name"
											/>
											<TextField
												helperText={errTxts.email}
												error={!!errTxts.email}
												onChange={handleChange}
												value={form.email}
												style={{ width: '100%' }}
												name="email"
												label="Email Address"
											/>
											<TextField
												helperText={errTxts.phone}
												error={!!errTxts.phone}
												onChange={handleChange}
												value={form.phone}
												style={{ width: '100%' }}
												name="phone"
												label="Contact Number"
											/>
											<FormControl
												error={!!errTxts.permissions?.length}
												style={{ width: '100%' }}
												className={`${classes.formControl} student-slt`}
											>
												<InputLabel id="mutiple-select-label">Roles</InputLabel>
												<Select
													labelId="mutiple-select-label"
													multiple
													value={selected}
													error={!!errTxts.permissions?.length}
													helperText={errTxts.permissions}
													name="permissions"
													id="permissions"
													onChange={handleChange}
													renderValue={sel => {
														return sel.length === roles.length
															? 'Select All Roles'
															: sel
																	?.map(roles => roles.name.split('_').join(' '))
																	.join(', ');
													}}
													MenuProps={MenuProps}
												>
													<MenuItem
														value="all"
														classes={{
															root: isAllSelected ? classes.selectedAll : ''
														}}
													>
														<ListItemIcon id="all-roles">
															<Checkbox
																classes={{ indeterminate: classes.indeterminateColor }}
																checked={isAllSelected}
																indeterminate={
																	selected.length > 0 &&
																	selected.length < roles.length
																}
															/>
														</ListItemIcon>
														<ListItemText
															classes={{ primary: classes.selectAllText }}
															primary="Select All"
														/>
													</MenuItem>

													{roles.length ? (
														roles.map(role => {
															return (
																<MenuItem key={role.id} value={role}>
																	<ListItemIcon id={`roles-${role?.id}`}>
																		<Checkbox
																			checked={
																				selected
																					?.map(ro => ro?.id)
																					.indexOf(role?.id) > -1
																			}
																		/>
																	</ListItemIcon>
																	<ListItemText
																		primary={role?.name.split('_').join(' ')}
																	/>
																</MenuItem>
															);
														})
													) : (
														<MenuItem disabled>Loading...</MenuItem>
													)}
												</Select>
												{errTxts.permissions && (
													<FormHelperText>{errTxts.permissions}</FormHelperText>
												)}
											</FormControl>
										</div>
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
												Submit
											</CustomButton>
										</>
									)}
								</div>
							</div>
						</div>
					</div>
				</div>
			</FuseAnimate>
		</FuseScrollbars>
	);
}
