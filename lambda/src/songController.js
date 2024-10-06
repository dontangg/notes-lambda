'use strict';

const competitionDb = require('./db/competition');

const songController = {

	save: async (req) => {
		let updatedSong = JSON.parse(req.body);

		const curComp = await competitionDb.getCurrent();
		const song = curComp.songs.find(s => s.id === updatedSong.id);

		if (!song) {
			return { statusCode: 404, body: JSON.stringify({ message: 'Song not found' }) };
		}

		updatedSong = {...song, ...updatedSong};
		await competitionDb.saveSong(curComp.name, updatedSong);

		return { statusCode: 200, body: JSON.stringify({ message: 'success', song: updatedSong }) };
	},

	delete: async (req) => {
		const comp = JSON.parse(req.body);
		await competitionDb.delete(comp);

		return { statusCode: 200, body: JSON.stringify({ message: 'success' }) };
	}
}

module.exports = songController;
