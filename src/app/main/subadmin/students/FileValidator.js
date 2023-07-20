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

const customParseFormat = require('dayjs/plugin/customParseFormat');

dayjs.extend(customParseFormat);

function FileValidator({ file, type, rooms }) {
	const dispatch = useDispatch();
	const [rows, setRows] = useState([]);
	const [errList, setErrList] = useState([]);
	const [isValidating, setIsValidating] = useState(true);
	const [errs, setErrs] = useState(false);
	const [open, setOpen] = useState(false);
	const [isAdding, setIsAdding] = useState(false);

	const handleProceedAnyway = () => {
		setOpen(true);
	};

	useEffect(() => {
		if (type === 'local') {
			const reader = new FileReader();
			reader.onload = (e) => {
				const data = e.target.result;
				const readedData = XLSX.read(data, { type: 'binary' });
				const wsname = readedData.SheetNames[0];
				const ws = readedData.Sheets[wsname];
				const dataParse = XLSX.utils.sheet_to_json(ws, { header: 1, raw: false });
				const arrays = dataParse.filter((array) => array.length !== 0);
				console.log(arrays);
				const validFormat = [
					'first_name',
					'last_name',
					'dob',
					'gender',
					'homeroom',
					'parent first_name',
					'parent last_name',
					'select',
					'relation with child',
					'parent contact no',
					'parent email address',
					'address',
				];
				if (arrays[0].length < validFormat.length) {
					dispatch(
						Actions.showMessage({
							message: 'Roster format is invalid. Kindly use the format provided.',
							variant: 'error',
							autoHideDuration: 3000,
						})
					);
					setOpen(false);
					dispatch(Actions.closeDialog());
					return;
				}
				for (let i = 0; i < arrays[0].length; i++) {
					if (arrays[0][i].toLowerCase() !== validFormat[i]) {
						dispatch(
							Actions.showMessage({
								message: 'Roster format is invalid. Kindly use the format provided.',
								variant: 'error',
								autoHideDuration: 3000,
							})
						);
						setOpen(false);
						dispatch(Actions.closeDialog());
						return;
					}
				}
				arrays.shift();
				arrays.forEach((arr) => arr.shift());
				setRows(arrays);
				const temp = [];
				for (let i = 0; i < arrays.length; i += 1) {
					for (let j = 0; j < arrays[i].length; j += 1) {
						arrays[i][j] = arrays[i][j]?.trim();
					}
				}

				// Check for not matching room names
				for (let i = 0; i < arrays.length; i += 1) {
					temp[i] = [];
					if (!rooms.map((room) => room.toLowerCase()).includes(arrays[i][4]?.toLowerCase())) {
						temp[i][4] = 'Room not available';
					}
				}

				// Check for first name

				for (let i = 0; i < arrays.length; i += 1) {
					if (/[^a-zA-Z]/.test(arrays[i][0])) {
						temp[i][0] = 'Invalid first name';
					}
				}

				// Check for last name

				for (let i = 0; i < arrays.length; i += 1) {
					if (/[^a-zA-Z]/.test(arrays[i][1])) {
						temp[i][1] = 'Invalid second name';
					}
				}

				// Check for valid dob

				for (let i = 0; i < arrays.length; i += 1) {
					if (!dayjs(arrays[i][2], 'YYYY-MM-DD', true).isValid()) {
						temp[i][2] = 'Invalid date';
					}
					if (
						arrays[i][2]?.split('-')[0]?.length !== 4 ||
						arrays[i][2]?.split('-')[1]?.length !== 2 ||
						arrays[i][2]?.split('-')[2]?.length !== 2
					) {
						temp[i][2] = 'Invalid date format';
					}
				}

				// Check for gender value
				for (let i = 0; i < arrays.length; i += 1) {
					if (!['male', 'female'].includes(arrays[i][3]?.toLowerCase())) {
						temp[i][3] = 'Incorrect gender';
					}
				}

				// Check for parent first name

				for (let i = 0; i < arrays.length; i += 1) {
					if (/[^a-zA-Z]/.test(arrays[i][5])) {
						temp[i][5] = 'Invalid parent first name';
					}
				}

				// Check for parent last name

				for (let i = 0; i < arrays.length; i += 1) {
					if (/[^a-zA-Z]/.test(arrays[i][6])) {
						temp[i][6] = 'Invalid parent second name';
					}
				}

				// Check for select value
				for (let i = 0; i < arrays.length; i += 1) {
					if (!['parent', 'legal guardian'].includes(arrays[i][7]?.toLowerCase())) {
						temp[i][7] = 'Incorrect Select';
					}
				}

				// Check for relation value
				for (let i = 0; i < arrays.length; i += 1) {
					if (!['father', 'mother', 'legal guardian'].includes(arrays[i][8]?.toLowerCase())) {
						temp[i][8] = 'Incorrect Relation';
					}
				}

				// Check for valid parent email

				for (let i = 0; i < arrays.length; i += 1) {
					if (!/^\S+@\S+\.\S+$/.test(arrays[i][10])) {
						temp[i][10] = 'Invalid email';
					}
				}

				// Check for valid phone number

				for (let i = 0; i < arrays.length; i += 1) {
					if (arrays[i][9]) {
						if (
							!Number.isFinite(
								Number(
									arrays[i][9]
										.split(' ')
										.join('')
										.split('-')
										.join('')
										.split('(')
										.join('')
										.split(')')
										.join('')
								)
							)
						) {
							temp[i][9] = 'Invalid phone number';
						}
					}
				}

				// Check for empty table cells
				for (let i = 0; i < arrays.length; i += 1) {
					for (let j = 0; j < 12; j += 1) {
						if (!arrays[i][j]) {
							temp[i][j] = 'Missing Value';
						}
					}
				}
				setIsValidating(false);
				setErrList(temp);
			};
			reader.readAsBinaryString(file);
		}
	}, [rooms]);

	// Check if errors exist or not
	useEffect(() => {
		if (isValidating) {
			return;
		}
		if (errList.flat().length) {
			setErrs(true);
		} else {
			setErrs(false);
			uploadData();
		}
	}, [errList]);

	const uploadData = () => {
		const allrows = rows.map((array) => ({
			first_name: array[0],
			last_name: array[1],
			dob: array[2],
			gender: array[3],
			home_room: array[4],
			parent_first_name: array[5],
			parent_last_name: array[6],
			emergency_contact: true,
			select: array[7],
			relation_with_child: array[8],
			parent_phone: array[9],
			parent_email: array[10],
			address: array[11],
		}));
		if (!allrows.length) {
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
		const data = allrows.filter((_, i) => !errList[i]?.length);

		uploadRosterJSON({ data, roster_type: 'perfect_day' })
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
									<TableCell className="bg-white studentTableHeader" align="left">
										Date of Birth
									</TableCell>
									<TableCell className="bg-white studentTableHeader" align="left" colSpan={8}>
										Gender
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
										Select
									</TableCell>
									<TableCell className="bg-white studentTableHeader" align="left" colSpan={8}>
										Relation with Child
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
									return (
										<TableRow key={i} className={`${errList[i]?.length ? 'bg-red-100' : ''}`}>
											<TableCell className="break-word" component="th" scope="row" align="left">
												{i + 1}
											</TableCell>
											<TableCell
												className={`break-word ${
													errList[i]?.length
														? errList[i][0]?.length
															? 'bg-red-200'
															: ''
														: ''
												}`}
												align="left"
											>
												{row[0]}
											</TableCell>
											<TableCell
												className={`break-word ${
													errList[i]?.length
														? errList[i][1]?.length
															? 'bg-red-200'
															: ''
														: ''
												}`}
												align="left"
											>
												{row[1]}
											</TableCell>
											<TableCell
												className={`break-word ${
													errList[i]?.length
														? errList[i][2]?.length
															? 'bg-red-200'
															: ''
														: ''
												}`}
												align="left"
											>
												{row[2]}
											</TableCell>
											<TableCell
												className={`break-word ${
													errList[i]?.length
														? errList[i][3]?.length
															? 'bg-red-200'
															: ''
														: ''
												}`}
												align="left"
												colSpan={8}
											>
												{row[3]}
											</TableCell>
											<TableCell
												className={`break-word ${
													errList[i]?.length
														? errList[i][4]?.length
															? 'bg-red-200'
															: ''
														: ''
												}`}
												align="left"
												colSpan={8}
											>
												{row[4]}
											</TableCell>
											<TableCell
												className={`break-word ${
													errList[i]?.length
														? errList[i][5]?.length
															? 'bg-red-200'
															: ''
														: ''
												}`}
												align="left"
												colSpan={8}
											>
												{row[5]}
											</TableCell>
											<TableCell
												className={`break-word ${
													errList[i]?.length
														? errList[i][6]?.length
															? 'bg-red-200'
															: ''
														: ''
												}`}
												align="left"
												colSpan={8}
											>
												{row[6]}
											</TableCell>
											<TableCell
												className={`break-word ${
													errList[i]?.length
														? errList[i][7]?.length
															? 'bg-red-200'
															: ''
														: ''
												}`}
												align="left"
												colSpan={8}
											>
												{row[7]}
											</TableCell>
											<TableCell
												className={`break-word ${
													errList[i]?.length
														? errList[i][8]?.length
															? 'bg-red-200'
															: ''
														: ''
												}`}
												align="left"
												colSpan={8}
											>
												{row[8]}
											</TableCell>
											<TableCell
												className={`break-word ${
													errList[i]?.length
														? errList[i][9]?.length
															? 'bg-red-200'
															: ''
														: ''
												}`}
												align="left"
												colSpan={8}
											>
												{row[9]}
											</TableCell>
											<TableCell
												className={`break-word ${
													errList[i]?.length
														? errList[i][11]?.length
															? 'bg-red-200'
															: ''
														: ''
												}`}
												align="left"
												colSpan={8}
											>
												{row[10]}
											</TableCell>
											<TableCell
												className={`break-word ${
													errList[i]?.length
														? errList[i][12]?.length
															? 'bg-red-200'
															: ''
														: ''
												}`}
												align="left"
												colSpan={8}
											>
												{row[11]}
											</TableCell>
											<TableCell className="break-word" align="left" colSpan={8}>
												<ol>
													{errList[i]?.map((err, ind) => {
														return <li key={ind}>{err}</li>;
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

export default FileValidator;
