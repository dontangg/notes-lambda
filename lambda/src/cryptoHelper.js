'use strict';

const bcrypt = require('bcryptjs');
const crypto = require('crypto');

module.exports = {
	hashPassword: async function(password) {
		const saltRounds = 10;
		return bcrypt.hash(password, saltRounds);
	},

	comparePassword: (password, passwordHash) => {
		return bcrypt.compare(password, passwordHash);
	},

	encrypt: (str) => {
		const iv = crypto.randomBytes(16); // The initialization vector length is always 16 for AES encryption
		const cipher = crypto.createCipheriv('aes256', process.env.ENCRYPTION_KEY, iv);
		let encrypted = cipher.update(str);
		encrypted = Buffer.concat([encrypted, cipher.final()]);
		const finalEncrypted = iv.toString('hex') + ':' + encrypted.toString('hex');

		return finalEncrypted;
	},

	decrypt: (encryptedString) => {
		const textParts = encryptedString.split(':');
		const iv = Buffer.from(textParts.shift(), 'hex');
		const encryptedText = Buffer.from(textParts.join(':'), 'hex');
		const decipher = crypto.createDecipheriv('aes256', Buffer.from(process.env.ENCRYPTION_KEY), iv);
		let decrypted = decipher.update(encryptedText);

		decrypted = Buffer.concat([decrypted, decipher.final()]);
		return decrypted.toString();
	},
};