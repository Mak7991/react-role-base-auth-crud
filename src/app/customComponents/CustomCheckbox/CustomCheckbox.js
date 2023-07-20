import React from 'react';
import './CustomCheckbox.css';

function CustomCheckbox({ row, onClick, id }) {
	return (
		<span className="cursor-pointer switch-btn">
			<label
				id={`disable-enable-label-${row.id}`}
				htmlFor={`disable-enable-${row.id}`}
				className={`switch ${row.status || 'switch-disabled'} `}
			>
				<input
					onClick={e => onClick(e, row)}
					name={`disable-enable-${row.id}`}
					id={`disable-enable-${row.id}`}
					type="checkbox"
					defaultChecked={!row.status}
					className="cursor-pointer"
				/>
				<div />
			</label>
		</span>
	);
}

export default CustomCheckbox;
