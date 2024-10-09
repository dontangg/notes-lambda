'use strict';

const authorizer = require('./authorizer');
const Router = require('./router');
const router = new Router();
const logger = require('./logger');
const userController = require('./userController');
const competitionController = require('./competitionController');
const songController = require('./songController');

router.get('/users', userController.list);
router.get('/user', userController.get);
router.post('/user', userController.save);
router.get('/validate_user', userController.validateUser);
router.post('/get_token', userController.getToken);

router.get('/competitions', competitionController.list);
router.get('/competition/current', competitionController.getCurrent);
router.get('/competition', competitionController.get);
router.post('/competition', competitionController.save);
router.delete('/competition', competitionController.delete);
router.post('/forfeit', competitionController.forfeit);
router.post('/attempt', competitionController.saveAttempt);

router.get('/songs', songController.all);
router.post('/song', songController.save);
router.delete('/song/:id', songController.delete);
router.post('/song_upload_url', songController.getUploadUrl);
router.post('/trigger_transcoder', songController.triggerTranscoder);

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

const addCorsHeaders = (req, res) => {
	if (req?.headers) {
		const origin = req.headers['Origin'] || req.headers['origin'];
		if (validOrigins.includes(origin)) {
			if (!res.headers)
				res.headers = {};
			res.headers['Access-Control-Allow-Origin'] = origin;
			res.headers['Access-Control-Allow-Methods'] = 'GET, POST, DELETE, OPTIONS';
			res.headers['Access-Control-Allow-Headers'] = 'Authorization';
		}
	}
};

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

		addCorsHeaders(req, response)

		return response;
	}
	catch (error) {
		let response = { statusCode: 500 };
		addCorsHeaders(req, response);
		if (error) {
			logger.error('500_ERROR', error, null, req);
			response.body = JSON.stringify({ error: { message: error.message, name: error.name, stack: error.stack } });
		}
		return response;
	}
};