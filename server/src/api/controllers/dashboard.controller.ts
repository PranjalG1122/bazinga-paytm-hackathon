import { Request, Response, NextFunction } from 'express';
import { successResponse } from '../../utils/response.js';
import { getMockDatabaseData } from '../../data/data.service.js';

/**
 * Dashboard API:
 * Returns overview statistics, priority tiers, ticket root causes,
 * and merchant tickets loaded from the mock dataset (server/src/data/data.json).
 */
export async function getDashboardData(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const data = getMockDatabaseData();
    res.status(200).json(successResponse(data));
  } catch (error) {
    next(error);
  }
}
