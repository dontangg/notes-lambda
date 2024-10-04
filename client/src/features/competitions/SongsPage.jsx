import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllUsers, selectCompetitions } from "./competitionsSlice";
import { useDocumentTitle } from "../../app/customHooks";
import { selectCurrentUser } from "../signIn/signInSlice";
import AudioPlayer from '../../common/AudioPlayer';
import { selectAudioPlayer, setIsPlaying } from "../../common/audioPlayerSlice";

export default function NewCompetitionPage() {
	const dispatch = useDispatch();
	useDocumentTitle('My Songs');
	const competitionsState = useSelector(selectCompetitions);
	const audioPlayerState = useSelector(selectAudioPlayer);
	const currentUser = useSelector(selectCurrentUser);
	const [playingSongFilename, setPlayingSongFilename] = useState(null);

	useEffect(() => {
		if (!competitionsState.allUsers) {
			dispatch(fetchAllUsers());
		}
	}, []);

	const currentCompetition = competitionsState.currentCompetition;

	// TODO: Allow admin to see all when they're all submitted
	const allowedUserIds = [currentUser.id];
	if (currentUser.partnerId) {
		allowedUserIds.push(currentUser.partnerId);
	}

	const songs = currentCompetition?.songs?.filter(s => allowedUserIds.includes(s.userId)) || [];

	const getUserName = (userId) => {
		const user = competitionsState.allUsers?.find(u => u.id === userId);
		return user ? user.name : 'Unknown';
	};

	const onPlaySongClick = (songFilename) => {
		return (e) => {
			setPlayingSongFilename(songFilename);
			if (playingSongFilename === songFilename) {
				dispatch(setIsPlaying(!audioPlayerState.isPlaying));
			} else {
				dispatch(setIsPlaying(true));
			}
		};
	};

	return (
		<>
			<h1>My Songs</h1>
			{competitionsState.error && (<div className="alert alert-danger" role="alert">{competitionsState.error}</div>)}

			<div className="row">
				<div className="col-lg-6">
					<table className="table table-hover align-middle playlist">
						<tbody>
							{songs.map((song, idx) => (
								<tr key={song.title}>
									<td>
										<button title="Play song" onClick={onPlaySongClick(song.filename)}>
											{(playingSongFilename === song.filename && audioPlayerState.isPlaying)
												? (<i className="fa-solid fa-pause"></i>)
												: (<i className="fa-solid fa-play"></i>)
											}
										</button>
									</td>
									<td>
										<div>{song.title}</div>
										<small className="text-body-secondary">{song.artist}</small>
									</td>
									<td className="small text-end">0:00</td>
									<td>{getUserName(song.userId)}</td>
									<td className="song-controls-cell">
										<button title="Edit"><i className="fa-solid fa-pen"></i></button>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>

			<AudioPlayer songs={songs} currentSongFilename={playingSongFilename} />
		</>
	);
};
