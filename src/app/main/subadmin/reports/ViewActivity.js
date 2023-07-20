/* eslint-disable jsx-a11y/media-has-caption */
/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import { Avatar, CircularProgress } from '@material-ui/core';
import { Close, Check } from '@material-ui/icons';
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import * as Actions from 'app/store/actions';
import './ViewActivity.css';
import CustomButton from 'app/customComponents/CustomButton/CustomButton';
import dayjs from 'dayjs';
import { useReactToPrint } from 'react-to-print';
import html2pdf from 'html2pdf.js';
import MediaRenderer from './MediaRenderer';
import SendEmailDialog from './SendEmailDialog';
import Axios from 'axios';

function getBase64(url) {
	return new Promise((resolve, reject) => {
		const axiosInstance = Axios.create({
			headers: {
				'Cache-Control': 'no-cache',
				Pragma: 'no-cache',
				Expires: '0',
				Authorization: '',
			},
		});
		delete axiosInstance.defaults.headers.common['Authorization'];
		axiosInstance
			.get(url, {
				responseType: 'arraybuffer',
			})
			.then((res) => {
				resolve(
					`data:image/${url.split('.').slice(-1)[0]};base64,${Buffer.from(res.data, 'binary').toString(
						'base64'
					)}`
				);
			})
			.catch((err) => {
				reject(err);
			});
	});
}

async function replaceImageUrlsWithData(html) {
	const doc = html;
	const images = doc.querySelectorAll('img');

	const urls = [];
	for (const image of images) {
		urls.push(image.src);
	}

	// Fetch all URLs in parallel
	const responses = await Promise.all(urls.map((url) => getBase64(url)));
	for (let i = 0; i < images.length; i += 1) {
		images[i].src = responses[i];
		console.log(images[i]);
	}
	return doc;
}

