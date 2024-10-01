'use strict';

const competitionDb = require('./db/competition');

const competitionController = {

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
