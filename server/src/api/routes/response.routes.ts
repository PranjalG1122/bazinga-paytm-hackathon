import { Router } from 'express';
import { handleResponse } from '../controllers/response.controller.js';

export const responseRouter = Router();

// POST /api/response
responseRouter.post('/', handleResponse);
