import React, { useState } from 'react';
import './SuccessDialog.css';
import CloseIcon from '@material-ui/icons/Close';
import MuiDialogTitle from '@material-ui/core/DialogTitle';
import MuiDialogContent from '@material-ui/core/DialogContent';
import MuiDialogActions from '@material-ui/core/DialogActions';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import { withStyles } from '@material-ui/core/styles';
import { Dialog } from '@material-ui/core';
import history from '@history';

const styles = theme => ({
	root: {
		margin: 0,
		padding: theme.spacing(2)
	},
	closeButton: {
		position: 'absolute',
		right: theme.spacing(1),
		top: theme.spacing(1),
		color: theme.palette.grey[500]
	}
});

const DialogTitle = withStyles(styles)(props => {
	const { children, classes, onClose, ...other } = props;
	return (
		<MuiDialogTitle disableTypography className={classes.root} {...other}>
			<Typography variant="h6">{children}</Typography>
			{onClose ? (
				<IconButton aria-label="close" className={classes.closeButton} onClick={onClose}>
					<CloseIcon />
				</IconButton>
			) : null}
		</MuiDialogTitle>
	);
});

const DialogContent = withStyles(theme => ({
	root: {
		padding: theme.spacing(0)
	}
}))(MuiDialogContent);

const DialogActions = withStyles(theme => ({
	root: {
		margin: 0,
		padding: theme.spacing(1)
	}
}))(MuiDialogActions);
function SuccessDialog({ open, setopenImage }) {
	return (
		// <div className="account-popup">
		// 	<div>
		// 		<div className="account-icon-span">
		// 			<img src="assets/images/awesome-icon.svg" alt="verified" />
		// 		</div>
		// 		<h1 className="account-disable-text">Thank You</h1>
		// 		<p>You have successfully added your account</p>
		// 	</div>
		// </div>
		<div>
			<Dialog
				onClose={() => {
					setopenImage(!setopenImage);
					history.push('/settings');
				}}
				aria-labelledby="customized-dialog-title"
				open={open}
				maxWidth="sm"
			>
				<DialogTitle
					id="customized-dialog-title"
					onClose={() => {
						setopenImage(!setopenImage);
						history.push('/settings');
					}}
				/>
				<DialogContent>
					<div className="account-popup">
						<div>
							<div className="account-icon-span">
								<img src="assets/images/awesome-icon.svg" alt="verified" />
							</div>
							<h1 className="account-disable-text">Thank You</h1>
							<p>You have successfully added your account</p>
						</div>
					</div>
				</DialogContent>
			</Dialog>
		</div>
	);
}

export default SuccessDialog;
