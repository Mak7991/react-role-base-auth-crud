/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import { InputAdornment, TextField } from '@material-ui/core';
import { TimePicker as MuiTimePicker, MuiPickersUtilsProvider } from '@material-ui/pickers';
import { makeStyles } from '@material-ui/core/styles';
import DayjsUtils from '@date-io/dayjs';
import dayjs from 'dayjs';
import React, { useRef } from 'react';

const useStyles = makeStyles({
	root: {
		'& .MuiFormHelperText-root': {
			color: 'red',
		},
	},
});

export default function TimePicker({
	handleTimeChange,
	name,
	width = undefined,
	disabled = false,
	label,
	errTxts,
	value,
	setValue,
}) {
	const classes = useStyles();
	const ref = useRef(null);
	return (
		<>
			<div style={{ width }} onClick={() => ref.current.click()}>
				<TextField
					className={classes.root}
					id="time"
					type="text"
					style={{ width: '100%' }}
					onClick={(e) => e.preventDefault()}
					name={name}
					InputLabelProps={{ shrink: true }}
					value={value ? dayjs(value).format('hh:mm A') : '--:-- --'}
					label={label}
					error={errTxts[name]}
					helperText={errTxts[name]}
					disabled={disabled}
					InputProps={{
						endAdornment: (
							<InputAdornment>
								<i style={{ color: '#4da0ed' }} className="far fa-clock" />
							</InputAdornment>
						),
					}}
				/>
			</div>
			<MuiPickersUtilsProvider utils={DayjsUtils}>
				<MuiTimePicker
					autoOk
					style={{ display: 'none' }}
					inputRef={ref}
					value={value}
					disabled={disabled}
					onChange={(e) => {
						setValue(e);
						const date = new Date(e);
						handleTimeChange(dayjs(date).format('HH:mm'), name);
					}}
				/>
			</MuiPickersUtilsProvider>
		</>
	);
}
