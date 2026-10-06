const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const root = path.resolve(__dirname, '..');

const crc32 = (buffer) => {
  let crc = 0xffffffff;
  for (const byte of buffer) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit += 1) crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
  }
  return (crc ^ 0xffffffff) >>> 0;
};

const chunk = (type, data) => {
  const name = Buffer.from(type);
  const body = Buffer.concat([name, data]);
  const output = Buffer.alloc(12 + data.length);
  output.writeUInt32BE(data.length, 0);
  body.copy(output, 4);
  output.writeUInt32BE(crc32(body), 8 + data.length);
  return output;
};

const sourceArtworkPng = (size) => {
  const supersample = 4;
  const rows = Buffer.alloc((size * 4 + 1) * size);
  const circleRadius = size * 0.375;
  const eyeRadius = size * (22.5 / 256);
  const eyeY = size * 0.5;
  const eyeXs = [size * (95 / 256), size * (161 / 256)];
  const colorAt = (x, y) => {
    const distance = Math.hypot(x - size / 2, y - size / 2);
    if (distance <= circleRadius) {
      if (eyeXs.some((eyeX) => Math.hypot(x - eyeX, y - eyeY) <= eyeRadius)) return [241, 243, 247, 255];
      return [16, 16, 16, 255];
    }
    return [0, 0, 0, 0];
  };
  for (let y = 0; y < size; y += 1) {
    const rowOffset = y * (size * 4 + 1);
    rows[rowOffset] = 0;
    for (let x = 0; x < size; x += 1) {
      const sums = [0, 0, 0, 0];
      for (let sy = 0; sy < supersample; sy += 1) for (let sx = 0; sx < supersample; sx += 1) {
        const color = colorAt(x + (sx + 0.5) / supersample, y + (sy + 0.5) / supersample);
        for (let channel = 0; channel < 4; channel += 1) sums[channel] += color[channel];
      }
      const pixelOffset = rowOffset + 1 + x * 4;
      for (let channel = 0; channel < 4; channel += 1) rows[pixelOffset + channel] = Math.round(sums[channel] / (supersample * supersample));
    }
  }
  const header = Buffer.alloc(13);
  header.writeUInt32BE(size, 0);
  header.writeUInt32BE(size, 4);
  header.writeUInt8(8, 8);
  header.writeUInt8(6, 9);
  header.writeUInt8(0, 10);
  header.writeUInt8(0, 11);
  header.writeUInt8(0, 12);
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', header), chunk('IDAT', zlib.deflateSync(rows, { level: 9 })), chunk('IEND', Buffer.alloc(0))]);
};

for (const [name, size] of [['favicon-16x16.png', 16], ['favicon-32x32.png', 32], ['favicon-192x192.png', 192], ['favicon-512x512.png', 512], ['apple-touch-icon.png', 180]]) {
  fs.writeFileSync(path.join(root, name), sourceArtworkPng(size));
}

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
