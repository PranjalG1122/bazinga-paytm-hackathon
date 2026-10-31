import { Request, Response, NextFunction } from 'express';
import { errorResponse } from '../../utils/response.js';
import { AppError } from '../../utils/errors.js';
import { config } from '../../config/env.js';

export function errorHandler(
  err: Error | AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  // Operational errors created via custom AppError subclasses
  if (err instanceof AppError) {
    console.error(`[AppError: ${err.name}] [${err.code}] ${err.message}`, err.details ?? '');
    res.status(err.statusCode).json(errorResponse(err.message, err.code, err.details));
    return;
  }

  // SyntaxError from malformed JSON payloads (express.json)
  if (err instanceof SyntaxError && 'status' in err && (err as { status: unknown }).status === 400) {
    console.error('[Malformed JSON Error]', err.message);
    res.status(400).json(errorResponse('Malformed JSON in request body', 'MALFORMED_JSON'));
    return;
  }

  // Unexpected / unhandled generic runtime errors
  console.error('[Unhandled System Error]', err);

  const statusCode = res.statusCode >= 400 ? res.statusCode : 500;
  const isDev = config.nodeEnv === 'development';

  res.status(statusCode).json(
    errorResponse(
      isDev ? err.message || 'Internal Server Error' : 'An unexpected error occurred.',
      'INTERNAL_SERVER_ERROR',
      isDev ? { stack: err.stack } : undefined
    )
  );
}

