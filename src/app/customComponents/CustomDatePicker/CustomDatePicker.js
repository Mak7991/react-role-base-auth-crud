/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import DayjsUtils from '@date-io/dayjs';
import { DatePicker as MuiDatePicker, MuiPickersUtilsProvider } from '@material-ui/pickers';
import dayjs from 'dayjs';
import React, { useRef } from 'react';
import { TextField, InputAdornment } from '@material-ui/core';
import { ReactComponent as CalendarIcon } from './date.svg';

export default function DatePicker({
	value,
	setValue,
	errTxts,
	disabled = false,
	disableFuture = false,
	disablePast = false,
	label,
	minDate = undefined,
	maxDate = undefined,
	width = undefined,
	placeholder,
	id,
	paddingLeft,
	paddingRight,
	dateStyle
}) {
	const ref = useRef(null);

	return (
		<>
			<div style={{ width }} onClick={() => ref.current.click()}>
				<TextField
					className={dateStyle || ''}
					onChange={e => setValue(dayjs(e.target.value).isValid() ? dayjs(e.target.value) : '')}
					style={{ width: '100%', paddingLeft: paddingLeft || '', paddingRight: paddingRight || '' }}
					onClick={e => e.preventDefault()}
					value={value ? dayjs(value).format('MMM DD, YYYY') : placeholder || 'mm / dd / yyyy'}
					name="dob"
					type="text"
					InputLabelProps={{ shrink: true }}
					label={label}
					id={id}
					error={!!errTxts?.length}
					helperText={errTxts}
					disabled={disabled}
					InputProps={{
						endAdornment: (
							<InputAdornment position="end">
								<CalendarIcon />
							</InputAdornment>
						)
					}}
				/>
			</div>
			<MuiPickersUtilsProvider utils={DayjsUtils}>
				<MuiDatePicker
					autoOk
					disableFuture={disableFuture}
					disablePast={disablePast}
					inputRef={ref}
					style={{ display: 'none' }}
					format="dd/MM/yyyy"
					value={value}
					onChange={setValue}
					disabled={disabled}
					minDate={minDate}
					maxDate={maxDate}
					clearable
				/>
			</MuiPickersUtilsProvider>
		</>
	);
}
