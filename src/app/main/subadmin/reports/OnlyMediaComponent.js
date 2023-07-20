/* eslint-disable jsx-a11y/media-has-caption */
/* eslint-disable jsx-a11y/alt-text */
import React from 'react';
import * as ShowMediaModal from 'app/store/actions';
import { useDispatch } from 'react-redux';
import Close from '@material-ui/icons/Close';
import Dialog from '@material-ui/core/Dialog';
import makeStyles from '@material-ui/styles/makeStyles';

const useStyles = makeStyles(() => ({
	backDrop: {
		backdropFilter: 'blur(10px)',
		backgroundColor: 'rgba(0,0,30,0.4)',
	},
}));
function OnlyMediaComponent({ media }) {
	const [pictureLarge, setPictureLarge] = React.useState(null);
	const classes = useStyles();
	const dispatch = useDispatch();

	return (
		<>
			{pictureLarge && (
				<Dialog
					open={pictureLarge}
					BackdropProps={{
						classes: {
							root: classes.backDrop,
						},
					}}
					onClose={() => {
						setPictureLarge(null);
					}}
				>
					<div className="larg_image flex flex-col">
						<div
							className="self-end cursor-pointer absolute profile-close"
							onClick={() => setPictureLarge(null)}
						>
							<Close />
						</div>
						<img src={pictureLarge} />
					</div>
				</Dialog>
			)}
			<div className="bg-white images-popup">
				<div className="flex justify-between images-popup-header">
					<div></div>
					<div>
						<i
							style={{ cursor: 'pointer' }}
							className="fas fa-times"
							onClick={() => dispatch(ShowMediaModal.closeMediaDialog())}
						/>
					</div>
				</div>
				<div id="scrollable-list" className="media-list-cont w-full">
					{media.map((item, index) => {
						return (
							<div key={index} className="flex-1">
								{item.type === 'image' ? (
									<img
										onClick={() => {
											console.log('H');
											setPictureLarge(item.link);
										}}
										// crossOrigin="*"
										src={item.link}
										style={{
											margin: '16px 0px',
											width: '100%',
											height: 300,
											backgroundColor: 'black',
											objectFit: 'contain',
										}}
									/>
								) : (
									<video
										controls
										poster={item.thumb}
										src={item.link}
										style={{
											margin: '16px 0px',
											width: '100%',
											height: 300,
											objectFit: 'contain',
											backgroundColor: 'black',
										}}
									/>
								)}
							</div>
						);
					})}
				</div>
			</div>
		</>
	);
}

export default OnlyMediaComponent;
