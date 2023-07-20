/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React, { useState, useEffect, useRef } from 'react';
import { Avatar, CircularProgress } from '@material-ui/core';
import '../live/index.css';
import Hls from 'hls.js';

function Streaming({ room, active, setMute }) {
	const [url, setUrl] = useState('');
	const [isVideoLoading, setIsVideoLoading] = useState(false);
	const [isPaused, setIsPaused] = useState(false);
	const [muted, setMuted] = useState(true);
	const [isFullscreen, setIsFullscreen] = useState(false);
	const [progress, setProgress] = useState(0);
	const [replayShow, setReplayShow] = useState(false);

	const playerRef = useRef(null);
	const boxRef = useRef(null);
	const hls = new Hls({
		maxMaxBufferLength: 10,
		liveSyncDuration: 3,
		liveMaxLatencyDuration: 5
	});
	useEffect(() => {
		if (active) {
			// setUrl(active?.url);
			if (Hls.isSupported()) {
				hls.loadSource(active);
				hls.attachMedia(playerRef.current);
				setUrl(active);
			}
			setIsPaused(false);
		} else {
			setUrl('');
			setProgress(0);
			const duration = document.getElementById('duration');
			duration.innerText = `00:00`;
		}
		return () => {
			hls.destroy();
		};
	}, [active]);

	useEffect(() => {
		setUrl('');
		setProgress(0);
		const duration = document.getElementById('duration');
		duration.innerText = `00:00`;
	}, [room]);

	const toggleFullScreen = () => {
		if (document.fullscreenElement) {
			setIsFullscreen(false);
			document.exitFullscreen();
		} else if (document.webkitFullscreenElement) {
			setIsFullscreen(false);
			document.webkitExitFullscreen();
		} else if (playerRef.current.webkitRequestFullscreen) {
			boxRef.current.webkitRequestFullscreen();
			setIsFullscreen(true);
		} else {
			boxRef.current.requestFullscreen();
			setIsFullscreen(true);
		}
	};
	const toggleVideoPlay = () => {
		if (isPaused) {
			hls.loadSource(active);
			setIsPaused(false);
			playerRef.current.play();
			hls.attachMedia(playerRef.current);
		} else {
			hls.stopLoad();
			setIsPaused(true);
			playerRef.current.pause();
		}
		setReplayShow(false);
	};
	const toggleMute = () => {
		playerRef.current.muted = !playerRef.current.muted;
		const volume = document.getElementById('volume-lvl');
		if (playerRef.current.muted) {
			setMuted(true);
			volume.setAttribute('data-volume', volume.value);
			volume.value = 0;
			setMute(0);
		} else {
			setMuted(false);
			setMute(1);
			volume.value = volume.dataset.volume;
		}
	};

	const updateVolume = e => {
		if (e.target.value !== '0') {
			playerRef.current.muted = false;
			setMuted(false);
			setMute(1);
		}
		if (e.target.value == '0') {
			setMuted(true);
			setMute(0);
		}
		playerRef.current.volume = e.target.value;
	};

	const handleOnTimeUpdate = () => {
		if (playerRef.current.currentTime && playerRef.current.duration) {
			const time = (playerRef.current.currentTime / playerRef.current.duration) * 100;
			setProgress(time);
		}
	};

	const handleVideoProgress = event => {
		const manualChange = Number(event.target.value);
		playerRef.current.currentTime = (playerRef.current.duration / 100) * manualChange;
		setProgress(manualChange);
	};

	const handleEnded = () => {
		const timeElapsed = document.getElementById('time-elapsed');
		timeElapsed.innerText = `00:00`;
		setIsPaused(true);
		setProgress(0);
		setReplayShow(true);
	};

	useEffect(() => {
		setProgress(0);
		const timeElapsed = document.getElementById('time-elapsed');
		const duration = document.getElementById('duration');
		document.addEventListener('keyup', keyboardShortcuts);
		playerRef.current.addEventListener('waiting', startLoader);
		playerRef.current.addEventListener('loadstart', startLoader);
		playerRef.current.addEventListener('canplay', stopLoader);
		function formatTime(timeInSeconds) {
			const result = new Date(timeInSeconds * 1000).toISOString().substr(11, 8);
			return {
				hours: result.substr(0, 2),
				minutes: result.substr(3, 2),
				seconds: result.substr(6, 2)
			};
		}

		function keyboardShortcuts(event) {
			const { key } = event;
			switch (key) {
				case 'm':
					toggleMute();
					break;
				case 'f':
					toggleFullScreen();
					break;
				case 'k':
					if (playerRef?.current?.paused) {
						playerRef.current.play();
						setIsPaused(false);
					} else {
						playerRef.current.pause();
						setIsPaused(true);
					}
					break;
			}
		}

		function initializeVideo() {
			const videoDuration = Math.round(playerRef.current.duration);
			const time = formatTime(videoDuration);
			duration.innerText = `${time.hours}:${time.minutes}:${time.seconds}`;
			duration.setAttribute('datetime', `${time.hours}h ${time.minutes}m ${time.seconds}s`);
		}
		function updateTimeElapsed() {
			const time = formatTime(Math.round(playerRef.current.currentTime));
			timeElapsed.innerText = `${time.hours}:${time.minutes}:${time.seconds}`;
			timeElapsed.setAttribute('datetime', `${time.hours}h ${time.minutes}m ${time.seconds}s`);
			setReplayShow(false);
		}
		playerRef.current.addEventListener('timeupdate', updateTimeElapsed);
		playerRef.current.addEventListener('loadedmetadata', initializeVideo);

		return () => {
			playerRef.current.removeEventListener('waiting', startLoader);
			playerRef.current.removeEventListener('canplay', stopLoader);
			playerRef.current.removeEventListener('timeupdate', updateTimeElapsed);
			playerRef.current.removeEventListener('loadedmetadata', initializeVideo);
			playerRef.current.removeEventListener('loadstart', startLoader);
			document.removeEventListener('keyup', keyboardShortcuts);
		};
	}, [active]);

	const startLoader = () => {
		if (active) {
			setIsVideoLoading(true);
			setIsPaused(true);
			playerRef.current.pause();
		}
	};

	const stopLoader = () => {
		setIsVideoLoading(false);
		setIsPaused(false);
		playerRef.current.play();
	};

	const setFullScreenFalse = e => {
		if (!document.fullscreenElement && !document.webkitFullscreenElement) {
			setIsFullscreen(false);
		}
	};
	useEffect(() => {
		'fullscreenchange mozfullscreenchange webkitfullscreenchange'.split(' ').forEach(event => {
			window.addEventListener(event, setFullScreenFalse);
		});
		return () => {
			window.removeEventListener(
				'fullscreenchange mozfullscreenchange webkitfullscreenchange',
				setFullScreenFalse
			);
		};
	}, []);

	return (
		<div className="flex justify-center items-center">
			<div ref={boxRef} className="w-full history-video-player-box rounded-lg">
				<video
					id="myVideo"
					preload="none"
					className="rounded-lg history-video-player"
					ref={playerRef}
					// src={url}
					autoPlay
					// controls={(url || false)}
					// disablePictureInPicture
					// controlsList="nodownload noplaybackrate"
					muted
					onTimeUpdate={handleOnTimeUpdate}
					// onVolumeChange={handleEnded}
					onEnded={handleEnded}
				/>
				<div className="video-player-title flex items-center col-gap-8">
					<Avatar src={room?.thumb} />
					<div>{room?.name}</div>
				</div>
				<div className="replay-btn" style={{ display: replayShow ? '' : 'none' }} onClick={toggleVideoPlay}>
					<img
						src={'assets/images/replay@2x.png'}
						width={60}
						className="cursor-pointer"
						alt="Replay Button"
					/>
				</div>
				<div
					className="history-video-player-controls flex justify-between items-center px-12"
					style={{ display: url ? '' : 'none' }}
				>
					<div onClick={toggleVideoPlay}>
						<img
							src={!isPaused ? 'assets/images/pause.png' : 'assets/images/play.png'}
							width={20}
							className="cursor-pointer"
							alt="Play Pause Button"
						/>
					</div>
					<div className="flex  items-center prog col-gap-8 px-12">
						<div className="time">
							<time id="time-elapsed">00:00</time>
							<span> / </span>
							<time id="duration">00:00</time>
						</div>
						<input
							type="range"
							min="0"
							max="100"
							step="0.1"
							defaultValue={0}
							value={progress}
							onChange={e => handleVideoProgress(e)}
						/>
					</div>
					<div className="flex col-gap-8 items-center">
						<div className="cursor-pointer volume-controller">
							<input
								type="range"
								name="volume-lvl"
								id="volume-lvl"
								defaultValue={0}
								className={`volume-lvl ${muted ? 'muted-vol' : 'on-vol'}`}
								orient="vertical"
								onChange={updateVolume}
								max="1"
								min="0"
								step="0.01"
							/>
							<img
								onClick={toggleMute}
								className={`${muted ? 'volume-icon' : ''}`}
								src={`assets/images/${muted ? 'muted' : 'volume'}.png`}
								alt="Volume"
							/>
						</div>
						<div className="cursor-pointer" onClick={toggleFullScreen}>
							<img
								src={
									isFullscreen
										? 'assets/images/exit-full-screen.png'
										: 'assets/images/full-screen.png'
								}
								alt="Fullscreen"
							/>
						</div>
					</div>
				</div>
				{!active ? <div className="stream-not-running-text-history">No video available</div> : ''}
				{isVideoLoading && active && (
					<div className="stream-not-running-text">
						<CircularProgress size={35} />
					</div>
				)}
			</div>
		</div>
	);
}

export default Streaming;
