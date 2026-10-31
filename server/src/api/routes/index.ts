import { Router } from 'express';
import { healthRouter } from './health.routes.js';
import { queryRouter } from './query.routes.js';

export const apiRouter = Router();

apiRouter.use('/health', healthRouter);
apiRouter.use('/query', queryRouter);
