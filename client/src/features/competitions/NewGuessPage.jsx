import React, { Fragment, useState } from "react";
import { useDispatch, useSelector } from 'react-redux';
import { unwrapResult } from "@reduxjs/toolkit";
import { saveAttempt, saveForfeit, selectAllUsers, selectCompetitions } from "./competitionsSlice";
import { selectCurrentUser } from "../signIn/signInSlice";
import { selectAudioPlayer, setIsPlaying, setCurrentSongFilename } from "../../common/audioPlayerSlice";
import { convertMsToStr } from '../../app/utilities';
import { useDocumentTitle } from "../../app/customHooks";
import AudioPlayer from '../../common/AudioPlayer';
import Spinner from '../../common/Spinner';
import { FetchStatus } from "../../app/appFetch";

export default function NewGuessPage() {
	const dispatch = useDispatch();
	useDocumentTitle('Guess');
	const [invalidGuessMessage, setInvalidGuessMessage] = useState('');
	const [guesses, setGuesses] = useState({});
	const [isConfirmingForfeit, setIsConfirmingForfeit] = useState(false);
	const competitionsState = useSelector(selectCompetitions);
	const audioPlayerState = useSelector(selectAudioPlayer);
	const currentUser = useSelector(selectCurrentUser);
	const allUsers = useSelector(selectAllUsers);
	const participatingUsers = allUsers?.filter(u => u.isParticipating);

	const currentCompetition = competitionsState.currentCompetition;

	const teamUserIds = [currentUser.id];
	if (currentUser.partnerId) {
		teamUserIds.push(currentUser.partnerId);
	}

	const songs = currentCompetition?.songs?.filter(s => !teamUserIds.includes(s.userId)) || [];
	songs.sort((s1, s2) => s1.title.localeCompare(s2.title));

	const teamAttempts = (currentCompetition?.attempts || []).filter(att => teamUserIds.includes(att.userId)).sort((a, b) => b.createdAt.localeCompare(a.createdAt)); // sort in reverse
	const lastAttempt = teamAttempts?.[0];

	const hasSongsLeftToGuess = songs.some(s => !s.userId);

	const getUserName = (userId) => {
		const user = allUsers?.find(u => u.id === userId);
		return user ? user.name : 'Unknown';
	};

	const onPlaySongClick = (songFilename) => {
		return (e) => {
			if (audioPlayerState.currentSongFilename === songFilename) {
				dispatch(setIsPlaying(!audioPlayerState.isPlaying));
			} else {
				dispatch(setCurrentSongFilename(songFilename));
			}
		};
	};

	const getUserCell = (song) => {
		if (song.userId) {
			return getUserName(song.userId);
		}

		const peopleLeft = participatingUsers?.filter(u => {
			if (teamUserIds.includes(u.id)) return false;

			const countCorrectForUser = lastAttempt?.correctGuessedUserIds?.filter(cgui => cgui === u.id)?.length || 0;
			const songCountForUser = currentCompetition.songCounts[String(u.id)];
			return countCorrectForUser < songCountForUser;
		})?.sort((u1, u2) => u1.name.localeCompare(u2.name));

		const alreadyGuessedUserIds = teamAttempts?.map(att => {
			return att.guesses.find(guess => guess.songFilename === song.filename).guessedUserId
		});

		return (
			<select className="form-select" value={guesses[song.filename] || ''} onChange={e => onChangeGuess(song.filename, e.target.value)}>
				<option value="">Choose a person</option>
				{peopleLeft?.map((user) => {
					const alreadyGuessed = alreadyGuessedUserIds?.includes(user.id);
					return (<option key={user.id} value={user.id} disabled={alreadyGuessed}>{getUserName(user.id)}{alreadyGuessed && " (already guessed)"}</option>);
				})}
			</select>
		);
	};

	const doValidGuessesCheck = (guesses) => {
		// Check that someone is picked for each song
		for (let i = 0; i < songs.length; i++) {
			const song = songs[i];
			if (!song.userId && !guesses[song.filename]) {
				setInvalidGuessMessage('Please select a person for each song.');
				return false;
			}
		}
		
		// Check that each person is picked the right number of times
		for (let i = 0; i < participatingUsers?.length; i++) {
			const user = participatingUsers[i];
			if (teamUserIds.includes(user.id)) continue;

			const countCorrectForUser = lastAttempt?.correctGuessedUserIds?.filter(cgui => cgui === user.id)?.length || 0;
			const songCountForUser = currentCompetition.songCounts[String(user.id)];
			const countLeftForUser = songCountForUser - countCorrectForUser;
			const countGuessedForUser = Object.values(guesses).filter(guessedUserId => guessedUserId === user.id).length;
			if (countGuessedForUser > countLeftForUser) {
				setInvalidGuessMessage(`You have selected ${getUserName(user.id)} for too many songs.`);
				return false;
			}
		}

		setInvalidGuessMessage('');
		return true;
	};

	const onChangeGuess = (songFilename, guessedUserId) => {
		const newGuesses = {
			...guesses,
			[songFilename]: Number(guessedUserId),
		};
		setGuesses(newGuesses);
		if (invalidGuessMessage) {
			doValidGuessesCheck(newGuesses);
		}
	};

	const onSubmitAttempt = (e) => {
		e.preventDefault();

		if (!doValidGuessesCheck(guesses)) return;
		
		dispatch(saveAttempt(guesses))
			.then(unwrapResult)
			.then(() => {
				setGuesses({});
			});
	};

	const onForfeitClick = (e) => {
		e.preventDefault();
		if (isConfirmingForfeit) {
			setIsConfirmingForfeit(false);
			dispatch(saveForfeit());
		} else {
			setIsConfirmingForfeit(true);
		}
	};

	return (
		<>
			<h1 className="mb-4">Guess</h1>
			{competitionsState.error && (<div className="alert alert-danger" role="alert">{competitionsState.error}</div>)}

			<div className="row audio-player-margin">
				<div className="col-xl-7">
					{!currentCompetition ? (<span className="opacity-25">Loading...</span>) : (
						<>
							{lastAttempt && (
								<div className="alert alert-info" role="alert">You got {lastAttempt.correctCount} right with {teamAttempts.length} guess{teamAttempts.length === 1 ? '' : 'es'}!</div>
							)}

							<table className="table table-hover align-middle playlist">
								<tbody>
									{songs.map((song, idx) => {
										const isThisSongPlaying = (audioPlayerState.currentSongFilename === song.filename && audioPlayerState.isPlaying);
										return (
											<Fragment key={song.title}>
												<tr className={isThisSongPlaying ? 'table-active' : null}>
													<td className="text-center">
														{song.filename ? (
															<button title="Play song" onClick={onPlaySongClick(song.filename)}>
																{isThisSongPlaying
																	? (<i className="fa-solid fa-pause"></i>)
																	: (<i className="fa-solid fa-play"></i>)
																}
															</button>
														) : (idx + 1)}
														
													</td>
													<td>
														<div>{song.title}</div>
														<small className="text-body-secondary">{song.artist}</small>
													</td>
													<td className="small text-end">{song.filename && convertMsToStr(audioPlayerState.audioInfo[song.filename]?.duration)}</td>
													<td>{getUserCell(song)}</td>
												</tr>
												{song.reason && song.userId
													? (
														<tr className={'song-reason' + (isThisSongPlaying ? ' table-active' : '')}>
															<td></td>
															<td colSpan="4">{song.reason}</td>
														</tr>
													)
													: null
												}
											</Fragment>
										);
									})}
								</tbody>
							</table>
							
							{hasSongsLeftToGuess && (
								<>
									{invalidGuessMessage && (<div className="alert alert-danger" role="alert">{invalidGuessMessage}</div>)}
									<div className="mb-3 d-flex">
										<div className="flex-grow-1">
											<button className="btn btn-primary" onClick={onSubmitAttempt} disabled={competitionsState.attemptSaveStatus === FetchStatus.pending}>
												Submit guess {competitionsState.attemptSaveStatus === FetchStatus.pending && (<Spinner />)}
											</button>
										</div>
										<div>
											<button type="button" className="btn btn-outline-danger" onClick={onForfeitClick} disabled={competitionsState.attemptSaveStatus === FetchStatus.pending}>
												{isConfirmingForfeit ? 'Are you sure?' : 'Forfeit'}
											</button>
										</div>
									</div>
								</>
							)}
							
						</>
					)}
				</div>
			</div>

			<AudioPlayer songs={songs} />
		</>
	);
};
