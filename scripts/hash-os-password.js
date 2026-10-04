#!/usr/bin/env node
const crypto = require('crypto');

const hashPassword = (password) => new Promise((resolve, reject) => {
  if (String(password || '').length < 12) return reject(new Error('Password must be at least 12 characters.'));
  const salt = crypto.randomBytes(16).toString('base64url');
  crypto.scrypt(String(password), salt, 64, { N: 16384, r: 8, p: 1, maxmem: 128 * 1024 * 1024 }, (error, derived) => error ? reject(new Error('Unable to derive password hash.')) : resolve(`scrypt$16384$8$1$${salt}$${derived.toString('hex')}`));
});

if (require.main === module) {
  let input = '';
  process.stdin.setEncoding('utf8');
  process.stdin.on('data', (chunk) => { input += chunk; });
  process.stdin.on('end', async () => {
    try { process.stdout.write(`${await hashPassword(input.replace(/[\r\n]+$/, ''))}\n`); }
    catch (error) { console.error(error.message); process.exitCode = 1; }
  });
}

module.exports = { hashPassword };
