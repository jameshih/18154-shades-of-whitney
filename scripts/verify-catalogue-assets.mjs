import { createHash } from 'node:crypto';
import { readFile, stat } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { runInNewContext } from 'node:vm';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const catalogueDirectory = join(root, 'assets', 'catalogue');
const manifest = JSON.parse(
  await readFile(join(catalogueDirectory, 'manifest.json'), 'utf8'),
);

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function inspectJpeg(buffer) {
  assert(buffer[0] === 0xff && buffer[1] === 0xd8, 'Missing JPEG start marker');

  const startOfFrameMarkers = new Set([
    0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7,
    0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf,
  ]);
  let offset = 2;

  while (offset < buffer.length) {
    while (buffer[offset] === 0xff) {
      offset += 1;
    }

    const marker = buffer[offset];
    offset += 1;

    if (marker === 0xd9 || marker === 0xda) {
      break;
    }

    if (marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) {
      continue;
    }

    assert(offset + 1 < buffer.length, 'Truncated JPEG segment');
    const segmentLength = buffer.readUInt16BE(offset);
    assert(segmentLength >= 2, 'Invalid JPEG segment length');

    if (startOfFrameMarkers.has(marker)) {
      assert(segmentLength >= 8, 'Invalid JPEG start-of-frame segment');
      return {
        progressive: marker === 0xc2,
        height: buffer.readUInt16BE(offset + 3),
        width: buffer.readUInt16BE(offset + 5),
      };
    }

    offset += segmentLength;
  }

  throw new Error('JPEG start-of-frame marker not found');
}

function attribute(tag, name) {
  const match = tag.match(new RegExp(`\\b${name}="([^"]*)"`, 'i'));
  return match?.[1];
}

assert(manifest.schemaVersion === 1, 'Unsupported catalogue manifest schema');
assert(manifest.width === 7040, 'Unexpected catalogue width');
assert(manifest.height === 6804, 'Unexpected catalogue height');
assert(manifest.sheets.length === 6, 'Expected exactly six catalogue sheets');

let totalBytes = 0;

for (const sheet of manifest.sheets) {
  assert(sheet.filename === `${sheet.range}.jpg`, `Unexpected filename for ${sheet.range}`);

  const filePath = join(catalogueDirectory, sheet.filename);
  const fileStats = await stat(filePath);
  const buffer = await readFile(filePath);
  const digest = createHash('sha256').update(buffer).digest('hex');
  const jpeg = inspectJpeg(buffer);

  assert(fileStats.size === sheet.publishedBytes, `Byte count mismatch for ${sheet.filename}`);
  assert(digest === sheet.publishedSha256, `SHA-256 mismatch for ${sheet.filename}`);
  assert(jpeg.width === manifest.width, `Width mismatch for ${sheet.filename}`);
  assert(jpeg.height === manifest.height, `Height mismatch for ${sheet.filename}`);
  assert(jpeg.progressive, `${sheet.filename} is not a progressive JPEG`);
  totalBytes += fileStats.size;
}

const indexHtml = await readFile(join(root, 'index.html'), 'utf8');
const catalogueTags = [...indexHtml.matchAll(/<img\b[^>]*>/gi)]
  .map(([tag]) => tag)
  .filter((tag) => attribute(tag, 'src')?.startsWith('./assets/catalogue/'));

assert(catalogueTags.length === manifest.sheets.length, 'Catalogue image count does not match manifest');

for (const [index, sheet] of manifest.sheets.entries()) {
  const tag = catalogueTags[index];
  const isFirst = index === 0;

  assert(attribute(tag, 'src') === `./assets/catalogue/${sheet.filename}`, `Image order mismatch for ${sheet.filename}`);
  assert(attribute(tag, 'alt') === sheet.range, `Alt text mismatch for ${sheet.filename}`);
  assert(Number(attribute(tag, 'width')) === manifest.width, `HTML width mismatch for ${sheet.filename}`);
  assert(Number(attribute(tag, 'height')) === manifest.height, `HTML height mismatch for ${sheet.filename}`);
  assert(attribute(tag, 'decoding') === 'async', `Missing async decoding for ${sheet.filename}`);
  assert(attribute(tag, 'loading') === (isFirst ? 'eager' : 'lazy'), `Loading policy mismatch for ${sheet.filename}`);
  assert(attribute(tag, 'fetchpriority') === (isFirst ? 'high' : 'low'), `Fetch priority mismatch for ${sheet.filename}`);
}

for (const forbidden of ['staticflickr.com', 'embedr.flickr.com', 'data-src=']) {
  assert(!indexHtml.includes(forbidden), `Runtime Flickr loader remains in index.html: ${forbidden}`);
}

const dataSource = await readFile(join(root, 'data.js'), 'utf8');
const dataContext = {};
runInNewContext(dataSource, dataContext);
assert(Array.isArray(dataContext.data), 'data.js did not define the artwork array');
assert(dataContext.data.length === 18154, `Expected 18,154 artwork entries, found ${dataContext.data.length}`);

console.log(
  `Verified ${manifest.sheets.length} progressive catalogue sheets (${(totalBytes / 1024 / 1024).toFixed(2)} MiB) and ${dataContext.data.length.toLocaleString('en-US')} artwork entries.`,
);
