import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { unwrapResult } from "@reduxjs/toolkit";
import { NavLink, useNavigate, useParams } from 'react-router-dom';
import { FetchStatus } from "../../app/appFetch";
import Spinner from "../../common/Spinner";
import { deleteSong, selectCompetitions, saveSong, selectAllUsers, uploadSong } from "./competitionsSlice";
import { selectCurrentUser } from "../signIn/signInSlice";
import { useDocumentTitle } from "../../app/customHooks";

export default function SongEditPage() {
	const { id: songId } = useParams();
	useDocumentTitle('Edit Song');
	const dispatch = useDispatch();
	const navigate = useNavigate();
	const fileInputRef = useRef(null);
	const competitionsState = useSelector(selectCompetitions);
	const allUsers = useSelector(selectAllUsers);
	const currentUser = useSelector(selectCurrentUser);
	const song = competitionsState.currentCompetition?.songs?.find(song => song.id === songId);

	const [typedTitle, setTypedTitle] = useState(song?.title || '');
	const [typedArtist, setTypedArtsit] = useState(song?.artist || '');
	const [typedReason, setTypedReason] = useState(song?.reason || '');
	const [selectedUserId, setSelectedUserId] = useState(song?.userId || '');
	const [filename, setFilename] = useState(song?.filename || '');
	const [extension, setExtension] = useState(song?.extension || '');
	const [fileToUpload, setFileToUpload] = useState('');
	const [formWasValidated, setFormWasValidated] = useState(false);
	const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

	useEffect(() => {
		setTypedTitle(song?.title || '');
		setTypedArtsit(song?.artist || '');
		setTypedReason(song?.reason || '');
		setSelectedUserId(song?.userId || '');
		setFilename(song?.filename || '');
		setExtension(song?.extension || '');
	}, [song]);

	const onSaveClick = (e) => {
		e.preventDefault();
		setFormWasValidated(true);
		if (typedTitle && typedArtist && typedReason) {
			const songToSave = { title: typedTitle, artist: typedArtist, reason: typedReason, userId: Number(selectedUserId) };
			if (songId !== 'new') {
				songToSave.id = songId;
			}
			if (filename) {
				songToSave.filename = filename;
			}
			if (extension) {
				songToSave.extension = extension;
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

	const onChangeFile = (e) => {
		setFileToUpload(e.target.value);

		const filename = Date.now().toString(36);
		const extension = e.target.value.split('.').pop();
		const file = e.target.files[0];
		const type = file.type;

		dispatch(uploadSong({ filename, extension, type, file }))
			.then(unwrapResult)
			.then(() => {
				setFilename(filename);
				setExtension(extension);
			});
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

	const isSaving = competitionsState.uploadSongStatus === FetchStatus.pending || competitionsState.songSaveStatus === FetchStatus.pending;

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
								<label htmlFor="uploadInput" className="form-label">
									{filename ? (filename === song?.filename ? 'File uploaded' : 'New file uploaded') : 'Song file'}
								</label>
								{' '}
								<button type="button" className="btn btn-outline-secondary" onClick={() => fileInputRef.current?.click?.()} disabled={isSaving}>
									{filename ? 'Upload new file' : 'Upload'}
								</button>
								{competitionsState.uploadSongStatus === FetchStatus.pending ? (<>{' '}<Spinner /></>) : null}
								<input type="file" ref={fileInputRef} className="form-control d-none" id="uploadInput" accept="audio/*" value={fileToUpload} onChange={onChangeFile} />
							</div>
							<div className="mb-3 d-flex">
								<div className="flex-grow-1">
									<button type="submit" className="btn btn-primary" onClick={onSaveClick} disabled={isSaving}>
										Save
									</button>
									{' '}
									<NavLink className="btn btn-secondary" to="/song">Cancel</NavLink>
									{competitionsState.songSaveStatus === FetchStatus.pending ? (<>{' '}<Spinner /></>) : null}
								</div>
								{songId !== 'new' && (
									<div>
										<button type="button" className="btn btn-danger" onClick={onDeleteClick} disabled={isSaving}>
											{isConfirmingDelete ? 'Are you sure?' : 'Delete'}
										</button>
									</div>
								)}
							</div>
						</form>
					) : (
						<p className="opacity-75">Loading....</p>
					)}
				</div>
			</div>
		</div>
	)
};
