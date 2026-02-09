import process from 'process';
import http from 'http';
import type { Express } from 'express';
import mongoose from 'mongoose';
import { connectDB } from './db';
import logger from './utils/logger';
import { flushSentry } from './utils/sentry';

export async function startHttpServer(app: Express, port: number): Promise<http.Server> {
  await connectDB();

  return await new Promise<http.Server>((resolve, reject) => {
    const server = app.listen(port, () => {
      logger.info(`✅ Server running at http://localhost:${port}`);
      logger.info(`📚 API Docs: http://localhost:${port}/api-docs`);
      logger.info(`🏥 Health: http://localhost:${port}/health`);
      resolve(server);
    });

    server.on('error', (err) => {
      logger.error({ err }, '❌ Server failed to start');
      reject(err);
    });
  });
}

export function registerGracefulShutdown(server: http.Server, timeoutMs = 30_000): void {
  const gracefulShutdown = async (signal: string) => {
    logger.info(`${signal} received. Starting graceful shutdown...`);

    server.close(() => {
      logger.info('HTTP server closed');
    });

    const forceShutdownTimeout = setTimeout(() => {
      logger.warn('Forcing shutdown after timeout');
      process.exit(1);
    }, timeoutMs);

    try {
      await flushSentry(2000);
      logger.info('Sentry events flushed');

      await mongoose.connection.close();
      logger.info('MongoDB connection closed');

      clearTimeout(forceShutdownTimeout);
      logger.info('Graceful shutdown completed');
      process.exit(0);
    } catch (error) {
      logger.error({ error }, 'Error during shutdown');
      process.exit(1);
    }
  };

  process.on('SIGTERM', () => void gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => void gracefulShutdown('SIGINT'));
}
