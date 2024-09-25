'use strict';

const cryptoHelper = require('./cryptoHelper');
const userDb = require('./db/user');

const userController = {

	validateUser: async (req) => {
		// A simple method just to ensure that we've gone through the authorizer
		return {
			statusCode: 200,
			body: '',
		};
	},

	getToken: async (req) => {
		const { email, password } = JSON.parse(req.body);

		const user = await userDb.get(email);
		if (user) {
			const isCorrectPassword = await cryptoHelper.comparePassword(password, user.passwordHash);
			if (isCorrectPassword) {
				const json = JSON.stringify({ email: user.email, iat: new Date().getTime() });
				const finalEncrypted = cryptoHelper.encrypt(json);

				return { statusCode: 200, body: JSON.stringify({ token: finalEncrypted }) };
			}
		}

		return { statusCode: 401, body: '' };
	},


	get: async (req) => {
		let user = await userDb.get(req.user.email);

		if (!user) {
			return { statusCode: 404 };
		}

		delete user.passwordHash;

		return { statusCode: 200, body: JSON.stringify(user) };
	},

	save: async (req) => {
		let user = JSON.parse(req.body);
		user.sk = req.user.email;

		if (user.password) {
			user.passwordHash = await cryptoHelper.hashPassword(user.password);
		}

		await db.User.save(user);

		return { statusCode: 200, body: JSON.stringify({ id: user.id }) };
	}
}

module.exports = userController;
