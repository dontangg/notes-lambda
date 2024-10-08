const db = require('./index');

const tableName = 'Notes';
const attributes = [ 'attempts', 'forfeitedUserIds', 'isActive', 'phase', 'songs' ];
const pk = 'Competition';

const mapFromDb = (comp) => {
	comp.name = comp.sk;

	delete comp.pk;
	delete comp.sk;

	// Convert songs from an object with ids as keys to an array
	if (comp.songs) {
		comp.songs = Object.keys(comp.songs).map(id => ({ id, ...comp.songs[id] }));
	}

	return comp;
};

const competitionDb = {

	list: async () => {
		const comps = await db.query(tableName, 'pk = :pk', { ':pk': pk }, 'pk, sk, phase');
		return comps.map(mapFromDb);
	},

	get: async (name) => {
		const comp = await db.getItem(tableName, { pk, sk: name });
		return comp ? mapFromDb(comp) : null;
	},

	getCurrent: async () => {
		const nonClosedComps = await db.scan(tableName, 'pk = :pk AND phase <> :phase', { ':pk': pk, ':phase': 'closed' });
		const curComp = nonClosedComps.length ? mapFromDb(nonClosedComps[0]) : null;
		return curComp;
	},

	save: async (comp) => {
		return db.saveItem(tableName, comp, { pk, sk: comp.name }, attributes);
	},

	delete: async (comp) => {
		return db.deleteItem(tableName, { pk, sk: comp.name });
	},

	saveSong: async (comp, song) => {
		let songId = song.id;
		
		song.userId = Number(song.userId);
		const songToSave = { ...song };

		if (songId) {
			delete songToSave.id;
		} else {
			songId = db.generateSimpleId();
			song.id = songId;

			// If the songs don't even exist yet, just create the list with one item
			if (!comp.songs || comp.songs.length === 0) {
				const compToSave = { songs: { [songId]: song } };
				return db.saveItem(tableName, compToSave, { pk, sk: comp.name }, ['songs']);
			}
		}

		return db.saveDeepItem(tableName, { pk, sk: comp.name }, `songs.${songId}`, songToSave);
	},

	deleteSong: async (compName, songId) => {
		return db.removeDeepItem(tableName, { pk, sk: compName }, `songs.${songId}`);
	},

	saveAttempt: async (competition, attempt) => {
		if (competition.attempts) {
			return db.appendToList(tableName, { pk, sk: competition.name }, 'attempts', attempt);
		}

		const compToSave = { attempts: [ attempt ] };
		return db.saveItem(tableName, compToSave, { pk, sk: competition.name }, ['attempts']);
	},

	forfeit: async (competition, userId) => {
		if (competition.forfeitedUserIds) {
			return db.appendToList(tableName, { pk, sk: competition.name }, 'forfeitedUserIds', userId);
		}

		const compToSave = { forfeitedUserIds: [ userId ] };
		return db.saveItem(tableName, compToSave, { pk, sk: competition.name }, ['forfeitedUserIds']);
	},
};

module.exports = competitionDb;