import { Router } from 'express';
import { healthRouter } from './health.routes.js';
import { cronRouter } from './cron.routes.js';
import { dashboardRouter } from './dashboard.routes.js';
import { responseRouter } from './response.routes.js';
import { telegramWebhookRouter } from './telegram-webhook.routes.js';

export const apiRouter = Router();

apiRouter.use('/health', healthRouter);
apiRouter.use('/cron', cronRouter);
apiRouter.use('/dashboard', dashboardRouter);
apiRouter.use('/response', responseRouter);
apiRouter.use('/telegram', telegramWebhookRouter);
