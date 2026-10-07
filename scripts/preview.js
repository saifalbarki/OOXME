const http = require('http');
const os = require('os');
const path = require('path');
const { execFileSync, spawn } = require('child_process');

const root = path.resolve(__dirname, '..');
const port = Number(process.env.PORT || 3000);

const isPrivateIpv4 = (address) => {
  const octets = address.split('.').map(Number);
  return octets.length === 4 && (
    octets[0] === 10 ||
    (octets[0] === 172 && octets[1] >= 16 && octets[1] <= 31) ||
    (octets[0] === 192 && octets[1] === 168)
  );
};

const lanCandidates = () => Object.entries(os.networkInterfaces())
  .flatMap(([name, entries]) => (entries || []).map((entry) => ({ name, ...entry })))
  .filter((entry) => (entry.family === 'IPv4' || entry.family === 4) && !entry.internal && isPrivateIpv4(entry.address))
  .sort((left, right) => {
    const preferred = /wi[- ]?fi|wlan|wireless|hotspot|ethernet/i;
    return Number(preferred.test(right.name)) - Number(preferred.test(left.name));
  });

const windowsNodePidsOnPort = () => {
  if (process.platform !== 'win32') return [];
  let output = '';
  try { output = execFileSync('netstat.exe', ['-ano', '-p', 'tcp'], { encoding: 'utf8' }); } catch (_) { return []; }
  const listenerPattern = new RegExp(`^TCP\\s+\\S+:${port}\\s+\\S+\\s+LISTENING\\s+(\\d+)$`, 'i');
  return [...new Set(output.split(/\r?\n/)
    .map((line) => line.trim().match(listenerPattern))
    .filter(Boolean)
    .map((match) => Number(match[1]))
    .filter((pid) => pid > 0))];
};

const stopStalePreview = () => {
  for (const pid of windowsNodePidsOnPort()) {
    let processName = '';
    try {
      processName = execFileSync('tasklist.exe', ['/FI', `PID eq ${pid}`, '/FO', 'CSV', '/NH'], { encoding: 'utf8' });
    } catch (_) { continue; }
    if (!/"node(?:\.exe)?"/i.test(processName)) continue;
    try { execFileSync('taskkill.exe', ['/PID', String(pid), '/T', '/F'], { stdio: 'ignore' }); } catch (_) { /* already exited */ }
  }
};

const request = (url) => new Promise((resolve, reject) => {
  const client = http.get(url, { timeout: 5000 }, (response) => {
    response.resume();
    response.once('end', () => resolve(response.statusCode));
  });
  client.once('timeout', () => client.destroy(new Error('preview_timeout')));
  client.once('error', reject);
});

const waitForPreview = async (urls, attempt = 0) => {
  try {
    const statuses = await Promise.all(urls.map(request));
    if (statuses.every((status) => status >= 200 && status < 400)) return statuses;
    throw new Error(`preview_http_${statuses.join('_')}`);
  } catch (error) {
    if (attempt >= 30) throw error;
    await new Promise((resolve) => setTimeout(resolve, 150));
    return waitForPreview(urls, attempt + 1);
  }
};

const main = async () => {
  stopStalePreview();
  const child = spawn(process.execPath, [path.join(root, 'server.js')], {
    cwd: root,
    env: { ...process.env, NODE_ENV: process.env.NODE_ENV || 'development' },
    stdio: 'inherit'
  });
  const stop = () => { if (!child.killed) child.kill(); };
  process.once('SIGINT', stop);
  process.once('SIGTERM', stop);

  const candidate = lanCandidates()[0];
  if (!candidate) {
    stop();
    throw new Error('No active private Wi-Fi/Hotspot IPv4 address detected');
  }
  const localUrl = `http://localhost:${port}/consultation`;
  const lanUrl = `http://${candidate.address}:${port}/consultation`;
  try {
    const [localStatus] = await waitForPreview([localUrl]);
    console.log(`OOXME verified Local preview (${localStatus}): ${localUrl}`);
  } catch (error) {
    if (!child.killed) child.kill();
    throw error;
  }
  try {
    const [lanStatus] = await waitForPreview([lanUrl]);
    console.log(`OOXME verified LAN preview (${candidate.name}, ${lanStatus}): ${lanUrl}`);
  } catch (error) {
    console.warn(`OOXME LAN preview bound but self-check was unavailable: ${lanUrl} (${error.code || error.message})`);
  }
  await new Promise((resolve, reject) => {
    child.once('exit', (code, signal) => reject(new Error(`preview_server_exit_${code ?? signal}`)));
  });
};

main().catch((error) => {
  console.error(`OOXME preview failed: ${error.message}`);
  process.exitCode = 1;
});
