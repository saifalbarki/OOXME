const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const sourceRoot = root;
const output = path.join(root, 'dist');
const directories = ['assets', 'css', 'js', 'public'];
const rootFiles = ['favicon.svg', 'site.webmanifest'];

if (!fs.existsSync(sourceRoot)) {
  throw new Error('Expected website source directory is missing.');
}

fs.rmSync(output, { recursive: true, force: true });
fs.mkdirSync(output, { recursive: true });

for (const name of fs.readdirSync(sourceRoot)) {
  if (name.endsWith('.html')) {
    const source = fs.readFileSync(path.join(sourceRoot, name), 'utf8');
    const sharedTypography = '<script src="js/arabic-typography.js" defer></script>';
    const page = source.includes(sharedTypography) ? source : source.replace('</head>', sharedTypography + '</head>');
    fs.writeFileSync(path.join(output, name), page);
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
