/* eslint-disable jsx-a11y/media-has-caption */
/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React, { useEffect } from 'react';
import { Close, Check } from '@material-ui/icons';
import { useDispatch } from 'react-redux';
import * as Actions from 'app/store/actions';
import { TextField, CircularProgress, Avatar } from '@material-ui/core';
import CustomButton from 'app/customComponents/CustomButton/CustomButton';
import { getParents, sendEmail } from 'app/services/reports/reports';
import dayjs from 'dayjs';
import { uploadFile } from 'app/services/imageUpload/imageUpload';

function SendEmailDialog({ student, pdf }) {
	const dispatch = useDispatch();
	const [studentInfo, setStudentInfo] = React.useState([]);
	const [loader, setLoader] = React.useState(true);
	const [emails, setEmails] = React.useState('');
	const [selectedParents, setSelectedParents] = React.useState({});
	const [sending, setSending] = React.useState(false);
	useEffect(() => {
		getParents(student.id).then((res) => {
			setStudentInfo(res.data);
			setLoader(false);
		});
	}, []);
	const handleParentClick = (parent) => {
		setSelectedParents({ ...selectedParents, [parent.id]: !selectedParents[parent.id] });
	};

	const submit = () => {
		setSending(true);
		const parents = studentInfo?.parents
			?.concat(studentInfo?.approved_pickups)
			?.filter((parent) => selectedParents[parent.id]);
		const e = parents.map((parent) => parent.email);
		if (emails) {
			emails.split(/[\s,]+/).forEach((email) => {
				e.push(email);
			});
		}
		// verify emails in e
		let err = 0;
		console.log(e);
		e.forEach((email) => {
			if (!email) {
				dispatch(Actions.showMessage({ message: 'Please enter valid email', variant: 'error' }));
				err = 1;
				setSending(false);
				return;
			}
			// regex email check
			// if (!/^[a-zA-Z0-9]+@[a-zA-Z0-9]+\.[A-Za-z]+$/.test(email)) {
			if (!/^[a-zA-Z0-9]+(?:[._-][a-zA-Z0-9]+)*@[a-zA-Z0-9]+\.[a-zA-Z]{2,}$/.test(email)) {
				dispatch(Actions.showMessage({ message: 'Please enter valid email', variant: 'error' }));
				err = 1;
				setSending(false);
			}
		});

		if (err) {
			return;
		}
		const file = pdf.output('blob');
		const fileName = `${student.first_name}_${dayjs().format('DD-MM-YYYY')}.pdf`;
		uploadFile(file, fileName).then((res) => {
			// if (res.status === 200) {
			const url = `${process.env.REACT_APP_S3_BASE_URL}${res}`;
			sendEmail(student.id, e, url)
				.then((response) => {
					if (response.status === 200) {
						dispatch(Actions.showMessage({ message: 'Email sent successfully', variant: 'success' }));
						dispatch(Actions.closeDialog());
					}
				})
				.catch((e) => {
					setSending(false);
				});
			// }
		});
	};
	return (
		<>
			<div
				className="flex flex-col p-32 rounded-full justify-between"
				style={{
					maxHeight: 471,
					width: 500,
				}}
			>
				{loader ? (
					<div className="flex justify-center items-center h-full">
						<CircularProgress size={35} />
					</div>
				) : (
					<>
						<div className="flex flex-col gap-10">
							<div className="flex justify-between">
								<div className="text-lg font-black">Send Report To:</div>
								<div>
									<div
										className="self-end mb-14 cursor-pointer"
										onClick={() => dispatch(Actions.closeDialog())}
									>
										<Close />
									</div>
								</div>
							</div>
							<div
								className="flex flex-col gap-32"
								style={{
									maxHeight: 275,
									overflowY: 'auto',
								}}
							>
								<div className="grid grid-cols-7 mt-32">
									<div />
									<div className="col-span-4">Name</div>
									<div className="col-span-2">Relationship</div>
								</div>
								{!loader &&
									studentInfo?.parents?.concat(studentInfo?.approved_pickups)?.map((parent) => (
										<div
											className="grid grid-cols-7 items-center"
											onClick={() => handleParentClick(parent)}
										>
											<div
												className="tick-wrapper-custom school-ticket"
												style={{
													backgroundColor: selectedParents[parent.id] ? '#4DA0EE' : 'white',
												}}
											>
												<i className="fas fa-check" />
											</div>
											<div className="flex items-center col-span-4 gap-8">
												<Avatar src={parent.photo} />
												{parent.first_name} {parent.last_name}
											</div>
											<div className="col-span-2">{parent.relation_with_child}</div>
										</div>
									))}
							</div>
						</div>
						<TextField
							name="email"
							value={emails}
							onChange={(e) => setEmails(e.target.value)}
							id="emails"
							fullWidth
							label="Emails"
							placeholder="Comma separated list of emails"
						/>
						<div className="self-center mt-32">
							{sending ? (
								<div className="circle-bar">
									<CircularProgress size={35} />
								</div>
							) : (
								<CustomButton onClick={submit}>Send Report</CustomButton>
							)}
						</div>
					</>
				)}
			</div>
		</>
	);
}

export default SendEmailDialog;
