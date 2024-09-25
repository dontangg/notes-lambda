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

	encrypt: function(str) {
		let iv = crypto.randomBytes(16); // The initialization vector length is always 16 for AES encryption
		let cipher = crypto.createCipheriv('aes256', process.env.ENCRYPTION_KEY, iv);
		let encrypted = cipher.update(str);
		encrypted = Buffer.concat([encrypted, cipher.final()]);
		let finalEncrypted = iv.toString('hex') + ':' + encrypted.toString('hex');

		return finalEncrypted;
	},

	decrypt: function(encryptedString) {
		let textParts = encryptedString.split(':');
		let iv = Buffer.from(textParts.shift(), 'hex');
		let encryptedText = Buffer.from(textParts.join(':'), 'hex');
		let decipher = crypto.createDecipheriv('aes256', Buffer.from(process.env.ENCRYPTION_KEY), iv);
		let decrypted = decipher.update(encryptedText);

		decrypted = Buffer.concat([decrypted, decipher.final()]);
		return decrypted.toString();
	},
};