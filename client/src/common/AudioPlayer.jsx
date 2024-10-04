import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectAudioPlayer, setCanPlay, setAudioDuration, setIsPlaying } from './audioPlayerSlice';
import { convertMsToStr } from '../app/utilities';


export default function AudioPlayer({ songs }) {
	const dispatch = useDispatch();
	const audioRefs = useRef([]);
	const scrubberRef = useRef();
	const audioPlayerState = useSelector(selectAudioPlayer);
	const [volume, setVolume] = useState(1);
	const [audioCurrentTime, setAudioCurrentTime] = useState(0);

	const currentSongFilename = audioPlayerState.currentSongFilename;

	useEffect(() => {
		for (const filename in audioRefs.current) {
			audioRefs.current[filename].pause();
		}

		if (audioRefs.current && audioRefs.current?.[currentSongFilename]) {
			audioRefs.current[currentSongFilename].currentTime = 0;
			if (audioPlayerState.isPlaying) {
				audioRefs.current[currentSongFilename].volume = volume;
				audioRefs.current[currentSongFilename].play();
			}
		}
		
	}, [currentSongFilename]);

	useEffect(() => {
		if (!audioRefs.current[currentSongFilename]) return;

		// If it's supposed to play, but it's not playing
		if (audioPlayerState.isPlaying && audioRefs.current[currentSongFilename].paused) {
			audioRefs.current[currentSongFilename].volume = volume;
			audioRefs.current[currentSongFilename].play();
		} else if (!audioPlayerState.isPlaying && !audioRefs.current[currentSongFilename].paused) {
			audioRefs.current[currentSongFilename].pause();
		}
	}, [audioPlayerState.isPlaying]);

	const onPlayClick = (e) => {
		dispatch(setIsPlaying(!audioPlayerState.isPlaying));
	};
	const onLoadedMetadata = (songFilename) => {
		return (e) => {
			dispatch(setAudioDuration({ filename: songFilename, duration: audioRefs.current[songFilename].duration }));
		};
	};
	const onCanPlay = (songFilename) => {
		return (e) => {
			dispatch(setCanPlay({ filename: songFilename, canPlay: true }));
		};
	};
	const onTimeUpdate = (songFilename) => {
		return (e) => {
			if (songFilename !== currentSongFilename) return;
			setAudioCurrentTime(audioRefs.current[currentSongFilename].currentTime);
		};
	};
	const onEnded = (songFilename) => {
		return (e) => {
			if (songFilename !== currentSongFilename) return;
			dispatch(setIsPlaying(false));
		};
	};

	const onScrub = (e) => {
		const scrubTime = (e.nativeEvent.offsetX / scrubberRef.current.offsetWidth) * audioRefs.current[currentSongFilename].duration;
		audioRefs.current[currentSongFilename].currentTime = scrubTime;
	};

	const onChangeVolume = (e) => {
		const newVolume = e.target.value;
		setVolume(newVolume);
		if (audioRefs.current[currentSongFilename]) {
			audioRefs.current[currentSongFilename].volume = newVolume;
		}
	};

	const currentAudioInfo = audioPlayerState.audioInfo[currentSongFilename] || { canPlay: false, duration: 0 };
	const currentSong = songs.find(song => song.filename === currentSongFilename);

	const audioCurrentTimeStr = convertMsToStr(audioCurrentTime);
	const audioDurationStr = convertMsToStr(currentAudioInfo.duration);
	const percentComplete = (audioCurrentTime / currentAudioInfo.duration) * 100;

	const isPlaying = audioRefs.current[currentSongFilename]?.paused === false;

	return (
		<div className={'fixed-bottom player ' + (currentSongFilename ? 'd-flex' : 'd-none')}>
			{songs.map(song => (
				<audio key={song.filename} ref={el => { audioRefs.current[song.filename] = el; }} crossOrigin="anonymous" onLoadedMetadata={onLoadedMetadata(song.filename)} onTimeUpdate={onTimeUpdate(song.filename)} onCanPlay={onCanPlay(song.filename)} onEnded={onEnded(song.filename)}>
					<source src={`https://wilson-notes.s3.amazonaws.com/t/${song.filename}/playlist.m3u8`} type="audio/mpeg" />
					<source src={`https://wilson-notes.s3.amazonaws.com/t/${song.filename}/song.mp3`} type="audio/mpeg" />
				</audio>
			))}
			
			<div className="container">
				<div className="row justify-content-md-center">
					<div className="col-lg-6 bg-dark text-white rounded-2 rounded-bottom-0 p-3">
						<div className="player-track-meta">
							{currentSong?.title} <small className="text-white text-opacity-75">- {currentSong?.artist}</small>
						</div>
						<div className="d-flex align-items-center justify-content-between">
							<button className={'bg-transparent border-0 text-white' + (currentAudioInfo.canPlay ? '' : ' opacity-25')} title="Play song" onClick={onPlayClick} disabled={!currentAudioInfo.canPlay}>
								{isPlaying ? (<i className="fa-solid fa-pause"></i>) : (<i className="fa-solid fa-play"></i>)}
							</button>

							<div className="d-flex align-items-center justify-content-between flex-grow-1">
								<span className="font-monospace px-2">{audioCurrentTimeStr}</span>
								<div className="player-progress" onClick={onScrub} ref={scrubberRef}>
									<div className="player-progress-filled" style={{ flexBasis: percentComplete + '%' }}></div>
								</div>
								<span className="font-monospace px-2">{audioDurationStr}</span>
							</div>
							<div className="player-volume-container">
								<input type="range" min="0" max="1" value={volume} step="0.01" className="player-volume" onChange={onChangeVolume} />
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};
