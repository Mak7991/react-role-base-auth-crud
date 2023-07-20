/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/media-has-caption */
import React, { useState, useEffect, useRef } from 'react';
import Hls from 'hls.js';
import './index.css';
import { Avatar } from '@material-ui/core';

function Streaming({ room }) {
	let streamNotPlaying = true;
	const [videoBannerText, setVideoBannerText] = useState('Loading');
	const playerRef = useRef(null);
	const boxRef = useRef(null);
	const hls = new Hls();

	useEffect(() => {
		if (room.stream_url) {
			if (Hls.isSupported()) {
				hls.loadSource(room.stream_url);
				hls.attachMedia(playerRef.current);

				hls.on(Hls.Events.BUFFER_APPENDED, () => {
					streamNotPlaying = false;
					setVideoBannerText('Live');
				});
				setTimeout(() => {
					if (streamNotPlaying) {
						setVideoBannerText('Trying to reconnect');
						// hls.destroy();
						hls.loadSource(room.stream_url);
						hls.attachMedia(playerRef.current);
						setTimeout(() => {
							if (streamNotPlaying) {
								setVideoBannerText('Failed to connect, slow internet');
								hls.stopLoad();
							}
						}, 5000);
					}
				}, 5000);
			}
		}
		return () => {
			hls.destroy();
		};
	}, [room.stream_url]);

	const isLive = () => videoBannerText === 'Live';

	return (
		<div className="flex justify-center items-center">
			<div ref={boxRef} className="w-full video-player-box rounded-lg">
				{/* <video
					id={room.id}
					preload="true"
					className="rounded-lg video-player"
					ref={playerRef}
					// autoPlay
					controls
				/> */}
				<video
					preload="true"
					controls
					id={room.id}
					ref={playerRef}
					autoPlay
					muted
					className="rounded-lg video-player"
				></video>
				<div className="video-player-title flex items-center col-gap-8">
					<Avatar src={room.thumb} />
					<div>{room.name}</div>
				</div>
				{room.stream_url ? (
					<>
						<div className={`btn_live ${isLive() ? '' : 'not_btn_live'} z-20`}>
							{videoBannerText || 'Live'}
							<span className={`${isLive() ? 'live-icon' : 'not-live-icon'}`} />
						</div>
					</>
				) : (
					''
				)}
				{!room.stream_url ? <div className="stream-not-running-text">Live Streaming Is Not Available</div> : ''}
			</div>
		</div>
	);
}

export default Streaming;
