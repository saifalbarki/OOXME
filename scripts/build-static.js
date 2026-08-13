const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const sourceRoot = root;
const output = path.join(root, 'dist');
const directories = ['assets', 'css', 'js', 'public'];

if (!fs.existsSync(sourceRoot)) {
  throw new Error('Expected website source directory is missing.');
}

fs.rmSync(output, { recursive: true, force: true });
fs.mkdirSync(output, { recursive: true });

for (const name of fs.readdirSync(sourceRoot)) {
  if (name.endsWith('.html')) {
    fs.copyFileSync(path.join(sourceRoot, name), path.join(output, name));
  }
}

for (const name of directories) {
  const source = path.join(sourceRoot, name);
  if (fs.existsSync(source)) {
    fs.cpSync(source, path.join(output, name), { recursive: true });
  }
}

console.log('Static deployment files created in dist.');
