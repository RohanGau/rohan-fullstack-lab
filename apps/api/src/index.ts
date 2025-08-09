/// <reference path="./types/express/index.d.ts" />
import process from 'process';
import swaggerUi from 'swagger-ui-express';
import dotenv from 'dotenv';
import path from 'path';
import { rateLimit, RateLimitRequestHandler } from 'express-rate-limit';
import helmet from 'helmet';
import express from 'express';
import todoRoutes from './routes/todoRoutes';
import blogRoutes from './routes/blogRoutes';
import contactRoutes from './routes/contactRoutes';
import profileRoutes from './routes/profileRoutes';
import projectRoutes from './routes/projectRoutes';
import uploadRoutes from './routes/uploadRoutes';
import cors from 'cors';
import { connectDB } from './db';
import { globalErrorHandler, jsonErrorHandler } from './utils';
import logger from './utils/logger';
import swaggerSpec from './swagger/swagger';
import { allowedOrigins } from './utils/constant';

const env = process.env.NODE_ENV || 'development';
const envFile = env === 'development' ? '.env' : `.env.${env}`;

logger.info(`🌍 Loading environment variables from: ${envFile}`);

// This will load .env, .env.stage, or .env.production
dotenv.config({ path: path.resolve(process.cwd(), envFile) });

logger.info(`🌍 rate limit: ${process.env.RATE_LIMIT_WINDOW_MS}`);

const app = express();
const PORT = process.env.PORT || 5050;

app.use((req, res, next) => {
  const origin = req.headers.origin;
  logger.info(`🌍 Received Origin: ${origin}`);
  next();
});

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl)
      if (!origin) return callback(null, true);
      logger.info(`🌍 allowedOrigins: ${allowedOrigins}`);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error('Not allowed by CORS'), false);
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Range'],
    exposedHeaders: ['X-Total-Count', 'Content-Range'],
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

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, { explorer: true }));
app.use('/api/todos', todoRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/profiles', profileRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/uploads', uploadRoutes);

app.use(globalErrorHandler);

app.use(helmet());

const limiter: RateLimitRequestHandler = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
  max: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
});

app.use(limiter as unknown as express.RequestHandler);

connectDB();

app
  .listen(PORT, () => {
    logger.info(`✅ Server running at http://localhost:${PORT}`);
  })
  .on('error', (err) => {
    logger.error({ err }, '❌ Server failed to start');
  });
