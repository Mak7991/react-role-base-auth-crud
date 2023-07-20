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
import '../addSchoolAdmin/addSchoolAdmin.css';
import CustomButton from 'app/customComponents/CustomButton/CustomButton';
import * as Actions from 'app/store/actions';
import { useParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import FuseScrollbars from '@fuse/core/FuseScrollbars';
import { getSubAdminById } from '../../../../services/subSchoolAdmin/SubSchoolAdmin';

const useStyles = makeStyles({
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
	},
	formControl: {
		// margin: theme.spacing(1),

		minWidth: 500,
		maxWidth: 500
	},
	content: {
		position: 'relative',
		display: 'flex',
		overflow: 'auto',
		flex: '1 1 auto',
		flexDirection: 'column',
		width: '100%',
		'-webkit-overflow-scrolling': 'touch',
		zIndex: 2
	}
});
export default function AddSchoolAdminProfile(props) {
	const classes = useStyles();
	// console.log(props);
	// const { row } = history.location.state;
	const params = useParams();
	const dispatch = useDispatch();

	// const dispatch = useDispatch();
	const [errTxts, setErrTxts] = useState({});
	const [form, setForm] = useState({});
	const [row, setRow] = useState({
		first_name: '',
		last_name: '',
		email: '',
		phone: ''
	});
	const [isLoading, setIsLoading] = useState(false);
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
		const id = setTimeout(() => {
			getSubAdminById(params?.id)
				.then(res => {
					setSelected(res.data.permissions);
					setRow({
						first_name: res.data.first_name,
						last_name: res.data.last_name,
						email: res.data.email,
						phone: res.data.phone
					});
					setPreview(res?.data?.photo);
					setIsLoading(true);
				})
				.catch(err => {
					dispatch(
						Actions.showMessage({
							message: 'Failed to fetch subadmins, please refresh',
							variant: 'error'
						})
					);
					setIsLoading(true);
				});
		}, 1000);

		return () => clearTimeout(id);
	}, [params?.id]);
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
							<h2 className="font-bold">View School Admin</h2>
						</div>
						<div className="bg-white rounded-12 form-admin-main-div">
							{!isLoading ? (
								<div className="flex justify-center">
									<CircularProgress className="mx-auto" />
								</div>
							) : (
								<div className="form-admin-inner-div">
									<div className="flex-shrink-0 " style={{ marginBottom: '20px' }}>
										<span className="font-bold" style={{ fontSize: '18px' }}>
											Admin Information
										</span>
									</div>
									<div className="bg-white rounded mx-auto" style={{ paddingBottom: '70px' }}>
										<div className="profile-div">
											<div
												// onClick={() => inputRef.current.click()}
												// id="upload-img"
												className="profile-image-div"
											>
												<Avatar
													className="profile-image"
													src={preview}
													style={{ width: 160, height: 160 }}
												/>
											</div>

											<div
												className="grid grid-cols-2 view-subadmin"
												style={{ columnGap: 100, rowGap: 40 }}
											>
												<TextField
													value={row?.first_name}
													InputLabelProps={{
														style: { color: 'black', fontSize: '18px' }
													}}
													style={{ width: '100%' }}
													name="first_name"
													label="First Name"
													InputProps={{ disableUnderline: true }}
													disabled
												/>
												<TextField
													value={row?.last_name}
													InputLabelProps={{
														style: { color: 'black', fontSize: '18px' }
													}}
													style={{ width: '100%' }}
													name="last_name"
													label="Last Name"
													InputProps={{ disableUnderline: true }}
													disabled
												/>
												<TextField
													value={row?.email}
													InputLabelProps={{
														style: { color: 'black', fontSize: '18px' }
													}}
													style={{ width: '100%' }}
													name="email"
													label="Email Address"
													InputProps={{ disableUnderline: true }}
													disabled
												/>
												<TextField
													value={row?.phone}
													InputLabelProps={{
														style: { color: 'black', fontSize: '18px' }
													}}
													style={{ width: '100%' }}
													name="phone"
													label="Contact Number"
													InputProps={{ disableUnderline: true }}
													disabled
												/>
												<div className="">
													<div className="rp-input">Roles/Permission</div>
													<div className="font-bold turncate break input-bottom text-input">
														{selected
															?.map(roles => roles?.name?.split('_')?.join(' '))
															.join(', ')}
													</div>
													{/* <hr style={{ color: '#D3D3D3' }} /> */}
												</div>
											</div>
										</div>
									</div>
								</div>
							)}
						</div>
					</div>
				</div>
			</FuseAnimate>
		</FuseScrollbars>
	);
}
