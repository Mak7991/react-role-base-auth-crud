import React, { useState, useEffect, useRef } from 'react';
import history from '@history';
import {
	Table,
	TableHead,
	TableBody,
	TableCell,
	TableContainer,
	TableRow,
	Paper,
	CircularProgress,
	IconButton,
	Avatar,
	InputLabel,
	Select,
	MenuItem,
	FormControl,
	Typography,
	TextField,
	InputAdornment
} from '@material-ui/core';
import FuseAnimate from '@fuse/core/FuseAnimate';
import { useDispatch, useSelector } from 'react-redux';
import * as Actions from 'app/store/actions';
import CustomButton from 'app/customComponents/CustomButton/CustomButton';
import './companyReport.css';
import moment from 'moment';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload } from '@fortawesome/free-solid-svg-icons';
import CustomDatePicker from 'app/customComponents/CustomDatePicker/CustomDatePicker';
import SearchIcon from '@material-ui/icons/Search';
import { useReactToPrint } from 'react-to-print';
import { Close } from '@material-ui/icons';
import { getStaffs, getSchools } from 'app/services/reports/reports';
import InfiniteScroll from 'react-infinite-scroll-component';

export default function Staff() {
	const dispatch = useDispatch();
	const user = useSelector(({ auth }) => auth.user);
	const [rows, setRows] = useState([]);
	const [isLoading, setIsLoading] = useState(false);
	const [hasMore, setHasMore] = useState(false);
	const [firstLoad, setFirstLoad] = useState(true);
	const [fetchingMore, setFetchingMore] = useState(false);
	const checkInReportRef = useRef(null);
	const [fromDate, setFromDate] = useState('');
	const [toDate, setToDate] = useState('');
	const [page, setPage] = useState(1);
	const [filters, setFilters] = useState({
		role: '',
		school_id: '',
		fromDate: '',
		toDate: ''
	});

	const [schools, setSchool] = useState([]);
	const [searchQuery, setSearchQuery] = useState('');
	const [isLoadingExport, setIsLoadingExport] = useState(false);

	const handleSearch = e => {
		setSearchQuery(e.target.value);
	};

	const handlePrint = useReactToPrint({
		content: () => checkInReportRef.current
	});

	// useEffect(() => {
	// 	const id = setTimeout(
	// 		() => {
	// 			setIsLoading(true);
	// 			setFirstLoad(false);
	// 			getStaffs(filters, 1, searchQuery)
	// 				.then(res => {
	// 					if (res.data.last_page > res.data.current_page) {
	// 						setHasMore(true);
	// 					} else {
	// 						setHasMore(false);
	// 					}
	// 					setPage(res.data.current_page + 1);
	// 					setRows(res.data.data);
	// 				})
	// 				.catch(err => {
	// 					dispatch(
	// 						Actions.showMessage({
	// 							message: 'Failed to fetch data, please refresh',
	// 							variant: 'error'
	// 						})
	// 					);
	// 				})
	// 				.finally(() => {
	// 					setIsLoading(false);
	// 				});
	// 		},
	// 		firstLoad ? 0 : 1000
	// 	);

	// 	return _ => {
	// 		clearTimeout(id);
	// 	};
	// 	// eslint-disable-next-line
	// }, []);

	const ApplyFilters = () => {
		setRows([]);
		setIsLoading(true);
		setFirstLoad(false);
		getStaffs(filters, 1, searchQuery)
			.then(res => {
				setFirstLoad(false);
				setRows(res.data.data);
				if (res.data.last_page > res.data.current_page) {
					setHasMore(true);
				} else {
					setHasMore(false);
				}
				setPage(res.data.current_page + 1);
				dispatch(
					Actions.showMessage({
						message: 'Report has been generated',
						variant: 'success'
					})
				);
				// setPage(res.data.current_page + 1);
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
		setPage(1);
	};

	const handleLoadMore = () => {
		setFetchingMore(true);
		getStaffs(filters, page, searchQuery)
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

	const handleFilters = ev => {
		const { name, value } = ev.target;
		setFilters({ ...filters, [name]: value });
	};

	useEffect(() => {
		getSchools().then(res => {
			console.log(res?.data?.data);
			setSchool(res?.data?.data);
		});
	}, []);

	const handleExport = () => {
		setIsLoadingExport(true);
		getStaffs(filters, page, searchQuery, 1)
			.then(res => {
				const blob = new Blob([res.data], {
					type: 'text/csv'
				});
				const link = document.createElement('a');
				link.setAttribute('target', '_blank');
				link.href = window.URL.createObjectURL(blob);
				link.setAttribute('download', `staff_report_${new Date().getTime()}.csv`);
				document.body.appendChild(link);
				link.click();
				// Clean up and remove the link
				link.parentNode.removeChild(link);
				setIsLoadingExport(false);
			})
			.catch(err => {
				dispatch(
					Actions.showMessage({
						message: 'Failed to Export',
						variant: 'error'
					})
				);
				setIsLoadingExport(false);
			})
			.finally(() => {
				setIsLoadingExport(false);
			});
	};

	const staffType = [
		{
			value: 'lead',
			label: 'Lead'
		},
		{
			value: 'assistant',
			label: 'Assistant'
		},
		{
			value: 'admin',
			label: 'Admin'
		},
		{
			value: 'cook',
			label: 'Cook'
		}
	];
	return (
		<FuseAnimate animation="transition.slideLeftIn" duration={600}>
			<div className="mx-auto allergy-cont">
				<div className="flex items-center flex-nowrap justify-between">
					<div className="reports-topDiv">
						<h1 className="">
							{' '}
							<span className="">
								<IconButton
									onClick={() => {
										history.push('/company-reports');
									}}
								>
									<img src="assets/images/arrow-long.png" alt="filter" width="24px" className="" />
								</IconButton>
							</span>{' '}
							<span className="text-xl self-end font-bold mr-28">Staff</span>
						</h1>
						<p>Detail data of staff information </p>
					</div>
					<div className="flex justify-between">
						<div className="flex">
							<div className="self-end btn-aller">
								<span>
									{!isLoadingExport ? (
										<CustomButton
											onClick={handleExport}
											variant="primary"
											height="40px"
											width="100px"
											marginRight="17px"
										>
											<span className="mr-4">
												<FontAwesomeIcon icon={faDownload} />
											</span>
											Export
										</CustomButton>
									) : (
										<div className="circle-bar">
											<CircularProgress size={35} />
										</div>
									)}
									<CustomButton
										onClick={() => handlePrint()}
										variant="secondary"
										height="40px"
										width="100px"
									>
										<i className="fa fa-print" aria-hidden="true" /> Print
									</CustomButton>
									{/* <div className="help-btn cursor-pointer">
										<img src="assets/images/CENTER.png" />
										Help Center
									</div> */}
								</span>
							</div>
						</div>
					</div>
				</div>

				<div className="flex items-center flex-nowrap justify-between">
					<span className="text-2xl self-end font-extrabold mr-28" />
					<div className="flex justify-between">
						<div className="flex">
							<div className="mx-8">
								<TextField
									className="mr-10"
									onChange={handleSearch}
									id="search-input"
									value={searchQuery}
									label="Search by Name"
									style={{ width: 150 }}
									InputProps={{
										endAdornment: (
											<InputAdornment>
												<IconButton
													id="search-icon"
													onClick={() => {
														document.getElementById('search-input').focus();
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
							</div>
							<div className="mx-8">
								<FormControl>
									<InputLabel id="staff_id">Staff Type</InputLabel>
									<Select
										name="role"
										onChange={handleFilters}
										labelId="staff_id"
										id="staff_id"
										label="Staff Type"
										value={filters.role}
										style={{ width: 150 }}
										endAdornment={
											filters.role ? (
												<IconButton size="small" className="mr-16">
													<Close
														onClick={() => {
															setFilters({
																...filters,
																role: ''
															});
														}}
														fontSize="small"
													/>
												</IconButton>
											) : (
												''
											)
										}
									>
										{staffType?.length ? (
											staffType?.map(staff => {
												return (
													<MenuItem key={staff.value} value={staff.value}>
														<span>{`${staff.label}`}</span>
													</MenuItem>
												);
											})
										) : (
											<MenuItem disabled>Loading...</MenuItem>
										)}
									</Select>
								</FormControl>
							</div>
							<div className="mx-8">
								<FormControl>
									<InputLabel id="schoolLabel">School</InputLabel>
									<Select
										name="school_id"
										onChange={handleFilters}
										value={filters.school_id}
										labelId="schoolLabel"
										label="School"
										style={{ width: 150 }}
										endAdornment={
											filters?.school_id ? (
												<IconButton size="small" className="mr-16">
													<Close
														onClick={() => {
															setFilters({
																...filters,
																school_id: ''
															});
														}}
														fontSize="small"
													/>
												</IconButton>
											) : (
												''
											)
										}
									>
										<MenuItem value="All">All</MenuItem>
										{schools?.length ? (
											schools?.map(school => {
												return (
													<MenuItem key={school?.id} value={school?.id} id={school?.id}>
														<div style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
															{school?.name}
														</div>
													</MenuItem>
												);
											})
										) : (
											<MenuItem disabled>Loading...</MenuItem>
										)}
									</Select>
								</FormControl>
							</div>
							{/* <div className="mx-8"> */}
							<div className="mx-10 student-date-field" style={{ width: 150 }}>
								<CustomDatePicker
									id="date-from"
									label="Date From"
									value={filters.fromDate}
									setValue={date => {
										setFilters({ ...filters, fromDate: date?.format('YYYY-MM-DD') || '' });
									}}
									maxDate={filters.toDate || new Date()}
								/>
							</div>
							<div className="mr-20 ml-10 student-date-field" style={{ width: 150 }}>
								<CustomDatePicker
									id="date-to"
									label="Date To"
									value={filters.toDate}
									setValue={date => {
										setFilters({ ...filters, toDate: date?.format('YYYY-MM-DD') || '' });
									}}
									maxDate={new Date()}
									minDate={filters.fromDate}
								/>
							</div>
							{/* </div> */}
						</div>

						<div className="self-end">
							<span>
								<span className="mx-4">
									<CustomButton
										disabled={
											!filters.fromDate &&
											!filters.toDate &&
											!filters.role &&
											!filters.school_id &&
											!searchQuery
										}
										variant="secondary"
										height="43"
										width="140px"
										fontSize="15px"
										onClick={() => {
											ApplyFilters();
										}}
									>
										Apply
									</CustomButton>
								</span>
							</span>
						</div>
					</div>
				</div>

				{/* table  */}
				<TableContainer id="Scrollable-table" component={Paper} className="allergy-table-cont">
					<div style={{ display: 'none' }}>
						<div ref={checkInReportRef} className="p-32">
							<div className="flex flex-row justify-between">
								<div>
									<img src="assets/images/logos/logo.png" alt="" />
								</div>
								<div style={{ textAlign: 'right' }}>
									<Typography variant="subtitle1">
										<span style={{ display: 'block', marginBottom: '-0.7em', writingMode: '' }}>
											{user?.data?.school?.address}
										</span>{' '}
										{/* <span>Hom Lake, Orlando, FL 38637</span> */}
									</Typography>
									<Typography variant="subtitle1">{user?.data?.phone}</Typography>
									<Typography variant="subtitle1">{user?.data?.email}</Typography>
								</div>
							</div>
							<div style={{ marginBottom: '20px' }}>
								<span>
									<strong>Date: </strong>
								</span>
								<span>{moment(new Date()).format('dddd, DD MMMM YYYY')}</span>
							</div>
							<div className="pdf-heading">
								<h1 className="font-extrabold">Staff Report</h1>
							</div>

							<Table stickyHeader className="student-table" style={{ width: '100%' }}>
								<TableHead>
									<TableRow>
										<TableCell style={{ width: '20%' }} className="bg-white studentTableHeader">
											Staff Name
										</TableCell>
										<TableCell style={{ width: '20%' }} className="bg-white studentTableHeader">
											School Name
										</TableCell>
										<TableCell style={{ width: '20%' }} className="bg-white studentTableHeader">
											Hourly
										</TableCell>
										<TableCell style={{ width: '20%' }} className="bg-white studentTableHeader">
											Role
										</TableCell>
										<TableCell style={{ width: '20%' }} className="bg-white studentTableHeader">
											Date And Time
										</TableCell>
									</TableRow>
								</TableHead>
								<TableBody className="">
									{isLoading ? (
										<TableRow>
											<TableCell align="center" colSpan={8}>
												{/* <CircularProgress size={35} /> */}
											</TableCell>
										</TableRow>
									) : !rows?.length && !firstLoad ? (
										<TableRow>
											<TableCell align="center" colSpan={8}>
												No record found
											</TableCell>
										</TableRow>
									) : (
										rows?.map(row => (
											<TableRow key={row.id}>
												<TableCell className="bg-white ">
													<div className="flex flex-col">
														<div className="flex">
															<Avatar
																className="mr-6"
																alt="staff-face"
																src={row?.photo}
															/>
															<div className="flex  items-center justify-content: center">
																<div className="report-staff ">{row?.full_name}</div>
															</div>
														</div>
													</div>
												</TableCell>
												<TableCell className="bg-white ">
													<div className="flex flex-col">
														<div className="flex">
															<Avatar
																className="mr-6"
																alt="staff-face"
																src={row?.school?.logo}
															/>
															<div className="flex  items-center justify-content: center">
																<div className="report-staff ">{row?.school?.name}</div>
															</div>
														</div>
													</div>
												</TableCell>
												<TableCell
													style={{
														fontSize: '13px',
														maxWidth: '100px',
														fontWeight: 'bold',
														overflow: 'hidden',
														textOverflow: 'ellipsis',
														whiteSpace: 'nowrap'
													}}
													className="bg-white truncate"
												>
													{row?.title == 'full-time' ? `Full Time` : `Part Time`}
												</TableCell>
												<TableCell
													style={{
														fontSize: '13px',
														maxWidth: '100px',
														fontWeight: 'bold',
														overflow: 'hidden',
														textOverflow: 'ellipsis',
														whiteSpace: 'nowrap'
													}}
													className="bg-white truncate report-staff"
												>
													{row?.position_type}
												</TableCell>
												<TableCell component="th" scope="row">
													<div className="flex flex-col">
														<div clcssName="report-staff2>
															{momenv(row?.created_at).format('MM/DD/YY')}
													</div>
							‰‰			)<div claswName="report-staff" S|yle={{ color: 'gray' }y>
												‰‰{momentHroó?.created_at).format('hh:mm A%)}
		‰										</div>
													</div>
												</TableCell>
											</TableRow>
										))
									)}
							</TableBody>
							</Tablu>
						</div>
					</div>
					<Táble stickyHeader clascName="student-table" style={{ whdth: 100%' y}>
					<TableHead>
						<TableRow>
								<TqbleCell stùle={ width: '20%% ý} ClassName="bg-÷hite studentTableHdaDer >
									Staff Name
							)<.Tab,eelh>
								<TableCell style=y{ width> '20%' }} className="bg-white studentTabheHeader">
									School"Name
							</TableCeln>
							‰<TableCe|l style={{ width: '20%'$}} className="bg-white studentTableHeader">
)								Hourly
								</TableCell>
								<TableCell st}le={û whdth; '20%' }= className=&bg-whi|e sdudentTableH%aler">
									Role
								</TableCell>
								<TableCell style={{ width: '20%' }} className="bg-white studentTableHeader">
									Date And Time
								</TableCell>
							</TableRow>
						</TableHead>
						<TableBody className="">
							{firstLoad ? (
								<TableRow>
									<TableCell align="center" colSpan={8}>
										Generate your report
									</TableCell>
								</TableRow>
							) : isLoading ? (
								<TableRow>
									<TableCell align="center" colSpan={8}>
										<CircularProgress size={35} />
									</TableCell>
								</TableRow>
							) : !rows?.length && !isLoading ? (
								<TableRow>
									<TableCell align="center" colSpan={8}>
										No record found
									</TableCell>
								</TableRow>
							) : (
								rows?.map(row => (
									<TableRow key={row.id}>
										<TableCell className="bg-white ">
											<div className="flex flex-col">
												<div className="flex">
													<Avatar className="mr-6" alt="staff-face" src={row?.photo} />
													<div className="flex  items-center justify-content: center">
														<div className="report-staff ">{row?.full_name}</div>
													</div>
												</div>
											</div>
										</TableCell>
										<TableCell className="bg-white ">
											<div className="flex flex-col">
												<div className="flex">
													<Avatar className="mr-6" alt="staff-face" src={row?.school?.logo} />
													<div className="flex  items-center justify-content: center">
														<div className="report-staff ">{row?.school?.name}</div>
													</div>
												</div>
											</div>
										</TableCell>
										<TableCell
											style={{
												fontSize: '13px',
												maxWidth: '100px',
												fontWeight: 'bold',
												overflow: 'hidden',
												textOverflow: 'ellipsis',
												whiteSpace: 'nowrap'
											}}
											className="bg-white truncate"
										>
											{row?.title == 'full-time' ? `Full Time` : `Part Time`}
										</TableCell>
										<TableCell
											style={{
												fontSize: '13px',
												maxWidth: '100px',
												fontWeight: 'bold',
												overflow: 'hidden',
												textOverflow: 'ellipsis',
												whiteSpace: 'nowrap'
											}}
											className="bg-white truncate report-staff"
										>
											{row?.position_type}
										</TableCell>
										<TableCell component="th" scope="row">
											<div className="flex flex-col">
												<div className="report-staff" style={{ fontSize: 12 }}>
													{moment(row?.created_at).format('MM/DD/YY')}
												</div>
												<div className="report-staff" style={{ color: 'gray', fontSize: 10 }}>
													{moment(row?.created_at).format('hh:mm A')}
												</div>
											</div>
										</TableCell>
									</TableRow>
								))
							)}
							{fetchingMore ? (
								<TableRow>
									<TableCell align="center" colSpan={8}>
										<CircularProgress size={35} />
									</TableCell>
								</TableRow>						) : (
								<>=/>
							)ý
						</TableBody>
					</Table>
				</TableContainer>
				<InfiniteScroll
					dataLdngth9{rows?.length}
	I			next={hendleLoadMïse}
				hasMïre={hasMose}
					scrollableTarget="Scrollable-table"
				/>
			</div>
		</Fu3eÁnama4e>
	);
}
