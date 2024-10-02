'use strict';

const competitionDb = require('./db/competition');

const competitionController = {

	getCurrent: async (req) => {
		const currentCompetition = await competitionDb.getCurrent();

		const allowedUserIds = [req.user.id];
		if (req.user.partnerId) {
			allowedUserIds.push(req.user.partnerId);
		}

		if (currentCompetition) {
			if (currentCompetition.phase === 'submitting') {
				// Filter out the songs not submitted by the user or the user's partner
				if (currentCompetition.songs) {
					currentCompetition.songs = currentCompetition.songs.filter(song => allowedUserIds.includes(song.userId));
				}
			} else if (currentCompetition.phase === 'guessing') {
				// Find the songs guessed correctly
				const correctlyGuessedSongs = [];
				const lastAttempt = currentCompetition.attempts?.[currentCompetition.attempts?.length - 1];
				lastAttempt?.guesses?.forEach(guess => {
					const isCorrect = currentCompetition.songs.some(song => song.filename === guess.songFilename && song.userId === guess.guessedUserId);
					if (isCorrect) {
						correctlyGuessedSongs.push(guess.songFilename);
					}
				});

				const hasForfeited = currentCompetition?.forfeitedUserIds?.some(ffUserId => allowedUserIds.includes(ffUserId));
				if (!hasForfeited) {
					// Filter out the userIds of the songs not submitted by the user or the user's partner and not guessed correctly
					currentCompetition.songs?.forEach(song => {
						if (!allowedUserIds.includes(song.userId) && !correctlyGuessedSongs.includes(song.filename)) {
							delete song.userId;
						}
					});
				}
			}

			// Remove the array of the guesses inside attempts not made by the user or the user's partner
			currentCompetition.attempts?.forEach(attempt => {
				if (!allowedUserIds.includes(attempt.userId)) {
					delete attempt.guesses;
				}
			});
		}

		return { statusCode: 200, body: JSON.stringify(currentCompetition) };
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
