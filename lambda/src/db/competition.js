const db = require('./index');

const tableName = 'Notes';
const attributes = [ 'attempts', 'isActive', 'phase', 'songs' ];
const pk = 'Competition';

const mapFromDb = (comp) => {
	comp.name = comp.sk;

	delete comp.pk;
	delete comp.sk;

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

	save: async (comp) => {
		return db.saveItem(tableName, comp, { pk, sk: comp.name }, attributes);
	},

	delete: async (comp) => {
		return db.deleteItem(tableName, { pk, sk: comp.name });
	},
};

module.exports = competitionDb;