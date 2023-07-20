/* eslint-disable jsx-a11y/media-has-caption */
/* eslint-disable jsx-a11y/alt-text */
import React from 'react';
import * as ShowMediaModal from 'app/store/actions';
import { useDispatch } from 'react-redux';
import Close from '@material-ui/icons/Close';
import Dialog from '@material-ui/core/Dialog';
import makeStyles from '@material-ui/styles/makeStyles';
import PlayArrowOutlined from '@material-ui/icons/PlayArrowOutlined';
import OnlyMediaComponent from './OnlyMediaComponent';

const useStyles = makeStyles(() => ({
	backDrop: {
		backdropFilter: 'blur(10px)',
		backgroundColor: 'rgba(0,0,30,0.4)',
	},
}));
const MediaRenderer = ({ media, photo, video, videoThumbnail }) => {
	const [pictureLarge, setPictureLarge] = React.useState(null);
	const classes = useStyles();
	const dispatch = useDispatch();

	const showMoreMedia = () => {
		dispatch(
			ShowMediaModal.openMediaDialog({
				children: <OnlyMediaComponent media={media} />,
			})
		);
	};

	if (photo) {
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
				<img
					onClick={() => setPictureLarge(photo)}
					src={photo}
					style={{
						margin: '16px 0px',
						borderRadius: '11px',
						height: 203,
						width: 373,
						objectFit: 'cover',
					}}
				/>
			</>
		);
	}
	if (video) {
		return (
			<>
				<video
					controls
					poster={videoThumbnail}
					src={video}
					style={{
						margin: '16px 0px',
						borderRadius: '11px',
						height: 203,
						width: 373,
						objectFit: 'cover',
					}}
				/>
			</>
		);
	}
	if (media.length === 1) {
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
				{media[0].type === 'image' ? (
					<img
						onClick={() => setPictureLarge(media[0].link)}
						// crossOrigin="*"
						src={media[0].link}
						style={{
							margin: '16px 0px',
							borderRadius: '11px',
							height: 203,
							width: 373,
							objectFit: 'cover',
						}}
					/>
				) : (
					<video
						controls
						poster={media[0].thumb}
						src={media[0].link}
						style={{
							margin: '16px 0px',
							borderRadius: '11px',
							height: 203,
							width: 373,
							objectFit: 'cover',
						}}
					/>
				)}
			</>
		);
	}
	if (media.length === 2) {
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
				<div
					className="flex"
					style={{
						margin: '16px 0px',
						borderRadius: '11px',
						height: 203,
						width: 373,
						objectFit: 'cover',
					}}
				>
					{media.map((item, index) => {
						return (
							<>
								{item.type === 'image' ? (
									<img
										onClick={() => setPictureLarge(item.link)}
										// crossOrigin="*"
										src={item.link}
										style={{
											margin: '16px 0px',
											width: '50%',
											objectFit: 'cover',
										}}
									/>
								) : (
									<video
										controls
										poster={item.thumb}
										src={item.link}
										style={{
											margin: '16px 0px',
											width: '50%',
											objectFit: 'cover',
										}}
									/>
								)}
							</>
						);
					})}
				</div>
			</>
		);
	}
	if (media.length > 2) {
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
				<div
					className="flex"
					style={{
						height: 200,
						width: 373,
						objectFit: 'cover',
					}}
				>
					{media[0]?.type === 'image' ? (
						<img
							onClick={() => setPictureLarge(media[0].link)}
							// crossOrigin="*"
							src={media[0]?.link}
							style={{
								height: '100%',
								width: 275,
								objectFit: 'cover',
							}}
						/>
					) : (
						<video
							controls
							poster={media[0]?.thumb}
							src={media[0]?.link}
							style={{
								height: '100%',
								width: 275,
								objectFit: 'cover',
							}}
						/>
					)}
					<div className="flex flex-col">
						{media?.slice(1, 3).map((item, index) => {
							return index !== 1 ? (
								<div key={index}>
									{item?.type === 'image' ? (
										<img
											// crossOrigin="*"
											onClick={() => setPictureLarge(item.link)}
											src={item?.link}
											style={{
												width: 98,
												height: 100,
												objectFit: 'cover',
											}}
										/>
									) : (
										<div key={index} className="relative">
											<video
												controls
												poster={item?.thumb}
												src={item?.link}
												style={{
													width: 98,
													height: 100,
													objectFit: 'cover',
												}}
											/>
											<div
												className="black-cover text-white cursor-pointer"
												onClick={() => {
													showMoreMedia();
												}}
											>
												<PlayArrowOutlined />
											</div>
										</div>
									)}
								</div>
							) : (
								// put a black shade over the last image and show count of remaining images / videos

								<div key={index} className="relative">
									{item?.type === 'image' ? (
										<img
											// crossOrigin="*"
											onClick={() => setPictureLarge(item.link)}
											src={item?.link}
											style={{
												width: 98,
												height: 100,
												objectFit: 'cover',
											}}
										/>
									) : (
										<div key={index} className="relative">
											<video
												controls
												poster={item?.thumb}
												src={item?.link}
												style={{
													width: 98,
													height: 100,
													objectFit: 'cover',
												}}
											/>
											{media.length === 3 && (
												<div
													className="black-cover text-white cursor-pointer"
													onClick={() => {
														showMoreMedia();
													}}
												>
													<PlayArrowOutlined />
												</div>
											)}
										</div>
									)}
									{media?.length > 3 && (
										<div
											className="black-cover text-white cursor-pointer"
											onClick={() => {
												showMoreMedia();
											}}
										>
											+{media?.length - 3}
										</div>
									)}
								</div>
							);
						})}
					</div>
				</div>
			</>
		);
	}
	return null;
};

export default MediaRenderer;
