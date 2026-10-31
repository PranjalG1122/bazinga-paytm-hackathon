/**
 * Base Application Error class for operational errors.
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly isOperational: boolean;
  public readonly details?: unknown;

  constructor(
    message: string,
    statusCode = 500,
    code = 'INTERNAL_SERVER_ERROR',
    details?: unknown,
    isOperational = true
  ) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.isOperational = isOperational;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * 400 Bad Request
 */
export class BadRequestError extends AppError {
  constructor(message = 'Bad Request', code = 'BAD_REQUEST', details?: unknown) {
    super(message, 400, code, details);
  }
}

/**
 * 400 Validation Error
 */
export class ValidationError extends AppError {
  constructor(message = 'Validation Failed', details?: unknown) {
    super(message, 400, 'VALIDATION_ERROR', details);
  }
}

/**
 * 401 Unauthorized
 */
export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized', code = 'UNAUTHORIZED', details?: unknown) {
    super(message, 401, code, details);
  }
}

/**
 * 403 Forbidden
 */
export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden', code = 'FORBIDDEN', details?: unknown) {
    super(message, 403, code, details);
  }
}

/**
 * 404 Not Found
 */
export class NotFoundError extends AppError {
  constructor(message = 'Resource Not Found', code = 'NOT_FOUND', details?: unknown) {
    super(message, 404, code, details);
  }
}

/**
 * 409 Conflict
 */
export class ConflictError extends AppError {
  constructor(message = 'Conflict', code = 'CONFLICT', details?: unknown) {
    super(message, 409, code, details);
  }
}

/**
 * 500 Configuration Error (e.g. missing environment variables when invoked)
 */
export class ConfigurationError extends AppError {
  constructor(message = 'Configuration Error', details?: unknown) {
    super(message, 500, 'CONFIGURATION_ERROR', details);
  }
}

/**
 * 502 Bad Gateway / Integration Failure (External API failed or returned bad data)
 */
export class IntegrationError extends AppError {
  constructor(
    service: string,
    message: string,
    code = 'INTEGRATION_ERROR',
    statusCode = 502,
    details?: unknown
  ) {
    super(`[${service}] ${message}`, statusCode, code, details);
  }
}

/**
 * Slack Integration Error
 */
export class SlackIntegrationError extends IntegrationError {
  constructor(message: string, details?: unknown) {
    super('Slack', message, 'SLACK_INTEGRATION_ERROR', 502, details);
  }
}

/**
 * Telegram Integration Error
 */
export class TelegramIntegrationError extends IntegrationError {
  constructor(message: string, details?: unknown) {
    super('Telegram', message, 'TELEGRAM_INTEGRATION_ERROR', 502, details);
  }
}

/**
 * Translation Integration Error
 */
export class TranslationIntegrationError extends IntegrationError {
  constructor(message: string, details?: unknown) {
    super('Translation', message, 'TRANSLATION_INTEGRATION_ERROR', 502, details);
  }
}

/**
 * Agent Integration Error
 */
export class AgentIntegrationError extends IntegrationError {
  constructor(message: string, details?: unknown) {
    super('Agent', message, 'AGENT_INTEGRATION_ERROR', 502, details);
  }
}

/**
 * 504 Gateway Timeout (External request timed out)
 */
export class TimeoutError extends AppError {
  constructor(message = 'Request timed out', code = 'TIMEOUT_ERROR', details?: unknown) {
    super(message, 504, code, details);
  }
}
