'use strict';
/**
 * Test App Instance
 * Creates an Express app for testing without starting the server
 */
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
const express_1 = __importDefault(require('express'));
const cors_1 = __importDefault(require('cors'));
const helmet_1 = __importDefault(require('helmet'));
const healthRoutes_1 = __importDefault(require('../src/routes/healthRoutes'));
const blogRoutes_1 = __importDefault(require('../src/routes/blogRoutes'));
const projectRoutes_1 = __importDefault(require('../src/routes/projectRoutes'));
const profileRoutes_1 = __importDefault(require('../src/routes/profileRoutes'));
const contactRoutes_1 = __importDefault(require('../src/routes/contactRoutes'));
const utils_1 = require('../src/utils');
const app = (0, express_1.default)();
// Middleware
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)());
app.use(express_1.default.json({ limit: '1mb' }));
app.use(utils_1.jsonErrorHandler);
// Routes
app.use('/health', healthRoutes_1.default);
app.use('/api/blogs', blogRoutes_1.default);
app.use('/api/projects', projectRoutes_1.default);
app.use('/api/profiles', profileRoutes_1.default);
app.use('/api/contact', contactRoutes_1.default);
// Root endpoint
app.get('/', (_, res) => {
  res.json({ status: 'ok', message: 'Test server' });
});
// Error handler
app.use(utils_1.globalErrorHandler);
exports.default = app;
