const crypto = require('crypto');
const fs = require('fs/promises');
const path = require('path');
const { json, methodNotAllowed, readJson } = require('../_lib/http');
const { hashPassword } = require('../../scripts/hash-os-password');

const isLoopback = (request) => {
  const address = String(request.socket?.remoteAddress || '');
  return address === '127.0.0.1' || address === '::1' || address === '::ffff:127.0.0.1';
};
const environmentFile = path.join(__dirname, '..', '..', '.env.os.local');
const persistServerEnvironment = (hash, cronSecret) => fs.writeFile(environmentFile, `OS_ADMIN_PASSWORD_HASH=${hash}\nCRON_SECRET=${cronSecret}\n`, { encoding: 'utf8', mode: 0o600 });
const environmentFileExists = async () => { try { await fs.access(environmentFile); return true; } catch (_) { return false; } };

module.exports = async (request, response) => {
  response.setHeader('Cache-Control', 'no-store');
  if (!isLoopback(request)) return json(response, 403, { success: false, error: 'local_setup_only' });
  if (request.method !== 'POST') return methodNotAllowed(response, ['POST']);
  if (process.env.OS_ADMIN_PASSWORD_HASH) {
    if (!(await environmentFileExists())) {
      const cronSecret = process.env.CRON_SECRET || crypto.randomBytes(32).toString('base64url');
      process.env.CRON_SECRET = cronSecret;
      await persistServerEnvironment(process.env.OS_ADMIN_PASSWORD_HASH, cronSecret);
      return json(response, 200, { success: true, data: { persisted: true } });
    }
    return json(response, 409, { success: false, error: 'admin_already_configured' });
  }
  try {
    const body = await readJson(request);
    const password = String(body.password || '');
    const hash = await hashPassword(password);
    const cronSecret = crypto.randomBytes(32).toString('base64url');
    process.env.OS_ADMIN_PASSWORD_HASH = hash;
    process.env.CRON_SECRET = cronSecret;
    await persistServerEnvironment(hash, cronSecret);
    return json(response, 200, { success: true });
  } catch (error) {
    delete process.env.OS_ADMIN_PASSWORD_HASH;
    delete process.env.CRON_SECRET;
    return json(response, error.message.includes('Password must') ? 400 : 503, { success: false, error: error.message.includes('Password must') ? 'password_too_short' : 'setup_unavailable' });
  }
};
