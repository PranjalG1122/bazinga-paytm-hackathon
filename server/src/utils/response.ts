import { ApiSuccessResponse, ApiErrorResponse } from '../types/index.js';

export function successResponse<T>(data: T): ApiSuccessResponse<T> {
  return {
    success: true,
    data,
    timestamp: new Date().toISOString(),
  };
}

export function errorResponse(message: string, code?: string, details?: unknown): ApiErrorResponse {
  return {
    success: false,
    error: {
      message,
      code,
      details,
    },
    timestamp: new Date().toISOString(),
  };
}
