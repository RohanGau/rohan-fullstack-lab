import type { Express } from 'express';
import { createApp } from '../../src/app';
import { resolveRuntimeConfig } from '../../src/config/runtime';

/** Builds the real application (full middleware stack), not a hand-rolled copy. */
export function buildTestApp(env: NodeJS.ProcessEnv = process.env): Express {
  return createApp(resolveRuntimeConfig(env), env);
}
