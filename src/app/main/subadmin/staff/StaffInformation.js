/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable consistent-return */
import React, { useState } from 'react';
import { CircularProgress, Avatar, IconButton, Typography } from '@material-ui/core/';
import './staff.css';
import FuseAnimate from '@fuse/core/FuseAnimate';
import history from '@history';
import dayjs from 'dayjs';

function StaffInformation() {
	const [isLoading, setIsLoading] = useState(false);
	const { row } = history.location.state;

	return (
		<FuseAnimate animation="transition.slideLeftIn" duration={600}>
			<div className="add_staff_main">
				<div className="staff-div mx-auto">
					<div className="flex justify-between items-end">
						<span className="personal-hd  mt-32 mb-16">
							<div style={{ color: '#06071D', fontSize: 20, fontWeight: '700' }}>
								<span className="mr-12 icon-color ">
									<IconButton
										id="go-back"
										onClick={() => {
											history.push('/staff');
										}}
									>
										<img
											src="assets/images/arrow-long.png"
											alt="filter"
											width="24px"
											className="fiterimg"
										/>
									</IconButton>
								</span>
								Staff Detail
							</div>
						</span>
					</div>
					<div className="bg-white rounded  staff-detail">
						<span className="div-heading">
							<h2
								className="edit-staff-form-heading staf-infoo"
								style={{ color: '#06071D', fontSize: '18px' }}
							>
								Staff Information
							</h2>
						</span>

						<div className="bg-white rounded  mx-auto">
							<div className="flex">
								<div className=" flex-shrink-0" style={{ marginRight: '8.6rem' }}>
									<Avatar style={{ height: '140px', width: '140px' }} src={row?.photo} />
								</div>
								{isLoading ? (
									<CircularProgress className="m-auto justtify-center items-center" />
								) : (
									<div
										className="grid grid-cols-3 flex-grow pl-20"
										style={{ gap: '37px', marginRight: '6.4rem' }}
									>
										<div className="">
											<div className="hd-input">Name</div>
											<div className="font-bold turncate break input-bottom text-input">
												{row.first_name}
											</div>
										</div>
										<div className="">
											<div className="hd-input">Last Name</div>
											<div className="font-bold turncate break input-bottom text-input">
												{row.last_name}
											</div>
										</div>
										<div className="">
											<div className="hd-input">Email Address</div>
											<div className="font-bold turncate break email-input text-input">
												{row.email}
											</div>
										</div>
										<div className="">
											<div className="hd-input">Contact Number</div>
											<div className="font-bold turncate break input-bottom text-input">
												{row.phone}
											</div>
										</div>
										<div className="">
											<div className="hd-input">Emergency Contact Name</div>
											<div className="font-bold turncate break input-bottom text-input">
												{row?.emergency_name ? row?.emergency_name : '-'}
											</div>
										</div>
										<div className="">
											<div className="hd-input">Emergency Contact Number</div>
											<div className="font-bold turncate break input-bottom text-input">
												{row.emergency_phone}
											</div>
										</div>
										<div className="">
											<div className="hd-input">Position Type</div>
											<div className="font-bold turncate break input-bottom text-input">
												{row.position_type}
											</div>
										</div>
										<div className="">
											<div className="hd-input">Title</div>
											<div className="font-bold turncate break input-bottom text-input">
												{row.title}
											</div>
										</div>
										<div className="">
											<div className="hd-input">Admin</div>
											<div className="font-bold turncate break input-bottom text-input">
												{row.admin}
											</div>
										</div>
										<div className="">
											<div className="hd-input">Date of Birth</div>
											<div className="font-bold turncate break input-bottom text-input">
												{dayjs(row.date_of_birth).format('MMM DD, YYYY')}
											</div>
										</div>
										<div className="">
											<div className="hd-input">Address</div>
											<div className="font-bold turncate break input-bottom text-input">
												{row.address}
											</div>
										</div>
										<div className="">
											<div className="hd-input">Employment Date</div>
											<div className="font-bold turncate break input-bottom text-input">
												{dayjs(row.employment_date).format('MMM DD, YYYY')}
											</div>
										</div>
										<div className="">
											{row?.document_urls.length > 0 ? (
												<>
													<Typography className="file-upload-label">Upload File</Typography>
													<div className="upload_file_div_staffView">
														{/* <div className="uplaod_div">
													<img
														src="assets/images/addFile.png"
														alt="Upload file"
														style={{ cursor: 'pointer' }}
													/>
													<input
														style={{ display: 'none' }}
														type="file"
														name="document_urls"
														accept=".jpg, .png, .jpeg, .pdf"
														disabled
													/>
												</div> */}
														{row?.document_urls?.map((e, i) =>
															e.url.split('.')[e.url.split('.').length - 1] !== 'pdf' ? (
																<div key={i} className="attach_file_div">
																	<img
																		src={e.name ? URL.createObjectURL(e) : e.url}
																		style={{
																			width: '87px',
																			height: '84px',
																			objectFit: 'cover',
																		}}
																	/>
																	{/* <div className="file-cross file-cross-img">x</div> */}
																</div>
															) : (
																<div key={i} className="attach_file_div">
																	<img
																		src="assets/images/pdf_thumbnail.png"
																		style={{
																			width: '87px',
																			height: '84px',
																			objectFit: 'cover',
																		}}
																	/>
																	{/* <div className="file-cross file-cross-img">x</div> */}
																</div>
															)
														)}
													</div>
												</>
											) : null}
										</div>
									</div>
								)}
							</div>
						</div>
					</div>
				</div>
			</div>
		</FuseAnimate>
	);
}

export default StaffInformation;
