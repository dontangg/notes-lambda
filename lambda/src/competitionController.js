'use strict';

const competitionDb = require('./db/competition');

const mapCompetition = (req, comp) => {
	const allowedUserIds = [req.user.id];
	if (req.user.partnerId) {
		allowedUserIds.push(req.user.partnerId);
	}

	if (comp) {

		// Report how many songs each person has submitted
		const songCounts = {};
		if (comp.songs) {
			for (const song of comp.songs) {
				songCounts[song.userId] = (songCounts[song.userId] || 0) + 1;
			}
		}
		comp.songCounts = songCounts;

		const hasForfeited = comp.forfeitedUserIds?.some(ffUserId => allowedUserIds.includes(ffUserId));

		// If the user hasn't forfeited, filter out userIds in the songs that they haven't gotten right
		if (!hasForfeited && comp.phase !== 'closed') {
			// Find the songs guessed correctly
			const correctlyGuessedSongs = [];
			const teamAttempts = (comp.attempts || []).filter(att => allowedUserIds.includes(att.userId)).sort((a, b) => b.createdAt.localeCompare(a.createdAt)); // sort in reverse
			const lastAttempt = teamAttempts?.[0];
			lastAttempt?.guesses?.forEach(guess => {
				const isCorrect = comp.songs.some(song => song.filename === guess.songFilename && song.userId === guess.guessedUserId);
				if (isCorrect) {
					correctlyGuessedSongs.push(guess.songFilename);
				}
			});

			// Filter out the userIds of the songs not submitted by the user or the user's partner and not guessed correctly
			comp.songs?.forEach(song => {
				if (!allowedUserIds.includes(song.userId) && !correctlyGuessedSongs.includes(song.filename)) {
					delete song.userId;
				}
			});
		}

		comp.attempts?.forEach(attempt => {
			attempt.correctGuessedUserIds = [];
			attempt.guesses?.forEach(guess => {
				const isCorrect = comp.songs.some(song => song.filename === guess.songFilename && song.userId === guess.guessedUserId);
				if (isCorrect) {
					attempt.correctGuessedUserIds.push(guess.guessedUserId);
				}
			});

			// Remove the array of the guesses inside attempts not made by the user or the user's partner
			if (!allowedUserIds.includes(attempt.userId)) {
				delete attempt.guesses;
			}
		});
	}

	return comp;
};

const competitionController = {

	getCurrent: async (req) => {
		const currentCompetition = mapCompetition(req, await competitionDb.getCurrent());
		return { statusCode: 200, body: JSON.stringify(currentCompetition) };
	},

	get: async (req) => {
		const comp = mapCompetition(req, await competitionDb.get(req.query['name']));
		return { statusCode: 200, body: JSON.stringify(comp) };
	},

	list: async (req) => {
		const competitions = await competitionDb.list();
		competitions.sort((a, b) => a.name.localeCompare(b.name) * -1);
		return { statusCode: 200, body: JSON.stringify(competitions) };
	},

	save: async (req) => {
		const comp = JSON.parse(req.body);
		await competitionDb.save(comp);

		return { statusCode: 200, body: JSON.stringify({ message: 'success' }) };
	},

	delete: async (req) => {
		const comp = JSON.parse(req.body);
		await competitionDb.delete(comp);

		return { statusCode: 200, body: JSON.stringify({ message: 'success' }) };
	}
}

module.exports = competitionController;
