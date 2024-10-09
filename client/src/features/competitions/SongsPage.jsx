import React, { Fragment, useRef, useState } from "react";
import { useDispatch, useSelector } from 'react-redux';
import { NavLink } from 'react-router-dom';
import { CompetitionPhase, fetchAllSongs, selectAllSongs, selectAllUsers, selectCompetitions } from "./competitionsSlice";
import { selectCurrentUser } from "../signIn/signInSlice";
import { selectAudioPlayer, setIsPlaying, setCurrentSongFilename } from "../../common/audioPlayerSlice";
import { convertMsToStr } from '../../app/utilities';
import { useDocumentTitle } from "../../app/customHooks";
import AudioPlayer from '../../common/AudioPlayer';
import Spinner from '../../common/Spinner';

export default function SongsPage() {
	const dispatch = useDispatch();
	useDocumentTitle('Songs');
	const [dropdownMenuOpen, setDropdownMenuOpen] = useState(null);
	const [selectedSongList, setSelectedSongList] = useState(null);
	const competitionDropdownRef = useRef(null);
	const userDropdownRef = useRef(null);
	const competitionsState = useSelector(selectCompetitions);
	const audioPlayerState = useSelector(selectAudioPlayer);
	const currentUser = useSelector(selectCurrentUser);
	const allUsers = useSelector(selectAllUsers);
	const allSongs = useSelector(selectAllSongs);
	const participatingUsers = allUsers?.filter(u => u.isParticipating)?.sort((u1, u2) => u1.name.localeCompare(u2.name));

	const currentCompetition = competitionsState.currentCompetition;

	let songs = null;
	if (selectedSongList) {
		if (allSongs) {
			if (selectedSongList.compName) {
				songs = allSongs.filter(s => s.compName === selectedSongList.compName);
				songs.sort((a, b) => a.title.localeCompare(b.title));
			} else {
				songs = allSongs.filter(s => s.userId === selectedSongList.userId);
				songs.sort((a, b) => a.compName.localeCompare(b.compName));
			}
		} else {
			songs = [];
			dispatch(fetchAllSongs());
		}
	} else {
		if (currentUser.admin && participatingUsers && currentCompetition?.phase === CompetitionPhase.submitting) {
			const maxSongCount = participatingUsers.reduce((sum, user) => {
				return sum + (user.partnerId ? 1 : 2);
			}, 0);
			if (currentCompetition?.songs?.length === maxSongCount) {
				songs = [...currentCompetition?.songs];
			}
		}
		if (!songs) {
			const allowedUserIds = [currentUser.id];
			if (currentUser.partnerId) {
				allowedUserIds.push(currentUser.partnerId);
			}

			songs = currentCompetition?.songs?.filter(s => allowedUserIds.includes(s.userId)) || [];
		}
		songs.sort((a, b) => a.title.localeCompare(b.title));
	}

	const getUserName = (userId) => {
		const user = competitionsState.allUsers?.find(u => u.id === userId);
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

	const onBodyClick = (e) => {
		if (competitionDropdownRef.current && !competitionDropdownRef.current.contains(e.target) && userDropdownRef.current && !userDropdownRef.current.contains(e.target)) {
			setDropdownMenuOpen(null);
		}
	};

	const onOpenCompetitionDropdown = () => {
		setDropdownMenuOpen(dropdownMenuOpen === 'competition' ? '' : 'competition');

		if (!allSongs) {
			dispatch(fetchAllSongs());
		}
	};

	const compNames = [];
	if (allSongs) {
		allSongs.forEach(song => {
			if (!compNames.includes(song.compName)) {
				compNames.push(song.compName);
			}
		})
		compNames.sort((n1, n2) => n2.localeCompare(n1)); // Sort in reverse alphabetical
	}
	
	return (
		<div onClick={onBodyClick}>
			<h1 className="mb-4">Songs</h1>
			{competitionsState.error && (<div className="alert alert-danger" role="alert">{competitionsState.error}</div>)}

			<ul className="nav nav-pills mb-3">
				<li className="nav-item dropdown">
					<button className={'nav-link dropdown-toggle' + (!selectedSongList || selectedSongList.compName ? ' active' : '')} ref={competitionDropdownRef} onClick={onOpenCompetitionDropdown}>
						{selectedSongList?.compName ? selectedSongList.compName : 'Competition'}
					</button>
					<ul className={'dropdown-menu' + (dropdownMenuOpen === 'competition' ? ' d-block' : '')}>
						{compNames?.length
							? (<>
									{currentCompetition && (
										<li key="current"><button className={'dropdown-item' + (!selectedSongList ? ' active' : '')} onClick={() => setSelectedSongList(null)}>{currentCompetition.name} (current)</button></li>
									)}
									{compNames.map(compName => (
										<li key={compName}><button className={'dropdown-item' + (selectedSongList?.compName === compName ? ' active' : '')} onClick={() => setSelectedSongList({ compName })}>{compName}</button></li>
									))}
								</>)
							: (<li><div className="dropdown-item"><Spinner /> Loading...</div></li>)
						}
					</ul>
				</li>
				<li className="nav-item dropdown">
					<button className={'nav-link dropdown-toggle' + (selectedSongList?.userId ? ' active' : '')} ref={userDropdownRef} onClick={() => setDropdownMenuOpen(dropdownMenuOpen === 'user' ? '' : 'user')}>
						{selectedSongList?.userId ? getUserName(selectedSongList.userId) : 'Users'}
					</button>
					<ul className={'dropdown-menu' + (dropdownMenuOpen === 'user' ? ' d-block' : '')}>
						{participatingUsers?.map(user => (
							<li key={user.id}><button className={'dropdown-item' + (selectedSongList?.userId === user.id ? ' active' : '')} onClick={() => setSelectedSongList({ userId: user.id })}>{user.name}</button></li>	
						))}
					</ul>
				</li>
			</ul>

			<div className="row audio-player-margin">
				<div className="col-lg-6">
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
											<td>{selectedSongList?.userId ? song.compName : getUserName(song.userId)}</td>
											{!selectedSongList && currentCompetition?.phase === CompetitionPhase.submitting && (
												<td className="song-controls-cell">
													<NavLink className="d-flex" to={song.id} title="Edit"><i className="fa-solid fa-pen align-self-center flex-fill"></i></NavLink>
												</td>
											)}
										</tr>
										{song.reason
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
					{(currentCompetition?.phase === CompetitionPhase.submitting && songs.length < 2 && !selectedSongList) ? (<NavLink to="new" className="btn btn-primary">Add Song</NavLink>) : null}
				</div>
			</div>

			<AudioPlayer songs={songs} />
		</div>
	);
};
