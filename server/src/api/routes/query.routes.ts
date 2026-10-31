import { Router } from 'express';
import { handleQuery } from '../controllers/query.controller.js';

export const queryRouter = Router();

// POST /api/query
queryRouter.post('/', handleQuery);
