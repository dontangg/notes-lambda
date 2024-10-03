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
				const json = JSON.stringify({ email: user.email, iat: new Date().getTime(), partnerId: user.partnerId, userId: user.id });
				const finalEncrypted = cryptoHelper.encrypt(json);

				return { statusCode: 200, body: JSON.stringify({
					token: finalEncrypted,
					user: {
						admin: user.admin,
						id: user.id,
						partnerId: user.partnerId,
					},
				})};
			}
		}

		return { statusCode: 401, body: '' };
	},
	
	list: async (req) => {
		const users = await userDb.list();

		return { statusCode: 200, body: JSON.stringify(users) };
	},

	get: async (req) => {
		const user = await userDb.get(req.user.email);

		if (!user) {
			return { statusCode: 404 };
		}

		delete user.passwordHash;

		return { statusCode: 200, body: JSON.stringify(user) };
	},

	save: async (req) => {
		const user = JSON.parse(req.body);
		user.email = req.user.email;

		if (user.curPassword && user.newPassword) {
			const storedUser = await userDb.get(user.email);
			if (await cryptoHelper.comparePassword(user.curPassword, storedUser.passwordHash)) {
				user.passwordHash = await cryptoHelper.hashPassword(user.newPassword);
			} else {
				return { statusCode: 403, body: JSON.stringify({ message: 'Current password is incorrect.' }) };
			}
		}

		await userDb.save(user);

		return { statusCode: 200 };
	}
}

module.exports = userController;
