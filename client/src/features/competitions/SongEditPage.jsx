import { useEffect } from 'react';
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { unwrapResult } from "@reduxjs/toolkit";
import { NavLink, useNavigate, useParams } from 'react-router-dom';
import { FetchStatus } from "../../app/appFetch";
import Spinner from "../../common/Spinner";
import { selectCompetitions, saveSong } from "./competitionsSlice";

export default function SongEditPage() {
	const { id: songId } = useParams();
	const dispatch = useDispatch();
	const navigate = useNavigate();
	const competitionsState = useSelector(selectCompetitions);
	const song = competitionsState.currentCompetition?.songs?.find(song => song.id === songId);

	const [typedTitle, setTypedTitle] = useState(song?.title);
	const [typedArtist, setTypedArtsit] = useState(song?.artist);
	const [typedReason, setTypedReason] = useState(song?.reason);
	const [songFilename, setSongFilename] = useState('');
	const [formWasValidated, setFormWasValidated] = useState(false);

	useEffect(() => {
		setTypedTitle(song?.title);
		setTypedArtsit(song?.artist);
		setTypedReason(song?.reason);
	}, [song]);

	const onSaveClick = (e) => {
		e.preventDefault();
		setFormWasValidated(true);
		if (typedTitle && typedArtist && typedReason) {
			const songToSave = { id: songId, title: typedTitle, artist: typedArtist, reason: typedReason };
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

	return (
		<div>
			<h1 className="mb-4">Edit song</h1>
			{competitionsState.error && (<div className="alert alert-danger" role="alert">{competitionsState.error}</div>)}
			<div className="row">
				<div className="col-lg-6">
					{song ? (
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
								<label htmlFor="uploadInput" className="form-label">Upload the file</label>
								<input type="file" className="form-control" id="uploadInput" accept="audio/*" value={songFilename} onChange={e => setSongFilename(e.target.value)} />
							</div>
							<button type="submit" className="btn btn-primary" onClick={onSaveClick} disabled={competitionsState.songSaveStatus === FetchStatus.pending}>
								Save {competitionsState.songSaveStatus === FetchStatus.pending ? (<Spinner />) : null}
							</button>
							{' '}
							<NavLink className="btn btn-secondary" to="/song">Cancel</NavLink>
							{' '}
							<button type="button" className="btn btn-danger" onClick={() => { }}>Delete</button>
						</form>
					) : (
						<p className="opacity-75">Loading....</p>
					)}
				</div>
			</div>
		</div>
	)
};
