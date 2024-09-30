import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from 'react-redux';
import { fetchCompetitions, saveCompetition, selectCompetitions } from "./competitionsSlice";
import { selectIsAdmin } from "../signIn/signInSlice";
import { FetchStatus } from "../../app/appFetch";
import Spinner from "../../common/Spinner";

export default function AccountPage() {
	const dispatch = useDispatch();
	const competitionsState = useSelector(selectCompetitions);
	const userIsAdmin = useSelector(selectIsAdmin);
	const [competitionInEdit, setCompetitionInEdit] = useState(null);
	const [competitionPhaseInEdit, setCompetitionPhaseInEdit] = useState(null);

	useEffect(() => {
		dispatch(fetchCompetitions());
	}, []);


	const onEditCompClick = (competition) => {
		return (e) => {
			setCompetitionInEdit(competition.name);
			setCompetitionPhaseInEdit(competition.phase);
		};
	};

	useEffect(() => {
		if (competitionsState.competitionSaveStatus === FetchStatus.success) {
			setCompetitionInEdit(null);
		}
	}, [competitionsState.competitionSaveStatus]);

	const onSaveCompClick = (competition) => {
		return (e) => {
			dispatch(saveCompetition({ name: competition.name, phase: competitionPhaseInEdit }));
		};
	};

	const getButtons = (competition) => {
		if (competitionInEdit) {
			if (competitionInEdit === competition.name) {
				return (<>
					<button type="button" className="btn btn-secondary" onClick={() => setCompetitionInEdit(null)} disabled={competitionsState.status === FetchStatus.pending}>Cancel</button>
					{' '}
					<button type="button" className="btn btn-primary" onClick={onSaveCompClick(competition)} disabled={competitionsState.status === FetchStatus.pending}>
						Save
						{' '}
						{competitionsState.status === FetchStatus.pending && <Spinner />}
					</button>
				</>);
			}
			return (<button type="button" className="btn invisible" aria-hidden>Fake</button>);
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
								<th scope="col"></th>
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
