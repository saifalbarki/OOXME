const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const sourceRoot = root;
const output = path.join(root, 'dist');
const directories = ['assets', 'css', 'js', 'public'];
const rootFiles = ['favicon.svg', 'favicon.ico', 'favicon-16x16.png', 'favicon-32x32.png', 'apple-touch-icon.png', 'site.webmanifest'];
const pageOutputs = {
  'main.html': 'index.html',
  'brand.html': 'bm.html',
  'space.html': 'space.html',
  'update.html': 'update.html',
  'consultation.html': 'consultation.html',
  'store.html': 'store.html',
  'os.html': 'os.html'
};
const analyticsSnippet = `
    <!-- Vercel Web Analytics: official static HTML integration -->
    <script>
      window.va = window.va || function () { (window.vaq = window.vaq || []).push(arguments); };
    </script>
    <script defer src="/_vercel/insights/script.js"></script>`;

if (!fs.existsSync(sourceRoot)) {
  throw new Error('Expected website source directory is missing.');
}

fs.rmSync(output, { recursive: true, force: true });
fs.mkdirSync(output, { recursive: true });

for (const name of fs.readdirSync(sourceRoot)) {
  if (pageOutputs[name]) {
    const source = fs.readFileSync(path.join(sourceRoot, name), 'utf8');
    const destination = source.includes('/_vercel/insights/script.js')
      ? source
      : source.replace('</head>', `${analyticsSnippet}\n  </head>`);
    if (destination === source && !source.includes('/_vercel/insights/script.js')) {
      throw new Error(`Unable to add Vercel Web Analytics to ${name}: </head> was not found.`);
    }
    fs.writeFileSync(path.join(output, pageOutputs[name]), destination);
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
