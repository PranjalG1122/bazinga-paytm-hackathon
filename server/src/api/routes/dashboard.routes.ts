import { Router } from 'express';
import { getDashboardData } from '../controllers/dashboard.controller.js';

export const dashboardRouter = Router();

// GET /api/dashboard
dashboardRouter.get('/', getDashboardData);
