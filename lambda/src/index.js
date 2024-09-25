'use strict';

let authorizer = require('./authorizer');
let Router = require('./router');
let router = new Router();
let logger = require('./logger');
let UserController = require('./userController');

router.get('/user', UserController.get);
router.post('/user', UserController.save);
router.get('/validate_user', UserController.validateUser);
router.post('/get_token', UserController.getToken);

/* TEST - These are test endpoints to test how errors & timeouts happen */
router.get('/testerror', (req) => {
	logger.error('testerror', new Error('testerror message'), null, req);
	return { statusCode: 200, body: 'testerror' };
});

router.get('/timeout', async function timeoutHandler(req) {
	await new Promise(resolve => setTimeout(resolve, 16 * 1000));
	return { statusCode: 200, body: "You shouldn't see this because it's going to time out!" };
});
/* END TEST */

const validOrigins = ['http://localhost:1234', 'https://notes.thewilsonpad.com'];

exports.handler = async function(event, context) {
	let req = null;
	try {
		context.callbackWaitsForEmptyEventLoop = false;

		// return { statusCode: 500, body: JSON.stringify({ event, context }) };

		req = {
			method: event.httpMethod,
			path: event.path,
			headers: event.headers,
			query: event.queryStringParameters,
		};
		if (event.body) req.body = event.body;
		console.log(`REQUEST ${JSON.stringify(req)}`);

		let response = null;
		if (req.method === 'OPTIONS') {
			response = { statusCode: 200 };
		} else {
			if (!authorizer(req)) {
				response = { statusCode: 401, body: JSON.stringify({ 'message': 'Unauthorized' }) };
			} else {
				response = await router.run(req);
			}
		}

		if (req.headers) {
			let origin = req.headers['Origin'] || req.headers['origin'];
			if (validOrigins.includes(origin)) {
				if (!response.headers)
					response.headers = {};
				response.headers['Access-Control-Allow-Origin'] = origin;
				response.headers['Access-Control-Allow-Methods'] = 'GET, POST, DELETE, OPTIONS';
				response.headers['Access-Control-Allow-Headers'] = 'Authorization';
			}
		}

		return response;
	}
	catch (error) {
		let response = { statusCode: 500 };
		if (error) {
			logger.error('500_ERROR', error, null, req);
			response.body = JSON.stringify({ error: { message: error.message, name: error.name, stack: error.stack } });
		}
		return response;
	}
};