/// <reference path="./types/express/index.d.ts" />
import process from 'process';
import swaggerUi from 'swagger-ui-express';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import express from 'express';
import todoRoutes from './routes/todoRoutes';
import blogRoutes from './routes/blogRoutes';
import profileRoutes from './routes/profileRoutes';
import cors from 'cors';
import { connectDB } from './db';
import { globalErrorHandler, jsonErrorHandler } from './utils';
import logger from './utils/logger';
import swaggerSpec from './swagger/swagger';
import { allowedOrigins } from './utils/constant';

const envFile = process.env.NODE_ENV ? `.env.${process.env.NODE_ENV}` : '.env';
dotenv.config({ path: envFile });

const app = express();
const PORT = process.env.PORT || 5050;

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl)
      if (!origin) return callback(null, true);
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

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/api/todos', todoRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/profiles', profileRoutes);

app.use(globalErrorHandler);

app.use(helmet());

const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
  max: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
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
