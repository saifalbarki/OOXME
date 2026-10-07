const http = require('http');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const port = Number(process.env.PORT || 3000);
const routes = {
  '/': 'main.html',
  '/bm': 'brand.html',
  '/gallery': 'gallery.html',
  '/space': 'space.html',
  '/update': 'update.html',
  '/consultation': 'consultation.html',
  '/store': 'store.html',
  '/os': 'os.html'
};
const mime = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'application/javascript; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.ico': 'image/x-icon', '.json': 'application/json; charset=utf-8', '.webmanifest': 'application/manifest+json; charset=utf-8' };

const server = http.createServer((req, res) => {
  const pathname = new URL(req.url, 'http://localhost').pathname;
  const relative = routes[pathname] || pathname.replace(/^\//, '');
  const file = path.resolve(root, relative);
  const publicRoot = ['assets', 'css', 'js', 'public'].some((dir) => file.startsWith(path.join(root, dir) + path.sep));
const publicRootFiles = new Set(['main.html', 'brand.html', 'gallery.html', 'space.html', 'update.html', 'consultation.html', 'store.html', 'os.html', 'site.webmanifest', 'os.webmanifest', 'favicon.ico', 'favicon.svg', 'favicon-16x16.png', 'favicon-32x32.png', 'favicon-192x192.png', 'favicon-512x512.png', 'apple-touch-icon.png']);
  const publicFile = file.startsWith(root + path.sep) && publicRootFiles.has(path.basename(file));
  if (!file.startsWith(root) || (!publicRoot && !publicFile) || /(^|[\\/])\.(env|git)/i.test(file) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
    res.writeHead(404); res.end('Not found'); return;
  }
  res.writeHead(200, { 'Content-Type': mime[path.extname(file).toLowerCase()] || 'application/octet-stream' });
  fs.createReadStream(file).pipe(res);
});
server.listen(port, '0.0.0.0', () => console.log(`OOXME LAN preview: http://192.168.0.105:${port}/`));
