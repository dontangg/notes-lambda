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
			// Filter out the userIds of the songs not submitted by the user or the user's partner
			currentCompetition.songs.forEach(song => {
				if (!allowedUserIds.includes(song.userId)) {
					delete song.userId;
				}
			});

			// Remove the array of the guesses inside attempts not made by the user or the user's partner
			currentCompetition.attempts.forEach(attempt => {
				if (!allowedUserIds.includes(attempt.userId)) {
					delete attempt.guesses;
				}
			});
		}

		const fix = (c) => {
			c.attempts.forEach(att => att.userId = Number(att.userId));
			copy(JSON.stringify(c));
		};

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
