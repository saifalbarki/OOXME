const http = require('http');
const fs = require('fs');
const os = require('os');
const path = require('path');

const root = __dirname;
const pageRoutes = {
  '/': 'main.html',
  '/bm': 'brand.html',
  '/rpn': 'rpn.html',
  '/update': 'update.html',
  '/consultation': 'consultation.html',
  '/store': 'store.html'
  ,'/os': 'os.html'
};
const publicRoots = ['assets', 'css', 'js', 'public'];
const publicRootFiles = new Set(['favicon.svg', 'site.webmanifest']);
const types = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.otf': 'font/otf',
  '.ttf': 'font/ttf',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2'
};

const send = (response, status, type, body) => {
  response.writeHead(status, { 'Content-Type': type, 'Cache-Control': 'no-cache' });
  response.end(body);
};

const server = http.createServer((request, response) => {
  const requestUrl = new URL(request.url || '/', 'http://localhost');
  const requestPath = decodeURIComponent(requestUrl.pathname);
  const page = pageRoutes[requestPath];

  let relative = page;
  if (!relative) {
    const cleanPath = requestPath.replace(/^\/+/, '');
    const firstSegment = cleanPath.split('/')[0];
    if (!publicRoots.includes(firstSegment) && !publicRootFiles.has(cleanPath)) {
      send(response, 404, 'text/plain; charset=utf-8', 'Not found');
      return;
    }
    relative = cleanPath;
  }

  const target = path.resolve(root, relative);
  if (!target.startsWith(`${root}${path.sep}`)) {
    send(response, 403, 'text/plain; charset=utf-8', 'Forbidden');
    return;
  }

  fs.readFile(target, (error, content) => {
    if (error) {
      send(response, 404, 'text/plain; charset=utf-8', 'Not found');
      return;
    }
    send(response, 200, types[path.extname(target).toLowerCase()] || 'application/octet-stream', content);
  });
});

const port = Number(process.env.PORT || 3000);
const activeLanIpv4 = () => Object.values(os.networkInterfaces())
  .flat()
  .find((address) => address && address.family === 'IPv4' && !address.internal)?.address;

server.listen(port, '0.0.0.0', () => {
  const lanAddress = activeLanIpv4();
  console.log(`OOXME static preview: http://localhost:${port}`);
  if (lanAddress) console.log(`OOXME LAN preview: http://${lanAddress}:${port}`);
});
