const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const png = fs.readFileSync(path.join(root, 'favicon-32x32.png'));
if (png.readUInt32BE(16) !== 32 || png.readUInt32BE(20) !== 32) throw new Error('favicon-32x32.png must be 32x32');

// ICO permits a PNG payload, but still requires a real ICO directory header.
const header = Buffer.alloc(22);
header.writeUInt16LE(0, 0);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(1, 4);
header.writeUInt8(32, 6);
header.writeUInt8(32, 7);
header.writeUInt8(0, 8);
header.writeUInt8(0, 9);
header.writeUInt16LE(1, 10);
header.writeUInt16LE(32, 12);
header.writeUInt32LE(png.length, 14);
header.writeUInt32LE(header.length, 18);
const ico = Buffer.concat([header, png]);
for (const destination of ['favicon.ico', path.join('public', 'favicon.ico')]) fs.writeFileSync(path.join(root, destination), ico);
console.log(`Generated valid 32x32 ICO favicon (${ico.length} bytes).`);
