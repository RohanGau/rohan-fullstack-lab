/**
 * Test App Instance
 * Creates an Express app for testing without starting the server
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import healthRoutes from '../src/routes/healthRoutes';
import blogRoutes from '../src/routes/blogRoutes';
import projectRoutes from '../src/routes/projectRoutes';
import profileRoutes from '../src/routes/profileRoutes';
import contactRoutes from '../src/routes/contactRoutes';
import { globalErrorHandler, jsonErrorHandler } from '../src/utils';

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(jsonErrorHandler);

// Routes
app.use('/health', healthRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/profiles', profileRoutes);
app.use('/api/contact', contactRoutes);

// Root endpoint
app.get('/', (_, res) => {
  res.json({ status: 'ok', message: 'Test server' });
});

// Error handler
app.use(globalErrorHandler);

export default app;
