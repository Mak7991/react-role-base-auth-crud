import React, { useState, useEffect } from 'react';
import { CircularProgress, Avatar, IconButton } from '@material-ui/core';
import CustomButton from 'app/customComponents/CustomButton/CustomButton';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import './adminDetail.css';
import { faEdit } from '@fortawesome/free-solid-svg-icons';
import jwtService from 'app/services/jwtService';
import history from '@history';
import { useDispatch, useSelector } from 'react-redux';
import * as Actions from 'app/store/actions';
import ResetDialoguebox from './ResetDialoguebox';

function SuperadminDetail() {
	const [isLoading, setIsLoading] = useState(true);
	const [user, setuser] = useState([]);
	const userRole = useSelector(({ auth }) => auth.user.role);
	const dispatch = useDispatch();
	const [refresh, setRefresh] = useState(0);
	const isSuperSchoolAdmin = userRole[0] === 'super_school_admin';
	useEffect(() => {
		jwtService
			.getProfile(isSuperSchoolAdmin)
			.then(res => {
				setIsLoading(false);
				setuser(res.data);
			})
			.catch(error => {
				setIsLoading(false);
				console.error('data is invalid', error);
			});
	}, []);

	const goToEditprofile = () => {
		history.push({
			pathname: userRole[0] === 'super_admin' ? '/Editprofile' : '/profile-edit',
			state: { user }
		});
	};

	const handleResetDialoguebox = data => {
		dispatch(
			Actions.openDialog({
				children: <ResetDialoguebox setRefresh={setRefresh} refresh={refresh} />
			})
		);
	};

	return (
		<>
			<div className="profile-cont mx-auto">
				<div className="profileinfo flex items-center flex-nowrap justify-between mx-auto">


					<div className="form-heading">
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
						Profile
					</div>

					<div className="personal-button flex justify-between">
						<span className="mx-4 ">
							<CustomButton
								variant="secondary"
								height="46"
								width="100px"
								fontSize="15px"
								onClick={goToEditprofile}
							>
								<FontAwesomeIcon icon={faEdit} />
								<span> Edit </span>
							</CustomButton>
						</span>
					</div>
				</div>

				<div className="bg-white rounded   mx-auto profile-bg">
					<div className="flex">
						<div className="mx-64 flex-shrink-0" style={{ marginRight: '8.6rem' }}>
							<Avatar style={{ height: '140px', width: '140px' }} src={user?.photo} />
						</div>
						{isLoading ? (
							<CircularProgress className="m-auto justtify-center items-center" />
						) : (
							<div
								className="grid grid-cols-2 flex-grow pl-20"
								style={{ gap: '40px', marginRight: '6.4rem' }}
							>
								<div className="">
									<div style={{ fontSize: 14 }}>First Name</div>
									<div style={{ fontSize: 16 }} className="font-bold turncate break capitalize">
										{user.first_name}
									</div>
								</div>
								<div className="">
									<div style={{ fontSize: 14 }}>Last Name</div>
									<div style={{ fontSize: 16 }} className="font-bold turncate break">
										{user.last_name}
									</div>
								</div>
								<div className="">
									<div style={{ fontSize: 14 }}>Contact Number</div>
									<div style={{ fontSize: 16 }} className="font-bold turncate break">
										{user.phone}
									</div>
								</div>
								<div className="">
									<div style={{ fontSize: 14 }}>Email Address</div>
									<div style={{ fontSize: 16 }} className="font-bold turncate break capitalize">
										{user.email}
									</div>
								</div>
								<div className="reest-pass">
									{/* <h1 className='hd-main PASS'>  Password</h1> */}
									<span
										className="pass-imp"
										style={{
											fontSize: '18px',
											display: 'block',
											paddingBottom: '26px',
											fontWeight: '700'
										}}
									>
										{' '}
										Password
									</span>
									<span className="mx-4 pass-btn">
										<CustomButton
											variant="secondary"
											height="46"
											width="160px"
											fontSize="15px"
											// lineHeight="12px"
											onClick={() => handleResetDialoguebox()}
										>
											<span> Reset Password</span>
										</CustomButton>
									</span>
								</div>
							</div>
						)}
					</div>
				</div>
			</div>
		</>
	);
}

export default SuperadminDetail;
