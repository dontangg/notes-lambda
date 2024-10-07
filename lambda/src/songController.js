'use strict';

const competitionDb = require('./db/competition');

const songController = {

	save: async (req) => {
		let updatedSong = JSON.parse(req.body);

		const curComp = await competitionDb.getCurrent();

		// Check to make sure that the userId is not allowed to change unless you're changing it to/from you/partner or you're an admin
		if (!req.user.admin && updatedSong.userId !== req.user.userId && updatedSong.userId !== req.user.partnerId) {
			return { statusCode: 403, body: JSON.stringify({ message: 'You are not allowed to change the userId of the song to this userId' }) };
		}

		if (updatedSong.id) {
			const existingSong = curComp.songs.find(s => s.id === updatedSong.id);

			if (!existingSong) {
				return { statusCode: 404, body: JSON.stringify({ message: 'Song not found' }) };
			}

			updatedSong = { ...existingSong, ...updatedSong };
		}
		
		await competitionDb.saveSong(curComp, updatedSong);

		return { statusCode: 200, body: JSON.stringify({ message: 'success', song: updatedSong }) };
	},

	delete: async (req) => {
		const comp = JSON.parse(req.body);
		await competitionDb.delete(comp);

		return { statusCode: 200, body: JSON.stringify({ message: 'success' }) };
	}
}

module.exports = songController;
