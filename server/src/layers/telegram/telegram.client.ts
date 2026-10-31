import { config, assertEnv } from '../../config/env.js';
import { TelegramApiResponse } from './telegram.types.js';
import { IntegrationError, TimeoutError, ConfigurationError } from '../../utils/errors.js';

export class TelegramIntegrationError extends IntegrationError {
  constructor(message: string, code = 'TELEGRAM_API_ERROR', details?: unknown) {
    super('Telegram', message, code, 502, details);
  }
}

export class TelegramClient {
  private readonly baseUrl: string;

  constructor(token?: string) {
    const botToken = token || config.telegram.botToken;
    const validatedToken = assertEnv(botToken, 'TELEGRAM_BOT_TOKEN');
    this.baseUrl = `https://api.telegram.org/bot${validatedToken}`;
  }

  /**
   * Dispatches an HTTP request to Telegram Bot API.
   * Ensures bot token is never exposed in error messages or logs.
   */
  async request<T>(method: string, payload?: Record<string, unknown>, timeoutMs = 10000): Promise<T> {
    const url = `${this.baseUrl}/${method}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: payload ? JSON.stringify(payload) : undefined,
        signal: controller.signal,
      });

      let data: TelegramApiResponse<T>;
      try {
        data = (await response.json()) as TelegramApiResponse<T>;
      } catch {
        throw new TelegramIntegrationError(
          `Failed to parse response from ${method} (HTTP ${response.status})`,
          'TELEGRAM_PARSE_ERROR'
        );
      }

      if (!response.ok || !data.ok) {
        const desc = data.description || 'Unknown Telegram API error';
        const code = data.error_code || response.status;
        throw new TelegramIntegrationError(
          `API request to ${method} failed [${code}]: ${desc}`,
          'TELEGRAM_API_ERROR',
          { statusCode: code, description: desc }
        );
      }

      return data.result as T;
    } catch (err) {
      if ((err as Error).name === 'AbortError') {
        throw new TimeoutError(`[Telegram] Request to ${method} timed out after ${timeoutMs}ms`);
      }
      if (err instanceof IntegrationError || err instanceof ConfigurationError) {
        throw err;
      }
      throw new TelegramIntegrationError(
        `Network error executing ${method}: ${(err as Error).message}`,
        'TELEGRAM_NETWORK_ERROR'
      );
    } finally {
      clearTimeout(timeoutId);
    }
  }
}
