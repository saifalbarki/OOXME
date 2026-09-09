const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const sourceRoot = root;
const output = path.join(root, 'dist');
const directories = ['assets', 'css', 'js', 'public'];
const rootFiles = ['favicon.svg', 'site.webmanifest'];
const pageOutputs = { 'main.html': 'index.html', 'brand.html': 'bm.html', 'rpn.html': 'rpn.html', 'update.html': 'update.html', 'consultation.html': 'consultation.html', 'store.html': 'store.html' };

if (!fs.existsSync(sourceRoot)) {
  throw new Error('Expected website source directory is missing.');
}

fs.rmSync(output, { recursive: true, force: true });
fs.mkdirSync(output, { recursive: true });

for (const name of fs.readdirSync(sourceRoot)) {
  if (pageOutputs[name]) {
    fs.copyFileSync(path.join(sourceRoot, name), path.join(output, pageOutputs[name]));
  }
}

for (const name of directories) {
  const source = path.join(sourceRoot, name);
  if (fs.existsSync(source)) {
    fs.cpSync(source, path.join(output, name), { recursive: true });
  }
}

for (const name of rootFiles) {
  const source = path.join(sourceRoot, name);
  if (fs.existsSync(source)) fs.copyFileSync(source, path.join(output, name));
}

console.log('Static deployment files created in dist.');
