const db = require('./index');

const tableName = 'Notes';
const pk = 'AllSongs';

const allSongsDb = {

	get: async () => {
		return await db.getItem(tableName, { pk, sk: 'index' });
	},

};

module.exports = allSongsDb;