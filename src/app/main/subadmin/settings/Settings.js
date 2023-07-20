import React, { useState, useEffect, useRef } from 'react';
import { Avatar, CircularProgress, makeStyles } from '@material-ui/core';
import CustomButton from 'app/customComponents/CustomButton/CustomButton';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import './Settings.css';
import { faEdit } from '@fortawesome/free-solid-svg-icons';
import { getSchoolProfile, changeSchoolCode } from 'app/services/settings/settings';
import { useSelector, useDispatch } from 'react-redux';
import * as Actions from 'app/store/actions';
import * as UserActions from 'app/auth/store/actions/user.actions';
import history from '@history';
import Pusher from 'pusher-js';
import FuseScrollbars from '@fuse/core/FuseScrollbars';

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
function SuperadminDetail() {
	const classes = useStyles();
	const dispatch = useDispatch();
	const inputRef = useRef(null);
	const [selectedFile, setSelectedFile] = useState(null);
	const [preview, setPreview] = useState(null);
	const [isLoading, setIsLoading] = useState(true);
	const [user, setuser] = useState({});
	const [loader, setLoader] = useState(false);
	const mainUser = useSelector(({ auth }) => auth.user);
	let pusher;
	let channel;

	const GetSchoolSettings = (e) => {
		console.log(e);
		setIsLoading(true);
		getSchoolProfile()
			.then((res) => {
				setIsLoading(false);
				console.log(res.data);
				setPreview(res?.data?.logo);
				setuser(res.data);
				const updatedAdmin = res.data.admins.filter((admin) => admin.id === mainUser.data.id)[0];
				const updatedUser = {
					...mainUser,
					data: {
						...mainUser.data,
						displayName: `${updatedAdmin.first_name} ${updatedAdmin.last_name}`,
					},
					school: {
						...res.data,
					},
					doNotRedirect: 1,
				};
				dispatch(UserActions.setUserData(updatedUser));
			})
			.catch((error) => {
				setIsLoading(false);
				console.error('data is invalid', error);
			});
	};

	useEffect(() => {
		pusher = new Pusher(process.env.REACT_APP_PUSHER_CHANNEL_ID, {
			cluster: process.env.REACT_APP_PUSHER_CLUSTER_ID,
		});
		channel = pusher.subscribe(`school_app_${mainUser.school?.id || mainUser.data.school.id}`);
		channel.bind('school_update', () => {
			GetSchoolSettings();
		});
		channel.bind('school_disabled', () => {
			GetSchoolSettings();
		});
		GetSchoolSettings();
		return () => {
			pusher.disconnect();
		};
	}, []);

	const goToEditsettings = () => {
		history.push({ pathname: `/Editsettings/${user.id}` });
	};

	useEffect(() => {
		if (!selectedFile) {
			setPreview(null);
			return;
		}

		const objectUrl = URL.createObjectURL(selectedFile);
		setPreview(objectUrl);

		return () => URL.revokeObjectURL(objectUrl);
	}, [selectedFile]);

	const handleChangeClick = () => {
		setLoader(true);
		const payload = { school_id: mainUser.school.id };
		changeSchoolCode(payload)
			.then((res) => {
				dispatch(Actions.showMessage({ message: 'School code changed successfully', variant: 'success' }));
			})
			.catch((err) => {
				dispatch(Actions.showMessage({ message: 'Failed to change school code', variant: 'error' }));
			})
			.finally(() => {
				GetSchoolSettings();
				setLoader(false);
			});
	};

	return (
		<FuseScrollbars className={classes.content} scrollToTopOnRouteChange>
			<div className="m-32 mt-24">
				<div className="setinfo flex items-center flex-nowrap justify-between mx-auto">
					<span className="totalRooms-heading" style={{ fontWeight: '700' }}>
						Settings
					</span>
					<div className="personal-button flex justify-between">
						<span className="mx-4 ">
							<CustomButton
								variant="secondary"
								height="46"
								width="100px"
								fontSize="15px"
								onClick={goToEditsettings}
							>
								<FontAwesomeIcon icon={faEdit} />
								<span> Edit </span>
							</CustomButton>
						</span>
					</div>
				</div>

				<div className="bg-white rounded mt-12 p-28 rounded">
					<div>
						<div className="flex-shrink-0 " style={{ marginBottom: '20px' }}>
							<span className="" style={{ fontSize: '18px', fontWeight: '700' }}>
								School Profile
							</span>
						</div>
						{isLoading ? (
							<CircularProgress className="m-auto justtify-center items-center flex" />
						) : (
							<>
								<div className="flex col-gap-52 mt-12">
									<Avatar src={preview} style={{ width: 120, height: 120 }} />

									<div className="grid grid-cols-3 flex-grow" style={{ gap: '40px' }}>
										<div className="">
											<div style={{ fontSize: 14 }}>School Name</div>
											<div
												style={{ fontSize: 16 }}
												className="font-bold turncate break capitalize"
											>
												{user.name}
											</div>
										</div>
										<div className="">
											<div style={{ fontSize: 14 }}>Address 1 </div>
											<div style={{ fontSize: 16 }} className="font-bold turncate break">
												{user.address}
											</div>
										</div>
										<div className="">
											<div style={{ fontSize: 14 }}>Address 2</div>
											<div
												style={{ fontSize: 16 }}
												className="font-bold turncate break capitalize"
											>
												{user?.address2 ? user?.address2 : '-'}
											</div>
										</div>
										<div className="">
											<div style={{ fontSize: 14 }}>School Phone No </div>
											<div style={{ fontSize: 16 }} className="font-bold turncate break">
												{user.phone}
											</div>
										</div>

										<div className="">
											<div style={{ fontSize: 14 }}>School Website Link</div>
											<div
												style={{ fontSize: 16 }}
												className="font-bold turncate break capitalize"
											>
												{user?.website ? user?.website : '-'}
											</div>
										</div>
										<div className="flex items-center gap-16">
											<div className="flex flex-col">
												<div style={{ fontSize: 14 }}>School Code</div>
												<div
													style={{ fontSize: 16 }}
													className="font-bold turncate break capitalize"
												>
													{user.otp}
												</div>
											</div>
											{loader ? (
												<CircularProgress />
											) : (
												<CustomButton
													variant="primary"
													height="40"
													width="100px"
													fontSize="12px"
													onClick={handleChangeClick}
												>
													Change Code
												</CustomButton>
											)}
										</div>
										{/* <div className="">
                                    <div style={{ fontSize: 14 }}>Enrolment Capacity </div>
                                    <div style={{ fontSize: 16 }} className="font-bold turncate break">
                                    {user.enrollment_capacity}
                                    </div>
                                </div> */}
										<div className="">
											<div style={{ fontSize: 14 }}>City</div>
											<div style={{ fontSize: 16 }} className="font-bold turncate break">
												{user.city}
											</div>
										</div>
										<div className="">
											<div style={{ fontSize: 14 }}>State</div>
											<div
												style={{ fontSize: 16 }}
												className="font-bold turncate break capitalize"
											>
												{user.state?.name}
											</div>
										</div>

										<div className="">
											<div style={{ fontSize: 14 }}>Zip Code</div>
											<div
												style={{ fontSize: 16 }}
												className="font-bold turncate break capitalize"
											>
												{user.zip_code}
											</div>
										</div>

										<div className="">
											<div style={{ fontSize: 14 }}>Time Zone For Check In</div>
											<div style={{ fontSize: 16 }} className="font-bold turncate break">
												{user.timezone}
											</div>
										</div>
										<div className="">
											<div style={{ fontSize: 14 }}>Country</div>
											<div style={{ fontSize: 16 }} className="font-bold turncate break">
												{user.country?.name}
											</div>
										</div>
									</div>
								</div>
							</>
						)}
					</div>

					{/* second sec
                    <div className='check-div '>
                        <span className="font-extrabold totalRooms-headingg">School Profile</span>

                        <div className='quick-scannnnn flex items-center flex-nowrap justify-between mx-auto'>
                            <div className='quick-scan'>
                                <div className="roster-main-div">
                                    <div className="para-one-headingg">
                                        <p className="point-onee">1</p>
                                    </div>
                                    <div className="para-one-contentt">
                                        <div>
                                            <h2>Quick Scan</h2>
                                            <p className="paragraph-one">
                                               Enable Parents to check in/out  from their phones by scanning a QR image at your location {' '}
                                               
                                            </p>
                                        </div>
                                    </div>
                                    <div className='actions'>
                                        <CustomCheckbox row={row} />
                                    </div>
                                </div>
                            </div>

                            <div className='quick-scan  flex justify-between'>
                                <div className="roster-main-div">
                                    <div className="para-one-headingg">
                                        <p className="point-onee">2</p>

                                    </div>
                                    <div className="para-one-contentt">
                                        <div>
                                            <h2>Check in Scan</h2>
                                            <p className="paragraph-one">
                                                A check in code  will be requested  when student check  in or out  from the check  in  code quick scan {' '}
                                               
                                            </p>
                                        </div>
                                    </div>
                                    <div className='actions'>
                                        <CustomCheckbox row={row} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div> */}
				</div>
			</div>
		</FuseScrollbars>
	);
}

export default SuperadminDetail;
