const crypto = require('crypto');

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || '32byteslongencryptionkeymustb32b'; // 32 bytes
const IV_LENGTH = 16;

function encryptBuffer(buffer) {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
    const encrypted = Buffer.concat([cipher.update(buffer), cipher.final()]);
    return Buffer.concat([iv, encrypted]); // Prepend IV
}

function decryptBuffer(encryptedBuffer) {
    const iv = encryptedBuffer.slice(0, IV_LENGTH);
    const encryptedText = encryptedBuffer.slice(IV_LENGTH);
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
    const decrypted = Buffer.concat([decipher.update(encryptedText), decipher.final()]);
    return decrypted;
}

module.exports = { encryptBuffer, decryptBuffer };
