import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

function loadIfExists(filePath: string) {
  if (!fs.existsSync(filePath)) return;
  dotenv.config({ path: filePath, override: false });
}

export function loadMcpEnv(): void {
  const srcDir = path.dirname(fileURLToPath(import.meta.url));
  const appDir = path.resolve(srcDir, '..');
  const repoRoot = path.resolve(appDir, '..', '..');
  const apiDir = path.resolve(repoRoot, 'apps', 'api');

  // Priority (first value wins because override=false):
  // 1) MCP-local overrides
  // 2) API app env (for local reuse of ADMIN_TOKEN/JWT values)
  // 3) repo root env
  loadIfExists(path.join(appDir, '.env.local'));
  loadIfExists(path.join(appDir, '.env'));
  loadIfExists(path.join(apiDir, '.env.local'));
  loadIfExists(path.join(apiDir, '.env'));
  loadIfExists(path.join(repoRoot, '.env.local'));
  loadIfExists(path.join(repoRoot, '.env'));
}
