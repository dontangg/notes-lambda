'use strict';

const competitionDb = require('./db/competition');

const competitionController = {

	list: async (req) => {
		const competitions = await competitionDb.list();

		return { statusCode: 200, body: JSON.stringify(competitions) };
	},
}

module.exports = competitionController;
