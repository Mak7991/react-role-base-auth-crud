import React from 'react';
import './CustomButton.css';

function CustomButton({
	onClick,
	size,
	type,
	height,
	width,
	fontSize,
	children,
	disabled,
	padding,
	textAlign,
	marginTop,
	background,
	style,
	marginLeft,
	marginRight,
	id
}) {
	return (
		<button
			className={`add-btn add-btn-${size} cursor-pointer ${disabled ? 'disabled' : ''}`}
			style={{
				...style,
				height,
				width,
				fontSize,
				padding,
				textAlign,
				marginTop,
				background,
				marginLeft,
				marginRight
			}}
			type={type || 'button'}
			disabled={disabled}
			onClick={onClick}
			id={id}
		>
			{children}
		</button>
	);
}

export default CustomButton;
