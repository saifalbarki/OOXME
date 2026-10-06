const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const sourceRoot = root;
const output = path.join(root, 'dist');
const directories = ['assets', 'css', 'js', 'public'];
const deploymentOnlyExclusions = [
  'assets/fonts/PlayfairDisplay-BoldItalic.ttf',
  'assets/fonts/PlusJakartaSans-VariableFont_wght.ttf',
  'assets/fonts/SFPRODISPLAYBOLD.OTF',
  'assets/fonts/SFPRODISPLAYREGULAR.OTF',
  'assets/fonts/TRYToshB-wght-BF677df27a71b87.ttf',
  'assets/logo/Favicon.png'
];
const rootFiles = ['favicon.svg', 'favicon.ico', 'favicon-16x16.png', 'favicon-32x32.png', 'favicon-192x192.png', 'favicon-512x512.png', 'apple-touch-icon.png', 'site.webmanifest', 'robots.txt', 'sitemap.xml'];
const pageOutputs = {
  'main.html': 'index.html',
  'brand.html': 'bm.html',
  'gallery.html': 'gallery.html',
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
const assetVersion = process.env.VERCEL_GIT_COMMIT_SHA || process.env.GIT_COMMIT_SHA || '';
const versionStaticReferences = (html) => assetVersion
  ? html.replace(/((?:href|src)="\/?(?:css|js|assets\/(?:fonts|projects))\/[^"?]+)"/g, `$1?v=${assetVersion}"`)
  : html;

const readPngDimensions = (filePath) => {
  const header = fs.readFileSync(filePath).subarray(16, 24);
  return { width: header.readUInt32BE(0), height: header.readUInt32BE(4) };
};

const writeProjectManifest = (projectPath) => {
  const assets = fs.readdirSync(projectPath)
    .filter((name) => /^\d+\.png$/i.test(name))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
    .map((name) => {
      const formats = {};
      ['avif', 'webp'].forEach((extension) => {
        const candidate = `${name.slice(0, -4)}.${extension}`;
        if (fs.existsSync(path.join(projectPath, candidate))) formats[extension] = candidate;
      });
      return { name, ...readPngDimensions(path.join(projectPath, name)), ...(Object.keys(formats).length ? { formats } : {}) };
    });
  fs.writeFileSync(path.join(projectPath, 'manifest.json'), `${JSON.stringify({ project: path.basename(projectPath), assets }, null, 2)}\n`);
};

if (!fs.existsSync(sourceRoot)) {
  throw new Error('Expected website source directory is missing.');
}

const projectsRoot = path.join(sourceRoot, 'assets', 'projects');
fs.readdirSync(projectsRoot, { withFileTypes: true })
  .filter((entry) => entry.isDirectory() && fs.readdirSync(path.join(projectsRoot, entry.name)).some((name) => /^\d+\.png$/i.test(name)))
  .forEach((entry) => writeProjectManifest(path.join(projectsRoot, entry.name)));

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
    fs.writeFileSync(path.join(output, pageOutputs[name]), versionStaticReferences(destination));
  }
}

for (const name of directories) {
  const source = path.join(sourceRoot, name);
  if (fs.existsSync(source)) {
    fs.cpSync(source, path.join(output, name), { recursive: true });
  }
}

for (const relative of deploymentOnlyExclusions) {
  fs.rmSync(path.join(output, relative), { force: true });
}

if (assetVersion) {
  const cssRoot = path.join(output, 'css');
  for (const name of fs.readdirSync(cssRoot).filter((file) => file.endsWith('.css'))) {
    const filePath = path.join(cssRoot, name);
    const source = fs.readFileSync(filePath, 'utf8');
    const versioned = source
      .replace(/(url\(['"]?\.\.\/assets\/fonts\/[^)'"?]+)(['"]?\))/g, `$1?v=${assetVersion}$2`)
      .replace(/(url\(['"]?\.\/[^)'"?]+\.css)(['"]?\))/g, `$1?v=${assetVersion}$2`);
    fs.writeFileSync(filePath, versioned);
  }
}

for (const name of rootFiles) {
  const source = path.join(sourceRoot, name);
  if (fs.existsSync(source)) fs.copyFileSync(source, path.join(output, name));
}

console.log('Static deployment files created in dist.');
