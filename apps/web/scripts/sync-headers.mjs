import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { renderCloudflareHeadersFile } from '../security-headers.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const targetPath = path.resolve(__dirname, '../public/_headers');
const expected = renderCloudflareHeadersFile();
const isCheck = process.argv.includes('--check');

if (isCheck) {
  const current = fs.existsSync(targetPath) ? fs.readFileSync(targetPath, 'utf8') : '';
  if (current !== expected) {
    console.error(
      'Error: apps/web/public/_headers is out of sync with apps/web/security-headers.mjs.\nRun: pnpm --filter web sync:headers'
    );
    process.exit(1);
  }
  console.log('public/_headers is in sync with security-headers.mjs');
} else {
  fs.writeFileSync(targetPath, expected, 'utf8');
  console.log('Updated apps/web/public/_headers from security-headers.mjs');
}
