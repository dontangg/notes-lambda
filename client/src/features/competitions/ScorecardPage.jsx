import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from 'react-router-dom';
import { CompetitionPhase, fetchCompetition, fetchCurrentCompetition, selectCompetitions, selectAllUsers } from "./competitionsSlice";
import { useDocumentTitle } from "../../app/customHooks";
import { timeAgoInWords } from '../../app/utilities';

export default function ScorecardPage() {
	const { name: nameParam } = useParams();
	const dispatch = useDispatch();
	const competitionsState = useSelector(selectCompetitions);
	const allUsers = useSelector(selectAllUsers);
	useDocumentTitle('Scorecard');

	useEffect(() => {
		if (nameParam === 'current') {
			dispatch(fetchCurrentCompetition());
		} else if (!competitionsState.competitions?.find(c => c.name === nameParam)?.songCounts) {
			dispatch(fetchCompetition(nameParam));
		}
	}, [nameParam]);

	const competition = nameParam === 'current'
		? competitionsState.currentCompetition
		: competitionsState.competitions?.find(c => c.name === nameParam);
	
	const participatingUsers = allUsers?.filter(u => {
		if (nameParam === 'current' || (competition && competition.phase !== CompetitionPhase.closed))
			return u.isParticipating;
		// If this isn't the current competition, use the list of submitted songs to know who participated
		return competition?.songs?.some(song => song.userId === u.id);
	}) || [];

	const groups = [];
	for (let i = 0; i < participatingUsers?.length; i++) {
		const user = participatingUsers[i];

		// If we already have a group with this user in it, skip
		if (groups.some(g => g.users.some(u => u.id === user.id))) continue;
		
		const group = { users: [] };
		groups.push(group);

		const teamIds = [user.id];
		const partner = participatingUsers.find(u => u.id === user.partnerId);
		group.users.push({ ...user, songCount: competition?.songCounts?.[String(user.id)] || 0 });
		if (partner) {
			teamIds.push(partner.id);
			group.users.push({ ...partner, songCount: competition?.songCounts?.[String(partner.id)] || 0 });
		}

		group.attempts = competition?.attempts?.filter(att => teamIds.includes(att.userId));

		group.forfeited = competition?.forfeitedUserIds?.some(id => teamIds.includes(id));
	}

	const totalSongCount = competition?.songs?.length - 2;

	return (
		<div className="scorecard">
			<h1 className="mb-4">{competition?.name} Scorecard</h1>
			<div className="row">
				<div className="col-xl-9">
					<ul>
						{groups.map((group, i) => (
							<li key={i}>
								{group.users.map(u => (
									<p key={u.id}>
										{u.name} submitted {u.songCount} song{u.songCount === 1 ? '' : 's'}
									</p>
								))}
								{(group.attempts?.length > 0) && (
									<>
										<h5>Guesses</h5>
										<table className="table table-striped">
											<tbody>
												{group.attempts.map(att => (
													<tr key={att.createdAt}>
														<td>{att.correctCount} of {totalSongCount} correct</td>
														<td>{timeAgoInWords(att.createdAt)}</td>
														<td>{att.correctGuessedUserIds?.map(guessedUserId => participatingUsers.find(u => u.id === guessedUserId).name).sort().join(', ')}</td>
													</tr>
												))}
											</tbody>
										</table>
									</>
								)}
								{group.forfeited && (<p>Forfeited</p>)}
							</li>
						))}
					</ul>
				</div>
			</div>
		</div>
	);
};
