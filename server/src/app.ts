import express, { Express } from 'express';
import cors from 'cors';
import { requestLogger } from './api/middleware/logger.middleware.js';
import { errorHandler } from './api/middleware/error.middleware.js';
import { apiRouter } from './api/routes/index.js';
import { getHealth } from './api/controllers/health.controller.js';

export function createApp(): Express {
  const app = express();

  // Core middlewares
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(requestLogger);

  // Root health endpoint (as required by specification: GET /health)
  app.get('/health', getHealth);

  // Sub-routes under /api
  app.use('/api', apiRouter);

  // Global error handler
  app.use(errorHandler);

  return app;
}
