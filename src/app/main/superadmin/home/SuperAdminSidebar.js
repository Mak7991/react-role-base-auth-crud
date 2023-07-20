import React, { useEffect, useState } from 'react';
import { CircularProgress, Avatar } from '@material-ui/core';
import { useDispatch } from 'react-redux';
import * as Actions from 'app/store/actions';
import CustomButton from 'app/customComponents/CustomButton/CustomButton';
import './AdminDashboard.css';
import { getTotalSubAdmin } from 'app/services/SuperAdminHomeService/superAdminHomeService';

function SuperAdminSideBar() {
	const dispatch = useDispatch();
	const [date, setDateFrom] = useState(new Date());
	const [subAdmins, setSubAdmins] = useState([]);
	const [adminCount, setAdminCount] = useState(null);
	const [isAdminLoading, setIsAdminLoading] = useState(true);
	const [viewAll, setViewAll] = useState(false);
	const [page, setPage] = useState(1);

	useEffect(() => {
		if (page === 1) {
			return;
		}
		setTimeout(() => {
			setIsAdminLoading(false);
		}, 1000);
	});

	useEffect(() => {
		setIsAdminLoading(true);
		getTotalSubAdmin(1)
			.then(({ data }) => {
				setViewAll(false);
				setSubAdmins(data.data);
				setAdminCount(data.total);
				if (data.current_page < data.last_page) {
					setPage(page + 1);
				}
			})
			.catch(err => {
				if (err.response?.data?.message) {
					dispatch(
						Actions.showMessage({
							message: err?.response?.data?.message,
							autoHideDuration: 2500,
							variant: 'error'
						})
					);
				} else {
					dispatch(
						Actions.showMessage({
							message: 'Failed to load events',
							autoHideDuration: 2500,
							variant: 'error'
						})
					);
				}
			})
			.finally(() => {
				setIsAdminLoading(false);
			});
	}, []);

	useEffect(() => {
		if (page === 1) {
			return;
		}
		getTotalSubAdmin(page)
			.then(({ data }) => {
				setSubAdmins(subAdmins.concat(data.data || []));
				if (data.current_page < data.last_page) {
					setPage(page + 1);
				}
			})
			.catch(err => {
				if (err.response?.data?.message) {
					dispatch(
						Actions.showMessage({
							message: err?.response?.data?.message,
							autoHideDuration: 2500,
							variant: 'error'
						})
					);
				} else {
					dispatch(
						Actions.showMessage({
							message: 'Failed to load events',
							autoHideDuration: 2500,
							variant: 'error'
						})
					);
				}
			});
	}, [page]);

	return (
		<div className="admin-sideBar">
			<div className="flex flex-row justify-between pr-34 pl-34 items-center">
				<h3>
					<span className="" style={{ fontSize: '18px', fontWeight: '700' }}>
						Sub Admins
					</span>{' '}
					<span>|</span> <span className="sideBar-heading">{adminCount || ''}</span>
				</h3>
				{!viewAll && subAdmins.length > 5 ? (
					<span>
						<CustomButton
							variant="secondary"
							fontSize="15px"
							style={{ justifyContent: 'space-evenly', display: 'flex', alignItems: 'center' }}
							onClick={() => {
								setViewAll(true);
							}}
						>
							View all <span className="chevron-right-icon">&#8250;</span>
						</CustomButton>
					</span>
				) : (
					''
				)}
			</div>

			{isAdminLoading ? (
				<div className="flex justify-center pt-64">
					<CircularProgress size={35} />
				</div>
			) : !subAdmins[0] ? (
				<div className="flex justify-center pt-64">No Sub Admin Found</div>
			) : (
				<div className="pt-10 overflow-auto h-full" id="event-cards">
					{viewAll
						? subAdmins.map((subAdmin, key) => (
								<div className="subAdmin-card-div" key={key}>
									<div className="my-10 subAdmin-card p-10 ">
										<div className="flex">
											<Avatar
												style={{ height: '45px', width: '45px' }}
												alt="subAdmin-Profile-Pic"
												className="subAdmin-profile-img mr-4"
												src={subAdmin.photo || subAdmin?.school[0]?.logo}
											/>
											<div className="subAdmin-info max-w-full text-xs pr-4">
												<h5 className="font-extrabold">
													{subAdmin.first_name} {subAdmin.last_name}
												</h5>
												<p className="subAdmin-schoolName">{subAdmin?.school[0]?.name}</p>
												<p className="subAdmin-info-underLine" />
												<span>
													<i className="fa fa-phone" aria-hidden="true" />
												</span>
												<h3>{subAdmin?.phone}</h3>
											</div>
										</div>
									</div>
								</div>
						  ))
						: subAdmins.slice(0, 5).map((subAdmin, key) => (
								<div className="subAdmin-card-div" key={key}>
									<div className="my-10 subAdmin-card p-10 ">
										<div className="flex">
											<Avatar
												style={{ height: '45px', width: '45px' }}
												alt="subAdmin-Profile-Pic"
												className="subAdmin-profile-img mr-4"
												src={subAdmin.photo || subAdmin?.school[0]?.logo}
											/>

											<div className="subAdmin-info max-w-full text-xs pr-4">
												<h5 className="font-extrabold">
													{subAdmin.first_name} {subAdmin.last_name}
												</h5>
												<p className="subAdmin-schoolName">{subAdmin?.school[0]?.name}</p>
												<p className="subAdmin-info-underLine" />
												<span>
													<i className="fa fa-phone" aria-hidden="true" />
												</span>
												<h3>{subAdmin?.phone}</h3>
											</div>
										</div>
									</div>
								</div>
						  ))}
				</div>
			)}
		</div>
	);
}

export default SuperAdminSideBar;
