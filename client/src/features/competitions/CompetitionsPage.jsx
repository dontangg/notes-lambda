import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from 'react-redux';
import { fetchCompetitions, selectCompetitions } from "./competitionsSlice";
import { FetchStatus } from "../../app/appFetch";
import Spinner from "../../common/Spinner";

export default function AccountPage() {
	const dispatch = useDispatch();
	const competitionsState = useSelector(selectCompetitions);

	useEffect(() => {
		dispatch(fetchCompetitions());
	}, []);

	return (
		<>
			<h1>Competitions</h1>
			{competitionsState.error && (<div className="alert alert-danger" role="alert">{competitionsState.error}</div>)}
			<div className="row">
				<div className="col-lg-6">
					<table className="table table-striped align-middle">
						<thead>
							<tr>
								<th scope="col">Name</th>
								<th scope="col">Phase</th>
								<th scope="col"></th>
								<th scope="col"></th>
							</tr>
						</thead>
						<tbody>
							{competitionsState.competitions?.map(competition => (
								<tr key={competition.name}>
									<th scope="row">{competition.name}</th>
									<td>{competition.phase}</td>
									<td>
										<button type="button" className="btn btn-secondary">Edit</button>
										{' '}
										<button type="button" className="btn btn-secondary">Scorecard</button>
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
