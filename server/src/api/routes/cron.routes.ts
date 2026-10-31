import { Router } from 'express';
import { runDormancyCron } from '../controllers/cron.controller.js';

export const cronRouter = Router();

// POST /api/cron/run
cronRouter.post('/run', runDormancyCron);
