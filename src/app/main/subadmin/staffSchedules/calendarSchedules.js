/* eslint-disable jsx-a11y/alt-text */
import React, { useEffect, useState } from 'react';
import moment from 'moment';
import { Chip, Avatar } from '@material-ui/core';
import history from '@history';

function CalendarSchedules({ week, schedule, rooms, staff, teacher }) {
	const scheduleProperties = {
		'work-shift': {
			name: 'Work Shift',
			image: 'workshift',
		},
		pto: { name: 'PTO', image: 'pto' },
		sick: { name: 'Sick', image: 'sick' },
	};
	const [schedules, setSchedules] = useState([]);
	let calendarSchedules = [];
	let recurringSchedules = [];

	const recurringWorkSchedules = [];
	let nonRecurringWorkSchedules = [];
	let ptoSchedules = [];
	let sickSchedules = [];
	const allSchedules = [];

	useEffect(() => {
		recurringSchedules = schedule.filter((s) => s.recurring === 1 && s.schedule_type === 'work-shift');
		nonRecurringWorkSchedules = schedule.filter((s) => s.recurring === 0 && s.schedule_type === 'work-shift');
		ptoSchedules = schedule.filter((s) => s.recurring === 0 && s.schedule_type === 'sick');
		sickSchedules = schedule.filter((s) => s.recurring === 0 && s.schedule_type === 'pto');

		// Creating schedules out of recurring days
		recurringSchedules.map((recurringSchedule) => {
			let d = [];

			for (let i = 0; i < week.length; i++) {
				d.push(moment(week[i]).format('dddd').toLowerCase());
			}

			const days = recurringSchedule.shifts.map((shift) => shift.day);
			let dates = days.map((day) => {
				if (d.indexOf(day) !== -1) {
					return d.indexOf(day);
				}
			});

			// This date array now contains the dates on which the given event will be held
			dates = dates.map((dateIndex) => {
				return week[dateIndex];
			});

			// If the date in the recurring schedules array is before startDate, then here we delete that date from the dates array
			for (let i = 0; i < dates.length; i++) {
				if (moment(dates[i]).diff(moment(recurringSchedule.start_date)) < 0) {
					dates.splice(dates.indexOf(dates[i]), 1);
					i = -1;
				}
			}

			// If the date in the recurring schedules array is ahead of endDate, then here we delete that date from the dates array
			for (let i = 0; i < dates.length; i++) {
				if (moment(recurringSchedule.end_date).diff(moment(dates[i]), 'days') < 0) {
					dates.splice(dates.indexOf(dates[i]), 1);
					i = -1;
				}
			}

			// Here we have finally arranged dates in ascending order
			dates.sort((a, b) => {
				return moment(a).diff(moment(b));
			});

			// Merging consecutive days of recurring schedules
			const dayOfDates = dates.map((date) => moment(date).format('dddd').toLowerCase());

			d.map((day, key) => {
				if (dayOfDates.includes(day)) {
				} else {
					d[key] = undefined;
				}
			});

			for (let i = 0; i < d.length; i++) {
				if (d[i] && d[i + 1]) {
					d[i] = `${d[i]}-${d[i + 1]}`;
					d.splice(i + 1, 1);
					i = -1;
					continue;
				}
			}

			d = d.filter((date) => date !== undefined);

			const dayOfWeek = [];
			for (let i = 0; i < 7; i++) {
				dayOfWeek.push(moment(week[i]).format('dddd').toLowerCase());
			}

			d.map((day, key) => {
				const days = day.split('-');
				if (days.length > 0) {
					const firstDateIndex = dayOfWeek.indexOf(days[0]);
					const lastDateIndex = dayOfWeek.indexOf(days[days.length - 1]);
					d[key] = {
						start_date: week[firstDateIndex],
						end_date: week[lastDateIndex],
					};
				} else {
					const dateIndex = (d[key] = dayOfWeek.indexOf(days[0]));
					d[key] = {
						start_date: week[dateIndex],
						end_date: week[dateIndex],
					};
				}
			});
			dates = d;

			// Here we push additional information to schedule so as to enable editing this schedule later on
			dates.map((date) => {
				date.id = recurringSchedule.id;
				date.end_time = recurringSchedule.end_time;
				date.start_time = recurringSchedule.start_time;
				date.room_id = recurringSchedule.room_id;
				date.description = recurringSchedule.description;
				date.recurring = recurringSchedule.recurring;
				date.schedule_type = recurringSchedule.schedule_type;
				date.school_id = recurringSchedule.school_id;
				date.days = recurringSchedule.days;
				date.schedule_start_date = recurringSchedule.start_date;
				date.schedule_end_date = recurringSchedule.end_date;
				date.teacher_id = recurringSchedule.teacher_id;
				date.shifts = recurringSchedule.shifts;
				date.repeat_time = recurringSchedule.repeat_time;
			});
			// Now we store all the recurring work schedules in one variable
			recurringWorkSchedules.push(...dates);
		});

		// At this point, we have a list of recurring schedules with start date and end date,
		// and a list of pto and sick schedules
		// Now we ought to merge all three schedules in one array
		allSchedules.push(...recurringWorkSchedules, ...nonRecurringWorkSchedules, ...ptoSchedules, ...sickSchedules);

		// Checking whether the schedules ends after week or starts before the week
		allSchedules.map((schedule) => {
			if (!schedule.recurring && moment(week[0]).diff(moment(schedule.start_date), 'days') > 0) {
				const a = schedule.start_date;
				schedule.start_date = week[0];
				schedule.schedule_start_date = a;
				schedule.schedule_end_date = schedule.end_date;
			} else if (!schedule.recurring && moment(schedule.end_date).diff(moment(week[6]), 'days') > 0) {
				const a = schedule.end_date;
				schedule.end_date = week[6];
				schedule.schedule_end_date = a;
				schedule.schedule_start_date = schedule.start_date;
			}
		});

		// Now all schedules contains all the schedules of this week
		// Its time to sort these schedules w.r.t their start dates so that we can visualize them better
		calendarSchedules = [
			allSchedules.filter(
				(schedule) => moment(schedule.start_date).format('YYYY-MM-DD') === moment(week[0]).format('YYYY-MM-DD')
			),
			allSchedules.filter(
				(schedule) => moment(schedule.start_date).format('YYYY-MM-DD') === moment(week[1]).format('YYYY-MM-DD')
			),
			allSchedules.filter(
				(schedule) => moment(schedule.start_date).format('YYYY-MM-DD') === moment(week[2]).format('YYYY-MM-DD')
			),
			allSchedules.filter(
				(schedule) => moment(schedule.start_date).format('YYYY-MM-DD') === moment(week[3]).format('YYYY-MM-DD')
			),
			allSchedules.filter(
				(schedule) => moment(schedule.start_date).format('YYYY-MM-DD') === moment(week[4]).format('YYYY-MM-DD')
			),
			allSchedules.filter(
				(schedule) => moment(schedule.start_date).format('YYYY-MM-DD') === moment(week[5]).format('YYYY-MM-DD')
			),
			allSchedules.filter(
				(schedule) => moment(schedule.start_date).format('YYYY-MM-DD') === moment(week[6]).format('YYYY-MM-DD')
			),
		];

		// Sorting the schedules with their colspans in descending order
		calendarSchedules.map((schedules) => {
			schedules.map((schedule) => {
				schedule.colSpan = moment(schedule.end_date).diff(moment(schedule.start_date), 'days') + 1;
			});
			schedules.sort((a, b) => {
				return b.colSpan - a.colSpan;
			});
		});

		const finalArray = [];

		for (let i = 0; i < 7; i++) {
			if (!calendarSchedules[i][0]) {
				finalArray.push([{ colSpan: 1 }]);
			}

			if (calendarSchedules[i][0]) {
				finalArray.push(calendarSchedules[i]);
				let maxColSpan = calendarSchedules[i][0].colSpan;

				if (maxColSpan > 1) {
					const additionalSchedules = calendarSchedules.slice(i + 1, i + maxColSpan);

					additionalSchedules.map((a) => {
						a.forEach((b) => {
							calendarSchedules[i].push(b);
						});
					});
					finalArray.pop();
					finalArray.push(calendarSchedules[i]);

					const scheduleStartDates = finalArray[finalArray.length - 1].map((schedules) => {
						return schedules.start_date;
					});
					scheduleStartDates.sort((a, b) => {
						return moment(a).diff(moment(b), 'days');
					});

					const scheduleEndDates = finalArray[finalArray.length - 1].map((schedules) => {
						return schedules.end_date;
					});
					scheduleEndDates.sort((a, b) => {
						return moment(b).diff(moment(a), 'days');
					});
					maxColSpan = moment(scheduleEndDates[0]).diff(moment(scheduleStartDates[0]), 'days') + 1;
					i = i + maxColSpan - 1;
				}
			}
		}

		finalArray.map((schedules) => {
			schedules.sort((a, b) => {
				return b.colSpan - a.colSpan;
			});
		});

		finalArray.map((schedules) => {
			if (schedules[0].id === undefined) {
			} else {
				const scheduleStartDates = schedules.map((schedule) => {
					return schedule.start_date;
				});
				scheduleStartDates.sort((a, b) => {
					return moment(a).diff(moment(b), 'days');
				});
				const scheduleEndDates = schedules.map((schedule) => {
					return schedule.end_date;
				});
				scheduleEndDates.sort((a, b) => {
					return moment(b).diff(moment(a), 'days');
				});
				schedules[0].colSpan = moment(scheduleEndDates[0]).diff(moment(scheduleStartDates[0]), 'days') + 1;
			}
		});
		console.log(
			'schedules: ',
			finalArray.map((sch) => sch.filter((s) => s.schedule_type)).filter((a) => a.length).length
		);
		setSchedules(finalArray);
		// Now that we have a list of schedules sorted by their day of initialization, let's start displaying them
	}, [schedule, week]);

	function moveToEditPage(s) {
		s.room = rooms.filter((room) => {
			return room.id === s.room_id;
		});
		s.staff = staff;
		history.push({
			pathname: `/staff-schedule-edit${s.schedule_type}schedule`,
			state: s,
		});
	}

	function marginCalculator(schedule, scheduleArray) {
		const scheduleStartDates = scheduleArray.map((schedule) => {
			return schedule.start_date;
		});
		scheduleStartDates.sort((a, b) => {
			return moment(a).diff(moment(b), 'days');
		});

		let marginLeft =
			(moment(schedule.start_date).diff(moment(scheduleStartDates[0]), 'days') / scheduleArray[0].colSpan) * 100;
		if (marginLeft < 0) {
			marginLeft = 0;
		}
		marginLeft += '%';
		return marginLeft;
	}

	function widthCalculator(schedule, scheduleArray) {
		const scheduleStartDate = schedule.start_date;
		const scheduleEndDate = schedule.end_date;
		let width = ((moment(scheduleEndDate).diff(scheduleStartDate, 'days') + 1) / scheduleArray[0].colSpan) * 100;
		width += '%';
		return width;
	}

	return (
		<>
			{schedules.map((sch) => sch.filter((s) => s.schedule_type)).filter((a) => a.length).length > 0 && (
				<tr>
					<td className="table-side-header staff-name">
						<div className="flex flex-row">
							<span>
								<Avatar src={teacher.photo} />
							</span>
							<span>
								{teacher.first_name} {teacher.last_name}
							</span>
						</div>
					</td>
					{schedules.map((schedule, key) => {
						return (
							<td key={key} colSpan={schedule[0]?.colSpan}>
								<div>
									{schedule.map((s, key) => {
										return (
											<>
												{s.schedule_type && (
													<Chip
														style={{
															width: `${widthCalculator(s, schedule)}`,
															marginLeft: `${marginCalculator(s, schedule)}`,
														}}
														avatar={
															<img
																style={{ width: '46px', height: '46px' }}
																src={`assets/images/${
																	scheduleProperties[s.schedule_type].image
																}.png`}
															/>
														}
														label={scheduleProperties[s.schedule_type].name}
														className={`${s.schedule_type} schedule-pill`}
														key={key}
														onClick={() => {
															moveToEditPage(s);
														}}
													/>
												)}
											</>
										);
									})}
								</div>
							</td>
						);
					})}
				</tr>
			)}
		</>
	);
}

export default CalendarSchedules;
