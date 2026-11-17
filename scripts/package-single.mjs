import fs from 'node:fs';
import path from 'node:path';

const source = path.resolve('dist-single/index.html');
const target = path.resolve('clipframes.html');
const html = fs.readFileSync(source, 'utf8');

const localRef = /<(?:script|link|img|video|source|audio)[^>]+(?:src|href)="(?!https?:|data:|#)/i;
if (localRef.test(html)) {
  console.error('Standalone build still references local files.');
  process.exit(1);
}

fs.writeFileSync(target, html);
const mb = (Buffer.byteLength(html) / (1024 * 1024)).toFixed(1);
console.log(`clipframes.html written (${mb} MB) — double-click to open.`);
