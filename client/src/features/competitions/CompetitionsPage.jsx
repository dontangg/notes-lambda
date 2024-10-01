import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from 'react-redux';
import { NavLink } from 'react-router-dom';
import { deleteCompetition, fetchCompetitions, saveCompetition, selectCompetitions } from "./competitionsSlice";
import { selectIsAdmin } from "../signIn/signInSlice";
import { FetchStatus } from "../../app/appFetch";
import Spinner from "../../common/Spinner";

export default function AccountPage() {
	const dispatch = useDispatch();
	const competitionsState = useSelector(selectCompetitions);
	const userIsAdmin = useSelector(selectIsAdmin);
	const [competitionInEdit, setCompetitionInEdit] = useState(null);
	const [competitionPhaseInEdit, setCompetitionPhaseInEdit] = useState(null);
	const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

	useEffect(() => {
		dispatch(fetchCompetitions());
	}, []);

	const resetCompEditForm = () => {
		setCompetitionInEdit(null);
		setCompetitionPhaseInEdit(null);
		setIsConfirmingDelete(false);
	};

	const onEditCompClick = (competition) => {
		return (e) => {
			setCompetitionInEdit(competition.name);
			setCompetitionPhaseInEdit(competition.phase);
			setIsConfirmingDelete(false);
		};
	};

	useEffect(() => {
		if (competitionsState.competitionSaveStatus === FetchStatus.success) {
			resetCompEditForm();
		}
	}, [competitionsState.competitionSaveStatus]);

	const onSaveCompClick = (competition) => {
		return (e) => {
			dispatch(saveCompetition({ name: competition.name, phase: competitionPhaseInEdit }));
		};
	};

	const onDeleteCompClick = (compName) => {
		return (e) => {
			dispatch(deleteCompetition({ name: compName }));
		};
	};

	const getButtons = (competition) => {
		if (competitionInEdit) {
			if (competitionInEdit === competition.name) {
				return (<>
					{competitionsState.competitionSaveStatus === FetchStatus.pending && (<><Spinner />{' '}</>)}
					<button type="button" className="btn btn-secondary" onClick={() => resetCompEditForm()} disabled={competitionsState.competitionSaveStatus === FetchStatus.pending}>Cancel</button>
					{' '}
					<button type="button" className="btn btn-primary" onClick={onSaveCompClick(competition)} disabled={competitionsState.competitionSaveStatus === FetchStatus.pending}>
						Save
					</button>
					{' '}
					{ isConfirmingDelete
						? (
							<button type="button" className="btn btn-danger" onClick={onDeleteCompClick(competition.name)} disabled={competitionsState.competitionSaveStatus === FetchStatus.pending}>
								Are you sure?
							</button>
						)
						: (
							<button type="button" className="btn btn-danger" onClick={() => setIsConfirmingDelete(true)} disabled={competitionsState.competitionSaveStatus === FetchStatus.pending}>
								Delete
							</button>
						)
					}
				</>);
			}
			return (<button type="button" className="btn invisible" aria-hidden>SpaceHolder</button>);
		}

		const scoreCardButton = (<button type="button" className="btn btn-secondary">Scorecard</button>);
		if (userIsAdmin) {
			return (<>
				<button type="button" className="btn btn-secondary" onClick={onEditCompClick(competition)}>Edit</button>
				{' '}
				{scoreCardButton}
			</>);
		}

		return scoreCardButton;
	};

	return (
		<>
			<h1>Competitions</h1>
			{competitionsState.error && (<div className="alert alert-danger" role="alert">{competitionsState.error}</div>)}
			
			<div className="row">
				<div className="col-lg-6">
					<table className="table table-striped align-middle">
						<thead>
							<tr>
								<th scope="col" className="col-2">Name</th>
								<th scope="col" className="col-4">Phase</th>
								<th scope="col" className="text-end">
									<button type="button" className="btn invisible" aria-hidden>SpaceHolder</button>
									{userIsAdmin && !competitionInEdit && (<NavLink className="btn btn-primary" to="new">New</NavLink>)}
								</th>
							</tr>
						</thead>
						<tbody>
							{competitionsState.competitions?.map(competition => (
								<tr key={competition.name}>
									<th scope="row">{competition.name}</th>
									<td>
										{competitionInEdit === competition.name
											? (
												<select className="form-select" value={competitionPhaseInEdit} onChange={e => setCompetitionPhaseInEdit(e.target.value)}>
													<option value="submitting">Submitting</option>
													<option value="guessing">Guessing</option>
													<option value="closed">Closed</option>
												</select>
											)
											: competition.phase
										}
									</td>
									<td className="text-end">
										{getButtons(competition)}
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>
		</>
	);
};
