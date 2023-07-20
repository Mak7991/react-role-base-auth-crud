import React from 'react';

const MediaPopup = ({ media, photo, video, videoThumbnail}) => {
	if (photo) {
		return (
			<img
				src={photo}
				style={{
					margin: '16px 0px',
					borderRadius: '11px',
					height: 203,
					width: 373
				}}
			/>
		);
	}
	if (video) {
		return (
			<video
				controls
				poster={videoThumbnail}
				src={video}
				style={{
					margin: '16px 0px',
					borderRadius: '11px',
					height: 203,
					width: 373
				}}
			/>
		);
	}
	if (media.length === 1) {
		return media[0].type === 'image' ? (
			<img
				crossOrigin="*"
				src={media[0].link}
				style={{
					margin: '16px 0px',
					borderRadius: '11px',
					height: 203,
					width: 373
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
					width: 373
				}}
			/>
		);
	}
	if (media.length === 2) {
		return (
			<div
				style={{
					margin: '16px 0px',
					borderRadius: '11px',
					height: 203,
					width: 373
				}}
			>
				{media.map((item, index) => {
					return (
						<div key={index} className="flex-1">
							{item.type === 'image' ? (
								<img
									crossOrigin="*"
									src={item.link}
									style={{
										margin: '16px 0px'
									}}
								/>
							) : (
								<video
									controls
									poster={item.thumb}
									src={item.link}
									style={{
										margin: '16px 0px'
									}}
								/>
							)}
						</div>
					);
				})}
			</div>
		);
	}
	return null;
};

export default MediaPopup;