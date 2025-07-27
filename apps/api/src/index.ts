/// <reference path="./types/express/index.d.ts" />
import process from 'process';
import swaggerUi from 'swagger-ui-express';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import express from 'express';
import todoRoutes from './routes/todoRoutes';
import cors from 'cors';
import { connectDB } from './db';
import { ERROR_MESSAGES, jsonErrorHandler } from './utils';
import logger from './utils/logger';
import swaggerSpec from './swagger/swagger';

const envFile = process.env.NODE_ENV ? `.env.${process.env.NODE_ENV}` : '.env';
dotenv.config({ path: envFile });

const app = express();
const PORT = process.env.PORT || 5050;

app.use(
  cors({
    origin: process.env.FRONTEND_ORIGIN || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(express.json());

app.use(jsonErrorHandler);
app.get('/', (_, res) => {
  res.send('Server is working');
});

app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/api/todos', todoRoutes);

app.use((err: any, req: express.Request, res: express.Response) => {
  logger.error({ err }, 'Global error :');
  const status = err.status || 500;
  res.status(status).json({
    error: err.message || ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
  });
});

app.use(helmet());
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});

app.use(limiter);

connectDB();

app
  .listen(PORT, () => {
    logger.info(`✅ Server running at http://localhost:${PORT}`);
  })
  .on('error', (err) => {
    logger.error({ err }, '❌ Server failed to start');
  });
