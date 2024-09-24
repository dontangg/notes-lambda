// This is meant to mimic what AWS API Gateway does for local development

const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const port = 3000;
const index = require('./src/index');

app.use(bodyParser.text({ type: '*/*' }));

app.use((req, res, next) => {
	const event = {
		httpMethod: req.method,
		path: req.path,
		headers: req.headers,
		queryStringParameters: req.query,
		body: req.body,
	};
	const context = {};

	index.handler(event, context)
		.then(response => res.status(response.statusCode).set('Content-Type', 'application/json').send(response.body))
		.catch(err => next(err));
});

// error handler
app.use(function (err, req, res, next) {
	// This should never get hit because AWS Gateway doesn't handle this properly.
	// Logs will be hard to read and an unexpected response to the client will be sent.
	res.status(500).send({ type: 'FATAL', message: err.message, stack: err.stack });
})

app.listen(port, () => {
	console.log('API Gateway Mimic listening on port ' + port);
});