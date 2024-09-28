'use strict';

/**
 * The DynamoDB schema is:
 * 
 * Notes
 * - Partition key: pk (String)
 * - Sort key: sk (String)
 * 
 * The pk is either "Competition" or "User"
 */

const AWS = require('aws-sdk');
AWS.config.update({region: 'us-east-1'});

const UpdateParams = require('./updateParams');

const dynamodb = new AWS.DynamoDB.DocumentClient();

const db = {
	generateId: function() {
		return Math.random().toString(36).substr(2) + Date.now().toString(36);
	},

	numericizeColumns: function(item, numericColumns) {
		numericColumns.forEach(column => {
			if (typeof item[column] !== 'undefined') {
				item[column] = parseFloat(item[column]);
			}
		});
	},

	stripWhitespace: function(item, stringColumns) {
		stringColumns.forEach(column => {
			if (typeof item[column] !== 'undefined') {
				item[column] = String(item[column]).trim();
			}
		});
	},

	list: async function(tableName) {
		let items = [];

		// Items will be paged if they reach more than 1MB total
		// LastEvaluatedKey and ExclusiveStartKey are used to request the next page
		let exclusiveStartKey = null;

		do {
			let options = { TableName: tableName };
			if (exclusiveStartKey) {
				options.ExclusiveStartKey = exclusiveStartKey;
			}
			let response = await dynamodb.scan(options).promise();

			let newItems = response.Items || [];
			items = [...items, ...newItems];

			exclusiveStartKey = response.LastEvaluatedKey;
		} while(exclusiveStartKey);

		return items;
	},

	// Used to get all items with a single hash key (partition key) and filter on the sort key
	query: async function(tableName, queryCondition, queryValues) {
		let items = [];

		// Items will be paged if they reach more than 1MB total
		// LastEvaluatedKey and ExclusiveStartKey are used to request the next page
		let exclusiveStartKey = null;

		do {
			const options = {
				TableName: tableName,
				KeyConditionExpression: queryCondition, //'MyPrimaryKey = :pkey and MySortKey > :skey', or begins_with(MySortKey, :skey)
				ExpressionAttributeValues: queryValues, //{ ':pkey': 'key', ':skey': 2015 },
			};
			if (exclusiveStartKey) {
				options.ExclusiveStartKey = exclusiveStartKey;
			}
			const response = await dynamodb.query(options).promise();

			const newItems = response.Items || [];
			items = [...items, ...newItems];

			exclusiveStartKey = response.LastEvaluatedKey;
		} while(exclusiveStartKey);

		return items;
	},

	deleteItem: function(tableName, key) {
		return dynamodb.delete({
			TableName: tableName,
			Key: key,
		}).promise();
	},

	getItem: async function(tableName, key) {
		const response = await dynamodb.get({
			TableName: tableName,
			Key: key,
		}).promise();

		if (!response || !response.Item) {
			return null;
		}

		return response.Item;
	},

	saveItem: async function(tableName, item, key, attributes) {
		const params = new UpdateParams(tableName, key);

		params.addProperties(item, attributes);

		if (params.isEmpty())
			return;

		return dynamodb.update(params.toJson()).promise();
	},
};

module.exports = db;