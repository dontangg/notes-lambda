
const getLogMessage = (grouping, error, meta, req) => {
	const o = { grouping };
	if (error) {
		o.errorMessage = error.message;
		o.errorStack = error.stack;
	}
	if (meta) {
		o.meta = meta;
	}
	if (req) {
		o.requestMethod = req.method;
		o.requestPath = req.path;
	}

	return JSON.stringify(o);
};

const logger = {
	info: function(grouping, error = null, meta = null, req = null) {
		console.info(getLogMessage(grouping, error, meta));
	},
	warn: function(grouping, error = null, meta = null, req = null) {
		console.warn(getLogMessage(grouping, error, meta));
	},
	error: function(grouping, error, meta = null, req = null) {
		console.error(getLogMessage(grouping, error, meta));
	},
};

module.exports = logger;