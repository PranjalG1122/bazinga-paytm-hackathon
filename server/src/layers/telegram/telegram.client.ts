import { config, assertEnv } from '../../config/env.js';
import { TelegramApiResponse } from './telegram.types.js';

export class TelegramClient {
  private readonly baseUrl: string;

  constructor(token?: string) {
    const botToken = token || config.telegram.botToken;
    const validatedToken = assertEnv(botToken, 'TELEGRAM_BOT_TOKEN');
    this.baseUrl = `https://api.telegram.org/bot${validatedToken}`;
  }

  /**
   * Dispatches an HTTP request to Telegram Bot API.
   */
  async request<T>(method: string, payload?: Record<string, unknown>): Promise<T> {
    const url = `${this.baseUrl}/${method}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: payload ? JSON.stringify(payload) : undefined,
    });

    const data = (await response.json()) as TelegramApiResponse<T>;

    if (!response.ok || !data.ok) {
      throw new Error(
        `Telegram API error [${response.status}]: ${data.description || 'Unknown error'}`
      );
    }

    return data.result as T;
  }
}
