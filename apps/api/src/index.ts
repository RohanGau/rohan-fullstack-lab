/// <reference path="./types/express/index.d.ts" />
import process from 'process';
import dotenv from 'dotenv';
import path from 'path';
import logger from './utils/logger';
import { initSentry } from './utils/sentry';
import { resolveRuntimeConfig } from './config/runtime';

async function bootstrap(): Promise<void> {
  const env = process.env.NODE_ENV || 'development';
  const envFile = env === 'development' ? '.env' : `.env.${env}`;

  logger.info(`🌍 Loading environment variables from: ${envFile}`);
  dotenv.config({ path: path.resolve(process.cwd(), envFile) });

  initSentry();

  const runtimeConfig = resolveRuntimeConfig();
  const [{ createApp }, { startHttpServer, registerGracefulShutdown }] = await Promise.all([
    import('./app'),
    import('./server'),
  ]);

  const app = createApp(runtimeConfig);
  const server = await startHttpServer(app, runtimeConfig.port);
  registerGracefulShutdown(server);
}

bootstrap().catch((error) => {
  logger.error({ error }, '❌ Server failed to bootstrap');
  process.exit(1);
});
