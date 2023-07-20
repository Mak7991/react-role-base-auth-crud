import history from '@history';
import CustomButton from 'app/customComponents/CustomButton/CustomButton';
import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import {
	CircularProgress,
	Avatar,
	IconButton,
	TextField,
	InputAdornment,
	FormControl,
	InputLabel,
	Select,
	MenuItem,
	ListItemIcon,
	Checkbox,
	ListItemText
} from '@material-ui/core';
import Paper from '@material-ui/core/Paper';
import InfiniteScroll from 'react-infinite-scroll-component';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import FuseAnimate from '@fuse/core/FuseAnimate';
import CustomCheckbox from 'app/customComponents/CustomCheckbox/CustomCheckbox';
import TableRow from '@material-ui/core/TableRow';
import './schoolAdmin.css';
import { makeStyles } from '@material-ui/core/styles';
import * as Actions from 'app/store/actions';
import { getAllPermission, getAllSubAdmins } from 'app/services/subSchoolAdmin/SubSchoolAdmin';
import dayjs from 'dayjs';
import DisableConfirmDialog from './DisableCinfirmDialog';

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

		minWidth: 206,
		maxWidth: 206
	}
});

function SchoolAdmin() {
	const dispatch = useDispatch();
	const [searchQuery, setSearchQuery] = useState('');
	const [isLoading, setIsLoading] = useState(false);
	const [rows, setRows] = useState([]);
	const [firstLoad, setFirstLoad] = useState(true);
	const [fetchingMore, setFetchingMore] = useState(false);
	const [hasMore, setHasMore] = useState(false);
	const [page, setPage] = useState(1);
	const [refresh, setRefresh] = useState(false);
	const [selected, setSelected] = useState([]);
	const [roles, setRoles] = useState([]);
	const [form, setForm] = useState({});

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
	const classes = useStyles();

	useEffect(() => {
		getAllPermission()
			.then(res => {
				// console.log(abc);
				setRoles(res.data.data);
				// setSelected(res.data.data);
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

	const gotosubadmininfo = row => {
		history.push({
			pathname: `/subadmin-ViewSchoolAdminProfile/${row.id}`,
			state: { row }
		});
	};

	const goToEditSubAdmin = row => {
		history.push({ pathname: `/subadmin-EditSchoolAdminProfile/${row?.id}`, state: { row } });
	};

	const handleSearch = e => {
		setSearchQuery(e.target.value);
	};

	const handleChange = e => {
		const { name, value } = e.target;
		// setErrTxts({ ...errTxts, [name]: '' });
		// setForm({ ...form, [name]: value });

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
	const handleDisable = (ev, row) => {
		ev.preventDefault();
		dispatch(
			Actions.openDialog({
				children: <DisableConfirmDialog row={row} setRefresh={setRefresh} refresh={refresh} />
			})
		);
	};

	const handleLoadMore = () => {
		const permission = selected.map(item => item.id);
		setFetchingMore(true);
		getAllSubAdmins(searchQuery, page, permission)
			.then(res => {
				if (res.data.last_page > res.data.current_page) {
					setHasMore(true);
				} else {
					setHasMore(false);
				}
				setPage(res.data.current_page + 1);
				setRows(rows.concat(res.data.data));
				setFetchingMore(false);
			})
			.catch(err => {
				setFetchingMore(false);
				dispatch(
					Actions.showMessage({
						message: 'Failed to fetch data, please refresh',
						variant: 'error'
					})
				);
			});
	};

	useEffect(() => {
		const id = setTimeout(
			() => {
				const permission = selected.map(item => item.id);
				setIsLoading(true);
				setFirstLoad(false);
				getAllSubAdmins(searchQuery, 1, permission)
					.then(res => {
						if (res.data.last_page > res.data.current_page) {
							setHasMore(true);
						} else {
							setHasMore(false);
						}
						setPage(res.data.current_page + 1);
						setRows(res.data.data);
					})
					.catch(err => {
						dispatch(
							Actions.showMessage({
								message: 'Failed to fetch data, please refresh',
								variant: 'error'
							})
						);
					})
					.finally(() => {
						setIsLoading(false);
					});
			},
			firstLoad ? 0 : 1000
		);

		return _ => {
			clearTimeout(id);
		};
		// eslint-disable-next-line
	}, [dispatch, searchQuery, refresh, selected]);

	// const handleClick = () => {
	// 	setShowMore(!showMore);
	// };
	const [showMore, setShowMore] = useState(false);
	const numberOfItems = showMore ? rows?.roles?.length : 2;
	return (
		// <FuseAnimate animation="transition.slideLeftIn" duration={600}>
		// 	<div className="admin-cont mx-auto">
		// 		<div className="flex justify-between items-end">

				<FuseAnimate animation="transition.slideLeftIn" duration={600}>
			<div className="student-cont mx-auto">
				<div className="flex items-center flex-nowrap justify-between">

					<span className="text-xl self-end font-bold mr-28">School Admin</span>
					<div className="flex justify-between">
						<div className="flex">
						<TextField
							style={{
								alignSelf: 'center',
								paddingRight: 30,
							    width: 256
							}}
							onChange={handleSearch}
							value={searchQuery}
							id="search"
							label="Search By Name"
							InputProps={{
								endAdornment: (
									<InputAdornment>
										<IconButton
											onClick={() => {
												document.getElementById('search').focus();
											}}
										>
											<img
												alt="search-icon"
												src="assets/images/search-icon.svg"
												height="80%"
												width="80%"
											/>
										</IconButton>
									</InputAdornment>
								)
							}}
						/>
						<div
							className="mx-8"
							style={{
								alignSelf: 'center',
								paddingRight: 30
							}}
						>
							<FormControl className={`${classes.formControl} student-slt`}>
								<InputLabel id="mutiple-select-label">Roles</InputLabel>
								<Select
									labelId="mutiple-select-label"
									multiple
									value={selected}
									name="permissions"
									id="permissions"
									onChange={handleChange}
									renderValue={sel => {
										return sel.length === roles?.length
											? 'Select All Roles'
											: sel?.map(permission => permission?.name.split('_').join(' ')).join(', ');
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
												indeterminate={selected.length > 0 && selected.length < roles.length}
											/>
										</ListItemIcon>
										<ListItemText
											classes={{ primary: classes.selectAllText }}
											primary="Select All"
										/>
									</MenuItem>

									{roles?.length ? (
										roles.map(role => {
											return (
												<MenuItem key={role?.id} value={role}>
													<ListItemIcon id={`roles-${role?.id}`}>
														<Checkbox
															checked={selected?.map(ro => ro?.id).indexOf(role?.id) > -1}
														/>
													</ListItemIcon>
													<ListItemText primary={role?.name.split('_').join(' ')} />
												</MenuItem>
											);
										})
									) : (
										<MenuItem disabled>Loading...</MenuItem>
									)}
								</Select>
							</FormControl>
						</div>
						<div
							style={{
								alignSelf: 'center',
								marginTop: 20
							}}
						>
							<CustomButton
								variant="primary"
								width="100px"
								height="40px"
								fontSize="15px"
								id="add-staff-btn"
								onClick={() => history.push('/subadmin-AddSchoolAdminProfile')}
							>
								+ Add
							</CustomButton>
						</div>
					</div>
				</div>
</div>
				<TableContainer id="Scrollable-table" component={Paper} className="admin-table-cont">
					<Table stickyHeader className="" style={{ width: '100%' }}>
						<TableHead>
							<TableRow>
								<TableCell className="bg-white admin-table-header" style={{ width: '20%' }}>
									Admin Name
								</TableCell>
								<TableCell className="bg-white admin-table-header" style={{ width: '20%' }}>
									Email
								</TableCell>
								<TableCell className="bg-white admin-table-header" style={{ width: '16%' }}>
									Contact Number
								</TableCell>
								<TableCell className="bg-white admin-table-header" style={{ width: '15%' }}>
									Date of Creation
								</TableCell>
								<TableCell className="bg-white admin-table-header" style={{ width: '19%' }}>
									Roles
								</TableCell>
								<TableCell className="bg-white admin-table-header" style={{ width: '27%' }}>
									Actions
								</TableCell>
							</TableRow>
						</TableHead>
						<TableBody className="">
							{isLoading || roles.length <= 0 ? (
								<TableRow>
									<TableCell align="center" colSpan={8}>
										<CircularProgress size={35} />
									</TableCell>
								</TableRow>
							) : !rows.length && !firstLoad ? (
								<TableRow>
									<TableCell align="center" colSpan={8}>
										No School Admin
									</TableCell>
								</TableRow>
							) : (
								rows?.map(row => (
									<TableRow key={row.id}>
										<TableCell>
											<div
												className="flex items-center"
												style={{ gap: 10, cursor: 'pointer' }}
												id={`view-subAdmin-${row?.id}`}
												onClick={() => gotosubadmininfo(row)}
											>
												<Avatar src={row?.photo} />
												<div className="flex flex-col">
													<div className="break-word admin-name">
														{`${row?.first_name} ${row?.last_name}`}
													</div>
												</div>
											</div>
										</TableCell>
										<TableCell>
											<div className="break-all admin-email">{row?.email}</div>
										</TableCell>
										<TableCell>
											<div className="break-word sub-admin-col">{row?.phone}</div>
										</TableCell>
										<TableCell>
											<div className="break-word sub-admin-col">
												{dayjs(row?.created_at).format('MMMM D, YYYY')}
											</div>
										</TableCell>
										<TableCell>
											{/* <div className="break-word">{row.roles}</div> */}
											<div className="break-word sub-admin-col">
												{`${
													row?.permissions?.length > 0
														? row?.permissions
																?.map(item => item?.name)
																?.slice(0, 2)
																?.join(', ')
																?.split('_')
																.join(' ')
														: '---'
												} ${
													row?.permissions?.length > 2
														? `& ${row?.permissions?.length - 2} others`
														: ''
												} `}
												{/* {row?.roles?.slice(0, numberOfItems).map(item => {
													return <div className="break-word">{`${item}`}</div>;
												})}
												{row?.roles?.length > 2 && 
												<button className='admin-name'  onClick={handleClick}>{!showMore ? 'show more' : 'show less'}</button>
												} */}
											</div>
										</TableCell>
										<TableCell>
											<IconButton
												size="small"
												id={`edit-subAdmin-${row?.id}`}
												onClick={() => goToEditSubAdmin(row)}
											>
												<img src="assets/images/circle-edit.png" alt="edit" width="25px" />
											</IconButton>
											<CustomCheckbox
												id={`disable-subAdmin-${row?.id}`}
												onClick={handleDisable}
												row={row}
											/>
										</TableCell>
									</TableRow>
								))
							)}
							{fetchingMore ? (
								<TableRow>
									<TableCell align="center" colSpan={8}>
										<CircularProgress size={35} />
									</TableCell>
								</TableRow>
							) : (
								<></>
							)}
						</TableBody>
					</Table>
				</TableContainer>
				<InfiniteScroll
					dataLength={rows?.length}
					next={handleLoadMore}
					hasMore={hasMore}
					scrollableTarget="Scrollable-table"
				/>
			</div>
		</FuseAnimate>
	);
}

export default SchoolAdmin;
