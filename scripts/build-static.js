const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const sourceRoot = root;
const output = path.join(root, 'dist');
const directories = ['assets', 'css', 'js', 'public'];
const rootFiles = ['favicon.svg', 'site.webmanifest'];
const pageOutputs = { 'index.html': 'index.html', 'studio.html': 'brands.html', 'selected-works.html': 'gallery.html', 'brand-management-new.html': 'brand.html', 'consultation.html': 'consultation.html', 'x.html': 'x.html', 'z.html': 'z.html' };

if (!fs.existsSync(sourceRoot)) {
  throw new Error('Expected website source directory is missing.');
}

fs.rmSync(output, { recursive: true, force: true });
fs.mkdirSync(output, { recursive: true });

for (const name of fs.readdirSync(sourceRoot)) {
  if (pageOutputs[name]) {
    const source = fs.readFileSync(path.join(sourceRoot, name), 'utf8');
    const isStandalonePreview = name === 'x.html' || name === 'z.html';
    const sharedTypography = '<script src="js/arabic-typography.js" defer></script>';
    const sharedNumericTypography = '<script src="js/numeric-typography.js" defer></script>';
    const pageWithTypography = isStandalonePreview || source.includes(sharedTypography) ? source : source.replace('</head>', sharedTypography + '</head>');
    const page = isStandalonePreview || pageWithTypography.includes(sharedNumericTypography) ? pageWithTypography : pageWithTypography.replace('</head>', sharedNumericTypography + '</head>');
    fs.writeFileSync(path.join(output, pageOutputs[name]), page);
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
