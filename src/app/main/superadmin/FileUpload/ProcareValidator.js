import React, { useEffect, useState } from 'react';
import XLSX from 'xlsx';
import {
	Table,
	TableHead,
	TableBody,
	TableCell,
	TableContainer,
	TableRow,
	Dialog,
	Paper,
	CircularProgress,
	IconButton,
} from '@material-ui/core';
import dayjs from 'dayjs';
import { uploadRosterJSON } from 'app/services/students/students';
import { useDispatch } from 'react-redux';
import * as Actions from 'app/store/actions';
import CustomButton from 'app/customComponents/CustomButton/CustomButton';
import CloseIcon from '@material-ui/icons/Close';
import SuccessDialog from './SuccessDialog';
import Papa from 'papaparse';
const customParseFormat = require('dayjs/plugin/customParseFormat');

dayjs.extend(customParseFormat);

function ProcareValidator({ file, type, rooms }) {
	const dispatch = useDispatch();
	const [rows, setRows] = useState([]);
	const [errList, setErrList] = useState([]);
	const [isValidating, setIsValidating] = useState(true);
	const [errs, setErrs] = useState(false);
	const [open, setOpen] = useState(false);
	const [isAdding, setIsAdding] = useState(false);
	let data = [];

	const handleProceedAnyway = () => {
		setOpen(true);
	};

	useEffect(() => {
		const reader = new FileReader();
		reader.onload = (e) => {
			const result = Papa.parse(e.target.result, {
				header: true, // Set this to true if the CSV file contains a header row
				delimiter: ',', // Set the delimiter used in the CSV file
				newline: '\n', // Set the newline character used in the CSV file
				quoteChar: '"', // Set the quote character used in the CSV file
				escapeChar: '\\', // Set the escape character used in the CSV file
				skipEmptyLines: true, // Set this to true to skip empty lines
			});
			console.log(result);
			const fields = [
				`Room`,
				`Child's Name`,
				`Address`,
				`Parent/Guardian Name(s)`,
				`Home Phone`,
				`Cell Phone`,
				`Email Address`,
			];
			for (let i = 0; i < fields.length; i++) {
				if (!result.meta.fields.includes(fields[i])) {
					dispatch(
						Actions.showMessage({
							message: 'Roster format is invalid. Kindly use the Procare CSV Export.',
							variant: 'error',
							autoHideDuration: 3000,
						})
					);
					setOpen(false);
					dispatch(Actions.closeDialog());
					return;
				}
			}
			data = [];
			let keys = [];
			const temp = [];
			for (let i = 0; i < result.data.length; i += 1) {
				keys = Object.keys(result.data[i]);
				keys.forEach((key) => {
					result.data[i][key] = result.data[i][key]?.trim();
				});
			}
			for (let i = 0; i < result.data.length; i += 1) {
				temp[i] = {};
				data[i] = {};
				data[i]['emergency_contact'] = true;
				if (!rooms.map((room) => room.toLowerCase()).includes(result.data[i]['Room']?.toLowerCase())) {
					temp[i]['home_room'] = 'Room not available';
				}
				data[i]['home_room'] = result.data[i]['Room'];

				let name = result.data[i][`Child's Name`].split(',');
				let first_name = name[1]?.trim();
				let last_name = name[0]?.trim();
				data[i]['first_name'] = first_name;
				data[i]['last_name'] = last_name;
				if (/[^a-zA-Z ]/.test(first_name)) {
					temp[i]['first_name'] = 'Invalid first name';
				}
				if (/[^a-zA-Z ]/.test(last_name)) {
					temp[i]['last_name'] = 'Invalid second name';
				}

				let parent_name = result.data[i][`Parent/Guardian Name(s)`].split(',');
				let parent_first_name = parent_name[1]?.trim();
				let parent_last_name = parent_name[0]?.trim();
				data[i]['parent_first_name'] = parent_first_name;
				data[i]['parent_last_name'] = parent_last_name;
				if (/[^a-zA-Z ]/.test(parent_first_name)) {
					temp[i]['parent_first_name'] = 'Invalid first name';
				}
				if (/[^a-zA-Z ]/.test(parent_last_name)) {
					temp[i]['parent_last_name'] = 'Invalid second name';
				}

				data[i]['address'] = result.data[i]['Address'].split('\r').join(' ')?.trim();

				let parent_phone = result.data[i]['Cell Phone'] || '';
				parent_phone = parent_phone
					.split(' ')
					.join('')
					.split('-')
					.join('')
					.split('(')
					.join('')
					.split(')')
					.join('')
					?.trim();
				data[i]['parent_phone'] = parent_phone;
				if (!Number.isFinite(Number(parent_phone))) {
					temp[i]['parent_phone'] = 'Invalid Phone';
				}

				data[i]['parent_email'] = result.data[i]['Email Address'] || '';
				if (!/^\S+@\S+\.\S+$/.test(data[i]['parent_email'])) {
					temp[i]['parent_email'] = 'Invalid email';
				}

				if (!data[i]['first_name']) {
					temp[i]['first_name'] = 'Missing Value';
				}
				if (!data[i]['last_name']) {
					temp[i]['last_name'] = 'Missing Value';
				}
				if (!data[i]['parent_first_name']) {
					temp[i]['parent_first_name'] = 'Missing Value';
				}
				if (!data[i]['parent_last_name']) {
					temp[i]['parent_last_name'] = 'Missing Value';
				}
				if (!data[i]['address']) {
					temp[i]['address'] = 'Missing Value';
				}
				if (!data[i]['home_room']) {
					temp[i]['home_room'] = 'Missing Value';
				}
				if (!data[i]['parent_email']) {
					temp[i]['parent_email'] = 'Missing Value';
				}
				if (!data[i]['parent_phone']) {
					temp[i]['parent_phone'] = 'Missing Value';
				}
			}
			setRows(data);
			setIsValidating(false);
			setErrList(temp);
		};
		reader.readAsText(file);
	}, [rooms]);

	// Check if errors exist or not
	useEffect(() => {
		if (isValidating) {
			return;
		}
		if (
			errList.some((obj) => {
				return !!Object.values(obj).some((value) => value.length > 0);
			})
		) {
			setErrs(true);
		} else {
			setErrs(false);
			uploadData();
		}
	}, [errList]);

	const uploadData = () => {
		if (!rows.length) {
			setOpen(false);
			dispatch(Actions.closeDialog());
			dispatch(
				Actions.showMessage({
					message: 'You uploaded an empty file',
					autoHideDuration: 1500,
					variant: 'error',
				})
			);
		}
		const filteredData = rows.filter(
			(_, i) =>
				!Object.values(errList[i]).some((value) => {
					console.log(value);
					return value.length > 0;
				})
		);
		console.log(filteredData);
		uploadRosterJSON({ data: filteredData, roster_type: 'procare' })
			.then((res) => {
				setOpen(false);
				dispatch(Actions.closeDialog());
				dispatch(
					Actions.openDialog({
						children: <SuccessDialog />,
					})
				);
			})
			.catch((err) => {
				console.log({ ...err });
				setIsAdding(false);
				dispatch(
					Actions.showMessage({
						message: 'Failed to upload roster',
						autoHideDuration: 1500,
						variant: 'error',
					})
				);
			});
	};

	return (
		<div className="p-32">
			{!isValidating && errs ? (
				<>
					<div className="flex justify-end">
						<IconButton onClick={() => dispatch(Actions.closeDialog())}>
							<CloseIcon />
						</IconButton>
					</div>
					<TableContainer id="Scrollable-table" component={Paper} className="">
						<Table stickyHeader className="" style={{ width: '' }}>
							<TableHead>
								<TableRow>
									<TableCell
										component="th"
										scope="row"
										className="bg-white studentTableHeader"
										align="left"
									>
										Sr. No
									</TableCell>
									<TableCell className="bg-white studentTableHeader" align="left">
										First Name
									</TableCell>
									<TableCell className="bg-white studentTableHeader" align="left">
										Last Name
									</TableCell>
									<TableCell className="bg-white studentTableHeader" align="left" colSpan={8}>
										Home Room
									</TableCell>
									<TableCell className="bg-white studentTableHeader" align="left" colSpan={8}>
										Parent First Name
									</TableCell>
									<TableCell className="bg-white studentTableHeader" align="left" colSpan={8}>
										Parent Last Name
									</TableCell>
									<TableCell className="bg-white studentTableHeader" align="left" colSpan={8}>
										Parent Contact Number
									</TableCell>
									<TableCell className="bg-white studentTableHeader" align="left" colSpan={8}>
										Parent Email Address
									</TableCell>
									<TableCell className="bg-white studentTableHeader" align="left" colSpan={8}>
										Address
									</TableCell>
									<TableCell className="bg-white studentTableHeader" align="left" colSpan={8}>
										Errors
									</TableCell>
								</TableRow>
							</TableHead>
							<TableBody>
								{rows.map((row, i) => {
									let isRowErr = Object.keys(errList[i]).some((key) => errList[i][key].length > 0);
									return (
										<TableRow key={i} className={`${isRowErr ? 'bg-red-100' : ''}`}>
											<TableCell className="break-word" component="th" scope="row" align="left">
												{i + 2}
											</TableCell>
											<TableCell
												className={`break-word ${
													errList[i]
														? errList[i]['first_name']?.length
															? 'bg-red-200'
															: ''
														: ''
												}`}
												align="left"
											>
												{row['first_name']}
											</TableCell>
											<TableCell
												className={`break-word ${
													errList[i]
														? errList[i]['last_name']?.length
															? 'bg-red-200'
															: ''
														: ''
												}`}
												align="left"
											>
												{row['last_name']}
											</TableCell>
											<TableCell
												className={`break-word ${
													errList[i]
														? errList[i]['home_room']?.length
															? 'bg-red-200'
															: ''
														: ''
												}`}
												align="left"
											>
												{row['home_room']}
											</TableCell>
											<TableCell
												className={`break-word ${
													errList[i]
														? errList[i]['parent_first_name']?.length
															? 'bg-red-200'
															: ''
														: ''
												}`}
												align="left"
												colSpan={8}
											>
												{row['parent_first_name']}
											</TableCell>
											<TableCell
												className={`break-word ${
													errList[i]
														? errList[i]['parent_last_name']?.length
															? 'bg-red-200'
															: ''
														: ''
												}`}
												align="left"
												colSpan={8}
											>
												{row['parent_last_name']}
											</TableCell>
											<TableCell
												className={`break-all ${
													errList[i]
														? errList[i]['parent_phone']?.length
															? 'bg-red-200'
															: ''
														: ''
												}`}
												align="left"
												colSpan={8}
											>
												{row['parent_phone']}
											</TableCell>
											<TableCell
												className={`break-all ${
													errList[i]
														? errList[i]['parent_email']?.length
															? 'bg-red-200'
															: ''
														: ''
												}`}
												align="left"
												colSpan={8}
											>
												{row['parent_email']}
											</TableCell>
											<TableCell
												className={`break-word ${
													errList[i]
														? errList[i]['address']?.length
															? 'bg-red-200'
															: ''
														: ''
												}`}
												align="left"
												colSpan={8}
											>
												{row['address']}
											</TableCell>
											<TableCell className="break-word" align="left" colSpan={8}>
												<ol>
													{Object.keys(errList[i])?.map((err, ind) => {
														return <li key={ind}>{errList[i][err]}</li>;
													})}
												</ol>
											</TableCell>
										</TableRow>
									);
								})}
							</TableBody>
						</Table>
					</TableContainer>
					<div className="flex justify-end mx-auto mt-10">
						<CustomButton width={140} variant="primary" onClick={handleProceedAnyway}>
							Proceed Anyway
						</CustomButton>
					</div>
				</>
			) : !isValidating && !errs ? (
				<div className="flex justify-center items-center">
					<CircularProgress size={35} />
				</div>
			) : (
				<div className="flex justify-center items-center">
					<CircularProgress size={35} />
				</div>
			)}
			<Dialog
				open={open}
				onClose={() => setOpen(false)}
				aria-labelledby="alert-dialog-title"
				aria-describedby="alert-dialog-description"
			>
				<div className="popup">
					<div>
						<div className="icon-span">
							<h2>!</h2>
						</div>
						<h1 className="disable-text">Only valid data will be added to the system. Proceed?</h1>
						{isAdding ? (
							<CircularProgress size={35} />
						) : (
							<>
								<button
									type="button"
									className="add-disable-btn"
									onClick={() => {
										setIsAdding(true);
										uploadData();
									}}
								>
									Yes
								</button>
								<button type="button" className="no-disable-btn" onClick={() => setOpen(false)}>
									No
								</button>
							</>
						)}
					</div>
				</div>
			</Dialog>
		</div>
	);
}

export default ProcareValidator;
