export interface ApiSuccessResponse<T = unknown> {
  success: true;
  data: T;
  timestamp: string;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    message: string;
    code?: string;
    details?: unknown;
  };
  timestamp: string;
}
