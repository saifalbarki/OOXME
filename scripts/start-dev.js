const fs = require('fs');
const http = require('http');
const os = require('os');
const path = require('path');
const { spawn } = require('child_process');
const { query, closeDatabase } = require('../api/_lib/db');

const root = path.resolve(__dirname, '..');
const port = Number(process.env.PORT || 3000);

const loadLocalEnvironment = () => {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Development startup cannot run with NODE_ENV=production');
  }
  process.env.NODE_ENV ||= 'development';
  if (typeof process.loadEnvFile !== 'function') throw new Error('Node 20.6+ is required to load local environment files');

  for (const file of ['.env.local', '.env.development.local']) {
    const envPath = path.join(root, file);
    if (fs.existsSync(envPath)) process.loadEnvFile(envPath);
  }
  const osEnvPath = path.join(root, '.env.os.local');
  if (!fs.existsSync(osEnvPath)) throw new Error('Missing ignored local OS environment file: .env.os.local');
  const explicit = new Set(Object.keys(process.env).filter((key) => process.env[key]));
  for (const line of fs.readFileSync(osEnvPath, 'utf8').split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=/);
    if (match && !explicit.has(match[1])) delete process.env[match[1]];
  }
  process.loadEnvFile(osEnvPath);
};

const lanAddress = () => Object.values(os.networkInterfaces())
  .flat()
  .find((address) => address && address.family === 'IPv4' && !address.internal)?.address;

const request = (url) => new Promise((resolve, reject) => {
  const client = http.get(url, { timeout: 5000, headers: { Accept: 'application/json' } }, (response) => {
    response.resume();
    response.once('end', () => resolve(response.statusCode));
  });
  client.once('timeout', () => client.destroy(new Error('startup_http_timeout')));
  client.once('error', reject);
});

const waitForAuth = async (attempt = 0) => {
  try {
    const status = await request(`http://127.0.0.1:${port}/api/os/auth`);
    if (status === 200) return;
    throw new Error(`OS auth preflight returned HTTP ${status}`);
  } catch (error) {
    if (attempt >= 20) throw error;
    await new Promise((resolve) => setTimeout(resolve, 150));
    return waitForAuth(attempt + 1);
  }
};

const preflight = async () => {
  const required = ['DATABASE_URL', 'OS_ADMIN_PASSWORD_HASH'];
  const missing = required.filter((name) => !process.env[name]);
  if (missing.length) throw new Error(`Missing local runtime configuration: ${missing.join(', ')}`);
  await query('SELECT 1 AS ok');
};

const main = async () => {
  loadLocalEnvironment();
  await preflight();
  console.log('OOXME PostgreSQL preflight: ok');

  const child = spawn(process.execPath, [path.join(root, 'server.js')], {
    cwd: root,
    env: { ...process.env, OOXME_STARTUP_FLOW: '1' },
    stdio: 'inherit'
  });
  let stopping = false;
  let childExitError = null;
  const stop = async (signal) => {
    if (stopping) return;
    stopping = true;
    child.kill(signal);
    await closeDatabase();
  };
  process.once('SIGINT', () => { void stop('SIGINT'); });
  process.once('SIGTERM', () => { void stop('SIGTERM'); });
  child.once('exit', (code, signal) => {
    if (!stopping && code !== 0) childExitError = new Error(`server_exit_${code ?? signal}`);
    void closeDatabase().finally(() => process.exit(code ?? (signal ? 1 : 0)));
  });

  const waitForReady = async () => {
    if (childExitError) throw childExitError;
    await waitForAuth();
    if (childExitError) throw childExitError;
  };
  await waitForReady();
  const address = lanAddress();
  if (!address) throw new Error('No active LAN IPv4 address detected');
  console.log(`OOXME LAN /os: http://${address}:${port}/os`);
};

main().catch(async (error) => {
  await closeDatabase().catch(() => undefined);
  console.error(`OOXME development startup failed: ${error.code || error.message}`);
  process.exitCode = 1;
});
