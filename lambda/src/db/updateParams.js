'use strict';

class UpdateParams {
	constructor(tableName, key) {
		this.tableName = tableName;
		this.key = key;
		this.propertiesToSet = [];
		this.propertiesToRemove = [];
		this.attributeNames = {};
		this.attributeValues = {};
	}

	addProperties(obj, attributes) {
		for (let i = 0; i < attributes.length; i++) {
			let propName = attributes[i];
			this.addProperty(propName, obj);
		}
	}

	addProperty(objPropName, obj) {
		// If the property doesn't exist, don't change it
		if (obj[objPropName] === undefined)
			return;

		let exprPropName = '#' + objPropName;

		this.attributeNames[exprPropName] = objPropName;

		// If it exists, but it is null or empty string, remove it; otherwise update it
		if (obj[objPropName]) {
			let exprValueName = ':new_' + objPropName;
			this.propertiesToSet.push(exprPropName + ' = ' + exprValueName);
			this.attributeValues[exprValueName] = obj[objPropName];
		} else {
			this.propertiesToRemove.push(exprPropName);
		}
	}

	isEmpty() {
		return this.propertiesToSet.length === 0 && this.propertiesToRemove.length === 0;
	}

	toJson() {
		let updateExpression = '';
		if (this.propertiesToSet.length > 0)
			updateExpression = 'SET ' + this.propertiesToSet.join(', ');
		if (this.propertiesToRemove.length > 0) {
			if (updateExpression !== '')
				updateExpression += ' ';
			updateExpression += 'REMOVE ' + this.propertiesToRemove.join(', ');
		}
		return {
			TableName: this.tableName,
			Key: this.key,
			UpdateExpression: updateExpression,
			ExpressionAttributeNames: this.attributeNames,
			ExpressionAttributeValues: this.attributeValues,
		};
	}
}

module.exports = UpdateParams;