/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
import React, { useState, useEffect } from 'react';
import {
	Typography,
	FormControl,
	FormControlLabel,
	Checkbox,
	Select,
	MenuItem,
	InputLabel,
	CircularProgress,
	Paper,
	IconButton
} from '@material-ui/core';
import { getStudents } from '../../../../services/students/students';
import { getAllRooms } from 'app/services/rooms/rooms';
import { useDispatch } from 'react-redux';
import * as Actions from 'app/store/actions';
import InfiniteScroll from 'react-infinite-scroll-component';
import CustomButton from 'app/customComponents/CustomButton/CustomButton';
import IndividualStudentMessageForm from './individualStudentMessageForm';
import history from '@history';

function IndividualMessageStudentSelection({ setActiveTab }) {
	const dispatch = useDispatch();
	const [displayStudentSelectionPage, setDisplayStudentSelectionPage] = useState(true);
	const [students, setStudents] = useState([]);
	const [selectedRoom, setSelectedRoom] = useState('');
	const [rooms, setAllRooms] = useState([]);
	const [selectAll, setSelectAll] = useState(false);
	const [isStudentsLoading, setStudentsLoading] = useState(false);
	const [page, setPage] = useState(1);
	const [hasMore, setHasMore] = useState(false);
	const [selectedStudents, setSelectedStudents] = useState([]);
	const [loadingMore, setLoadingMore] = useState(false);
	const [totalstudents, setTotalstudents] = useState(0);

	useEffect(() => {
		getAllRooms()
			.then(({ data }) => {
				setAllRooms(data);
			})
			.catch(() => {
				dispatch(
					Actions.showMessage({
						message: 'Failed to fetch data, please refresh',
						variant: 'error'
					})
				);
			});
	}, []);

	useEffect(() => {
		setStudents([]);
		setStudentsLoading(true);
		getStudents('', '', selectedRoom, '', 1, '')
			.then(({ data }) => {
				setStudents(data.data);
				setTotalstudents(data.total);
				if (data.current_page < data.last_page) {
					setPage(2);
					setHasMore(true);
				} else {
					setHasMore(false);
				}
			})
			.catch(() => {
				dispatch(
					Actions.showMessage({
						message: 'Failed to fetch data, please refresh',
						variant: 'error'
					})
				);
			})
			.finally(() => {
				setStudentsLoading(false);
			});
	}, [selectedRoom]);

	useEffect(() => {
		if (selectAll) {
			setSelectedStudents(students);
		} else if (students === selectedStudents) {
			setSelectedStudents([]);
		}
	}, [selectAll, students]);

	function handleStudentSelection(student) {
		let studentsArray = selectedStudents;

		if (!studentsArray.includes(student)) {
			studentsArray = [...studentsArray, student];
			setSelectedStudents(studentsArray);
			return;
		}
		if (studentsArray.includes(student)) {
			studentsArray = studentsArray.filter(s => s.id !== student.id);
			setSelectedStudents(studentsArray);
		}
	}

	function handleLoadMore() {
		setLoadingMore(true);
		getStudents('', '', selectedRoom, '', page, '')
			.then(({ data }) => {
				setStudents(students.concat(data.data));
				if (data.current_page < data.last_page) {
					setPage(page + 1);
					setHasMore(true);
				} else {
					setHasMore(false);
				}
			})
			.catch(() => {
				dispatch(
					Actions.showMessage({
						message: 'Failed to fetch data, please refresh',
						variant: 'error'
					})
				);
			})
			.finally(() => {
				setLoadingMore(false);
			});
	}

	return (
		<>
			{displayStudentSelectionPage && (
				<div className="m-32">
					<div className="flex justify-between items-center">
						<span style={{ paddingTop: '3px' }}>
							<Typography variant="subtitle1" className="font-bold">

								<h1 style={{ fontSize: '20px', display: 'inlineblock' }}>
									<span className="">
										<IconButton
											onClick={() => {
												setActiveTab(0);
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
									Select Students</h1>

							</Typography>
						</span>
						<span className="flex flex-row items-center">
							<span style={{ paddingRight: '35px' }}>
								<FormControl variant="standard" className="">
									<InputLabel id="relationLabel">Room</InputLabel>
									<Select
										onChange={e => setSelectedRoom(e.target.value)}
										labelId="roomLable"
										id="room-selection"
										label="Room"
										name="selectedRoom"
										style={{ width: 150 }}
									>
										{rooms?.map((room, key) => {
											return (
												<MenuItem key={key} value={room.id}>
													{room.name}
												</MenuItem>
											);
										})}
									</Select>
								</FormControl>
							</span>
							<span>
								<FormControlLabel
									control={
										<Checkbox
											size="small"
											checked={selectAll}
											name="selectAll"
											style={{ color: 'blue' }}
											onChange={() => setSelectAll(!selectAll)}
										/>
									}
									label={
										<Typography variant="subtitle1">{!selectAll ? 'S' : 'Des'}elect all</Typography>
									}
								/>
							</span>
						</span>
					</div>
					<div className="bg-white rounded mt-28 pt-32 rooms-list-container">
						{isStudentsLoading ? (
							<div className="load-spinner text-align-center">
								<CircularProgress size={35} />
							</div>
						) : students.length ? (
							<>
								<div className="grid grid-cols-7 gap-28 p-12 rooms-grid" id="students">
									{students.map((student, key) => {
										return (
											<Paper
												onClick={() => handleStudentSelection(student)}
												key={key}
												elevation={5}
												className={`room-paper text-align-center `}
											>
												<div>
													<div>
														<img
															src={
																selectedStudents.includes(student)
																	? 'assets/images/tick.jpg'
																	: student.photo
															}
															alt={student.first_name + ' ' + student.last_name}
															className="img-pic"
														/>
													</div>
													<div className="hd-ann">
														<Typography
															variant="subtitle1"
															className="mt-12"
															style={{
																overflow: 'hidden',
																textOverflow: 'ellipsis',
																whiteSpace: 'nowrap'
															}}
														>
															{student.first_name + ' ' + student.last_name}
														</Typography>
													</div>
												</div>
											</Paper>
										);
									})}
									<InfiniteScroll
										dataLength={students.length}
										next={handleLoadMore}
										hasMore={hasMore}
										scrollableTarget="students"
									/>
								</div>
								{loadingMore && (
									<div className="text-align-center">
										<CircularProgress size={35} />
									</div>
								)}
							</>
						) : (
							<div className="text-align-center">No students</div>
						)}


					</div>
					<div>
						{!isStudentsLoading && (
							<div className="flex justify-center buttons-containers back-button">
								<span>
									<CustomButton
										variant="secondary"
										width={140}
										onClick={() => {
											setActiveTab(0);
										}}
									>
										Cancel
									</CustomButton>
								</span>
								<CustomButton
									variant="primary"
									width={140}
									onClick={() => {
										if (selectedStudents.length === 0) {
											dispatch(
												Actions.showMessage({
													message: 'Please select the student first!',
													variant: 'error'
												})
											);
										} else {
											setDisplayStudentSelectionPage(false);
										}
									}}
								>
									Next
								</CustomButton>
							</div>
						)}
					</div>
				</div>
			)}
			{!displayStudentSelectionPage && (
				<IndividualStudentMessageForm setActiveTab={setActiveTab} selectedStudents={selectedStudents} selectAll={selectAll} totalstudents={totalstudents} />
			)}
		</>
	);
}

export default IndividualMessageStudentSelection;
