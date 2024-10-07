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

	updateDeepObject(objPath, updatedObject) {
		const propNames = objPath.split('.');

		const exprPropName = propNames.map(p => '#' + p).join('.');

		for (let i = 0; i < propNames.length; i++) {
			const p = propNames[i];
			this.attributeNames['#' + p] = p;
		};

		const exprValueName = ':new_' + propNames.join('_');
		this.propertiesToSet.push(`${exprPropName} = ${exprValueName}`);
		this.attributeValues[exprValueName] = updatedObject;
	}

	removeDeepObject(objPath) {
		const propNames = objPath.split('.');

		const exprPropName = propNames.map(p => '#' + p).join('.');

		for (let i = 0; i < propNames.length; i++) {
			const p = propNames[i];
			this.attributeNames['#' + p] = p;
		};

		this.propertiesToRemove.push(exprPropName);
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
		const json = {
			TableName: this.tableName,
			Key: this.key,
			UpdateExpression: updateExpression,
			ExpressionAttributeNames: this.attributeNames,
		};
		if (Object.keys(this.attributeValues).length > 0) {
			json.ExpressionAttributeValues = this.attributeValues;
		}

		return json;
	}
}

module.exports = UpdateParams;