import { Request, Response, NextFunction } from 'express';
import { errorResponse } from '../../utils/response.js';

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  console.error('[Unhandled Error]', err);

  const statusCode = res.statusCode >= 400 ? res.statusCode : 500;
  res.status(statusCode).json(errorResponse(err.message || 'Internal Server Error'));
}
