import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from 'react-router-dom';
import { fetchCompetition, selectCompetitions, selectAllUsers } from "./competitionsSlice";

export default function SongcardPage() {
	const { name: nameParam } = useParams();
	const dispatch = useDispatch();
	const competitionsState = useSelector(selectCompetitions);
	const allUsers = useSelector(selectAllUsers);

	useEffect(() => {
		if (nameParam !== 'current' && !competitionsState.competitions?.find(c => c.name === nameParam)?.songCounts) {
			dispatch(fetchCompetition(nameParam));
		}
	}, [nameParam]);

	const competition = nameParam === 'current'
		? competitionsState.currentCompetition
		: competitionsState.competitions?.find(c => c.name === nameParam);
	
	const participatingUsers = allUsers?.filter(u => {
		if (nameParam === 'current')
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
		group.users.push({ ...user, songCount: competition?.songCounts?.[String(user.id)] });
		if (partner) {
			teamIds.push(partner.id);
			group.users.push({ ...partner, songCount: competition?.songCounts?.[String(partner.id)] });
		}

		group.attempts = competition?.attempts?.filter(att => teamIds.includes(att.userId));
	}

	const totalSongCount = competition?.songs?.length - 2;

	const timeAgoInWords = (timeStr) => {
		const seconds = Math.floor((new Date() - new Date(timeStr)) / 1000);
		let num = 0;
		let unit = '';
		let modifier = '';
		if (seconds < 60) {
			num = seconds;
			unit = 'second';
			modifier = 'about';
		} else if (seconds < 3600) {
			num = Math.floor(seconds / 60);
			unit = 'minute';
			modifier = 'about';
		} else if (seconds < 86400) {
			num = Math.floor(seconds / 3600);
			unit = 'hour'
			modifier = 'over';
		} else if (seconds < 604800) {
			num = Math.floor(seconds / 86400);
			unit = 'day';
			modifier = 'over';
		} else if (seconds < 31536000) {
			num = Math.floor(seconds / 604800);
			unit = 'week'
			modifier = 'over';
		} else {
			num = Math.floor(seconds / 31536000);
			unit = 'year';
			modifier = 'over';
		}

		return `${modifier} ${num} ${unit}${num === 1 ? '' : 's'} ago`;
	};

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
														<td>{att.correctGuessedUserIds?.map(guessedUserId => participatingUsers.find(u => u.id === guessedUserId).name).join(', ')}</td>
													</tr>
												))}
											</tbody>
										</table>
									</>
								)}
							</li>
						))}
					</ul>
				</div>
			</div>
		</div>
	);
};
