const db = require('./index');

const tableName = 'Notes';
const attributes = [ 'admin', 'groupId', 'id', 'name', 'passwordHash' ];
const pk = 'User';

const mapFromDb = (user) => {
	user.email = user.sk;

	delete user.pk;
	delete user.sk;

	return user;
};

const userDb = {

	get: async (email) => {
		const user = await db.getItem(tableName, { pk, sk: email });
		return user ? mapFromDb(user) : null;
	},

	save: async (user) => {
		// if (!user.id) {
		// 	user.id = db.generateId();
		// }

		db.stripWhitespace(user, [ 'name' ]);

		return db.saveItem(tableName, user, { pk, sk: user.email }, attributes);
	},
};

module.exports = userDb;