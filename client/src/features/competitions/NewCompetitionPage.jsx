import React, { useState } from "react";
import { useDispatch, useSelector } from 'react-redux';
import { unwrapResult } from "@reduxjs/toolkit";
import { NavLink, useNavigate } from 'react-router-dom';
import { saveCompetition, selectCompetitions } from "./competitionsSlice";
import { FetchStatus } from "../../app/appFetch";
import Spinner from "../../common/Spinner";

export default function NewCompetitionPage() {
	const dispatch = useDispatch();
	const competitionsState = useSelector(selectCompetitions);
	const navigate = useNavigate();
	const [compName, setCompName] = useState('');
	const [wasValidated, setWasValidated] = useState(false);

	const onSaveCompClick = (competition) => {
		setWasValidated(true);
		dispatch(saveCompetition({ name: compName, phase: 'submitting' }))
			.then(unwrapResult)
			.then(() => {
				navigate('/competitions');
			});
	};

	return (
		<>
			<h1>New Competition</h1>
			{competitionsState.error && (<div className="alert alert-danger" role="alert">{competitionsState.error}</div>)}

			<div className="row">
				<div className="col-lg-6">
					<form className={wasValidated ? 'was-validated' : ''} noValidate>
						<div className="mb-3">
							<label htmlFor="nameInput" className="form-label">Name</label>
							<input type="text" className="form-control" id="nameInput" value={compName} onChange={e => setCompName(e.target.value)} required />
							<div className="invalid-feedback">
								Please enter a name.
							</div>
						</div>
						<div className="mb-3">
							<label htmlFor="phaseSelect" className="form-label">Phase</label>
							<select className="form-select" id="phaseSelect" disabled>
								<option value="submitting">Submitting</option>
							</select>
						</div>
						<button type="submit" className="btn btn-primary" onClick={onSaveCompClick} disabled={competitionsState.competitionSaveStatus === FetchStatus.pending}>
							Save {competitionsState.competitionSaveStatus === FetchStatus.pending ? (<Spinner />) : null}
						</button>
						{' '}
						<NavLink className="btn btn-secondary" to="/competitions">Cancel</NavLink>
					</form>
				</div>
			</div>
		</>
	);
};