function ViewActivity({ student, studentActivity, loader, pdfRef, date }) {
	const [sendLoader, setSendingLoader] = useState(false);
	const dispatch = useDispatch();

	async function customPrintFunction(printIframe) {
		const document = printIframe.contentDocument;
		if (document) {
			try {
				const opts = {
					html2canvas: {
						// allowTaint: true,
						// useCORS: true,
						backgroundColor: 'rgba(0,0,0,0)',
						removeContainer: true,
					},
				};
				const html = document.getElementsByTagName('html')[0];
				const modifiedHTML = await replaceImageUrlsWithData(html);
				console.log(modifiedHTML);
				await html2pdf()
					.set(opts)
					.from(modifiedHTML)
					.toPdf()
					.get('pdf')
					.then((pdf) => {
						dispatch(
							Actions.openDialog({
								children: <SendEmailDialog pdf={pdf} student={student} />,
							})
						);
						setSendingLoader(true);
					});
			} catch (error) {
				console.log(error);
				setSendingLoader(false);
			}
		}
	}

	const sendPdfEmail = useReactToPrint({
		content: () => pdfRef.current,
		documentTitle: `${student.first_name} ${student.last_name} Activity Report.pdf`,
		copyStyles: true,
		print: customPrintFunction,
	});

	return (
		<>
			<div
				style={{
					height: '471px',
					scrollBehavior: 'smooth',
					width: '500px',
				}}
			>
				<div className="bg-white profile-card-wrapper p-16" style={{ backgroundColor: '#5b81f0', height: 96 }}>
					<div
						className="flex flex-col"
						style={{
							gap: 'auto',
							height: 105,
						}}
					>
						<div
							className="self-end mb-14 cursor-pointer"
							style={{ color: '#fff' }}
							onClick={() => dispatch(Actions.closeDialog())}
						>
							<Close />
						</div>
						<div className="flex items-center flex-nowrap justify-between">
							<span className="text-xl self-end font-bold mr-28">
								<div className="report-std truncate " style={{ display: 'flex', alignItems: 'center' }}>
									<Avatar style={{ width: '40px', height: '40px' }} src={student.photo} />
									<span style={{ marginLeft: '10px', color: '#fff' }}>
										{student.first_name} {student.last_name}
									</span>
								</div>
							</span>
							<div className="flex justify-between">
								<div className="flex">
									<div className="flex">
										<div
											className="flex flex-col items-end"
											style={{ color: '#fff', marginRight: '22px' }}
										>
											<div>Daily Report</div>
											{/* <div> {dayjs().format('MMMM DD, YYYY')}</div> */}
											<div>
												{' '}
												{date
													? dayjs(new Date(date)).format('MMMM DD, YYYY')
													: dayjs().format('MMMM DD, YYYY')}
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
				<div
					style={{
						height: 355,
						overflowY: 'auto',
					}}
				>
					{loader ? (
						<div className="flex justify-center items-center h-full">
							<CircularProgress size={35} />
						</div>
					) : studentActivity?.activities.filter((activity) => !activity.is_pending)?.length > 0 ? (
						<>
							<div className="flex flex-col-reverse mt-10">
								<div className="box-padding">
									<div className="text-xl self-end font-bold mr-28 my-4">
										<div className="flex">
											<div className="checkin-tick-icon">
												<Check color="white" />
											</div>
											<div className="flex flex-col items-start" style={{ marginLeft: '14px' }}>
												<div style={{ fontSize: '13px', paddingBottom: '4px' }}>
													Checked in at{' '}
													{dayjs(`${studentActivity.checkin}Z`).format('hh:mm A')}
												</div>
											</div>
										</div>
									</div>
								</div>
								{studentActivity?.activities
									.filter((activity) => !activity.is_pending)
									?.map((activity, index) => {
										return (
											<div className="box-padding">
												<div className="text-xl self-end font-bold mr-28">
													<div className="flex border-b pb-10">
														<Avatar src={activity.activity.photo} />
														<div
															className="flex flex-col items-start"
															style={{ marginLeft: '14px' }}
														>
															<div style={{ fontSize: '13px', paddingBottom: '4px' }}>
																{activity.activity.name} at{' '}
																{dayjs(activity.created_at).format('hh:mm A')}
															</div>
															<div
																style={{
																	fontSize: '13px',
																	paddingBottom: '4px',
																	color: '#676767',
																}}
															>
																{activity.activity.name}
																{activity?.activities?.types &&
																activity.activity_id !== 12
																	? ` - ${activity?.activities?.types}`
																	: ''}
																{activity.package ? ` - ${activity.package}` : ''}
																{activity?.start_time
																	? ` - ${activity?.start_time
																			.split(' ')
																			.slice(1, 3)
																			.join(' ')}`
																	: ''}
																{activity?.end_time
																	? ` to ${activity?.end_time
																			.split(' ')
																			.slice(1, 3)
																			.join(' ')}`
																	: ''}
																{activity?.activities?.bullet_comments
																	? ` - ${activity?.activities?.bullet_comments}`
																	: ''}
																{activity?.activities?.quick_comments
																	? ` - ${activity?.activities?.quick_comments}`
																	: ''}
																{activity.activity_id === 10 &&
																activity.activity_supplies.length > 0
																	? `: ${activity?.activity_supplies
																			?.map((supply) => supply.supply_name)
																			.join(' - ')}`
																	: ''}
																{activity.other_comment
																	? ` - ${activity.other_comment}`
																	: ''}
															</div>
															{(activity.photo ||
																activity.media.length > 0 ||
																activity.video) && (
																<MediaRenderer
																	media={activity.media}
																	photo={activity.photo}
																	video={activity.video}
																	videoThumbnail={activity.video_thumb}
																/>
															)}
														</div>
													</div>
												</div>
											</div>
										);
									})}
								{studentActivity?.checkout && (
									<div className="box-padding">
										<div className="text-xl self-end font-bold mr-28">
											<div className="flex border-b pb-10">
												<div className="checkin-tick-icon">
													<Check color="white" />
												</div>
												<div
													className="flex flex-col items-start"
													style={{ marginLeft: '14px' }}
												>
													<div style={{ fontSize: '13px', paddingBottom: '4px' }}>
														Checked out at{' '}
														{dayjs(`${studentActivity.checkout}Z`).format('hh:mm A')}
													</div>
												</div>
											</div>
										</div>
									</div>
								)}
							</div>
							<div className="self-end">
								<span
									style={{
										display: 'flex',
										justifyContent: 'center',
										lineHeight: '29px',
										margin: 'auto',
									}}
								>
									<span className="mx-4">
										{sendLoader ? (
											<div className="circle-bar">
												<CircularProgress size={35} />
											</div>
										) : (
											<CustomButton
												onClick={() => {
													sendPdfEmail();
													setSendingLoader(true);
												}}
												variant="secondary"
												height="43"
												width="140px"
												fontSize="15px"
											>
												Send
											</CustomButton>
										)}
									</span>
								</span>
							</div>
						</>
					) : (
						<div className="flex justify-center items-center h-full">
							<div className="flex flex-col items-center">No Activity for today</div>
						</div>
					)}
				</div>
			</div>
		</>
	);
}

export default ViewActivity;
