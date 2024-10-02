'use strict';

const cryptoHelper = require('./cryptoHelper');
const logger = require('./logger');

module.exports = function(req) {
	if (req.method === 'POST' && req.path === '/get_token')
		return true;

	if (!process.env.ENCRYPTION_KEY && process.env.LOCAL === 'true') {
		req.user = {
			email: 'robert.don.wilson@gmail.com',
		};
		return true;
	}

	if (!req.headers)
		return false;

	const authHeader = req.headers['Authorization'] || req.headers['authorization'] || (req.query && req.query['authorization']);
	if (!authHeader)
		return false;

	try {
		const encryptedToken = authHeader.replace(/\s*bearer\s*/i, '');
		const token = JSON.parse(cryptoHelper.decrypt(encryptedToken));

		if (!token.email) {
			logger.error("authorizer", new Error('Bearer token decrypted successfuly, but is missing required data'), { token }, req);
			return false;
		}

		req.user = {
			email: token.email,
			id: token.userId,
			partnerId: token.partnerId,
		};
	} catch(err) {
		logger.error("authorizer", err, null, req);
		return false;
	}

	return true;
};