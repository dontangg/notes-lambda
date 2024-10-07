import { useEffect } from 'react';
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { unwrapResult } from "@reduxjs/toolkit";
import { NavLink, useNavigate, useParams } from 'react-router-dom';
import { FetchStatus } from "../../app/appFetch";
import Spinner from "../../common/Spinner";
import { deleteSong, selectCompetitions, saveSong, selectAllUsers } from "./competitionsSlice";
import { selectCurrentUser } from "../signIn/signInSlice";

export default function SongEditPage() {
	const { id: songId } = useParams();
	const dispatch = useDispatch();
	const navigate = useNavigate();
	const competitionsState = useSelector(selectCompetitions);
	const allUsers = useSelector(selectAllUsers);
	const currentUser = useSelector(selectCurrentUser);
	const song = competitionsState.currentCompetition?.songs?.find(song => song.id === songId);

	const [typedTitle, setTypedTitle] = useState(song?.title || '');
	const [typedArtist, setTypedArtsit] = useState(song?.artist || '');
	const [typedReason, setTypedReason] = useState(song?.reason || '');
	const [selectedUserId, setSelectedUserId] = useState(song?.userId || '');
	const [songFilename, setSongFilename] = useState('');
	const [formWasValidated, setFormWasValidated] = useState(false);
	const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

	useEffect(() => {
		setTypedTitle(song?.title || '');
		setTypedArtsit(song?.artist || '');
		setTypedReason(song?.reason || '');
		setSelectedUserId(song?.userId || '');
	}, [song]);

	const onSaveClick = (e) => {
		e.preventDefault();
		setFormWasValidated(true);
		if (typedTitle && typedArtist && typedReason) {
			const songToSave = { title: typedTitle, artist: typedArtist, reason: typedReason, userId: Number(selectedUserId) };
			if (songId !== 'new') {
				songToSave.id = songId;
			}
			if (songFilename) {
				songToSave.filename = songFilename;
			}
			dispatch(saveSong(songToSave))
				.then(unwrapResult)
				.then(() => {
					navigate('/song');
				});
		}
	};

	const onDeleteClick = (e) => {
		e.preventDefault();
		if (isConfirmingDelete) {
			dispatch(deleteSong(songId))
				.then(unwrapResult)
				.then(() => {
					navigate('/song');
				});
		} else {
			setIsConfirmingDelete(true);
		}
	};

	let usersForDropdown = [];
	if (competitionsState.currentCompetition) {
		const mySong = competitionsState.currentCompetition.songs?.find(s => s.userId === currentUser.id);
		const partnerSong = competitionsState.currentCompetition.songs?.find(s => s.userId === currentUser.partnerId);

		usersForDropdown = allUsers?.filter(u => {
			if (!competitionsState.currentCompetition) return false;

			if (u.id === currentUser.id && (!mySong || mySong.id === song?.id)) {
				return true;
			}
			if (u.id === currentUser.partnerId && (!partnerSong || partnerSong.id === song?.id)) {
				return true;
			}
			return false;
		});

		// Set a default
		if (!selectedUserId && usersForDropdown?.length) {
			if (usersForDropdown.some(u => u.id === currentUser.id)) {
				setSelectedUserId(currentUser.id)
			} else {
				setSelectedUserId(usersForDropdown[0].id)
			}
		}
	}

	return (
		<div>
			<h1 className="mb-4">Edit song</h1>
			{competitionsState.error && (<div className="alert alert-danger" role="alert">{competitionsState.error}</div>)}
			<div className="row">
				<div className="col-lg-6">
					{competitionsState.currentCompetition ? (
						<form className={formWasValidated ? 'was-validated' : ''} noValidate>
							<div className="mb-3">
								<label htmlFor="titleInput" className="form-label">Title</label>
								<input type="text" className="form-control" id="titleInput" value={typedTitle} onChange={e => setTypedTitle(e.target.value)} required />
								<div className="invalid-feedback">
									Please enter the song title.
								</div>
							</div>
							<div className="mb-3">
								<label htmlFor="artistInput" className="form-label">Artist</label>
								<input type="text" className="form-control" id="artistInput" value={typedArtist} onChange={e => setTypedArtsit(e.target.value)} required />
								<div className="invalid-feedback">
									Please enter the song artist.
								</div>
							</div>
							<div className="mb-3">
								<label htmlFor="reasonInput" className="form-label">Reason</label>
								<textarea className="form-control" id="reasonInput" value={typedReason} onChange={e => setTypedReason(e.target.value)} required />
								<div className="invalid-feedback">
									Please enter the reason you are selecting this song.
								</div>
							</div>
							<div className="mb-3">
								<label htmlFor="userSelect" className="form-label">For whom</label>
								<select className="form-select" id="userSelect" value={selectedUserId} onChange={e => setSelectedUserId(e.target.value)} disabled={usersForDropdown?.length === 1}>
									{usersForDropdown?.map(user => (
										<option key={user.id} value={user.id}>{user.name}</option>
									))}
								</select>
							</div>
							<div className="mb-3">
								<label htmlFor="uploadInput" className="form-label">Upload the file</label>
								<input type="file" className="form-control" id="uploadInput" accept="audio/*" value={songFilename} onChange={e => setSongFilename(e.target.value)} />
							</div>
							<button type="submit" className="btn btn-primary" onClick={onSaveClick} disabled={competitionsState.songSaveStatus === FetchStatus.pending}>
								Save
							</button>
							{' '}
							<NavLink className="btn btn-secondary" to="/song">Cancel</NavLink>
							{' '}
							<button type="button" className="btn btn-danger" onClick={onDeleteClick} disabled={competitionsState.songSaveStatus === FetchStatus.pending}>
								{isConfirmingDelete ? 'Are you sure?' : 'Delete'}
							</button>
							{competitionsState.songSaveStatus === FetchStatus.pending ? (<>{' '}<Spinner /></>) : null}
						</form>
					) : (
						<p className="opacity-75">Loading....</p>
					)}
				</div>
			</div>
		</div>
	)
};
