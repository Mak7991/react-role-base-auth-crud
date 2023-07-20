import React from 'react';

const SuccessDialog = () => {
	return (
		<div className="success-popup">
			<div>
				<div className="success-icon">
					<img
						alt="Drop-Box"
						src="assets/images/awesome-icon.svg"
						height="100%"
						width="100%"
						style={{ alignSelf: 'center', marginTop: 5 }}
					/>
				</div>
				<h1 className="popup-text">Your roster has been uploaded successfully</h1>
			</div>
		</div>
	);
};

export default SuccessDialog;
