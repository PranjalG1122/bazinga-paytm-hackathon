import { Router } from 'express';
import { healthRouter } from './health.routes.js';
import { queryRouter } from './query.routes.js';
import { messagesRouter } from './messages.routes.js';
import { sendMessage } from '../controllers/telegram.controller.js';

export const apiRouter = Router();

apiRouter.use('/health', healthRouter);
apiRouter.use('/query', queryRouter);
apiRouter.use('/messages', messagesRouter);
apiRouter.post('/send', sendMessage);
