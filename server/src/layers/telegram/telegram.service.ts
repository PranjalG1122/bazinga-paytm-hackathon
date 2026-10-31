import { TelegramClient } from './telegram.client.js';
import { TelegramMessage, TelegramSendMessageRequest } from './telegram.types.js';

export class TelegramService {
  private client: TelegramClient | null = null;

  private getClient(): TelegramClient {
    if (!this.client) {
      this.client = new TelegramClient();
    }
    return this.client;
  }

  /**
   * Sends a text message to a specific Telegram chat.
   */
  async sendMessage(params: TelegramSendMessageRequest): Promise<TelegramMessage> {
    const client = this.getClient();
    return await client.request<TelegramMessage>('sendMessage', {
      chat_id: params.chatId,
      text: params.text,
      parse_mode: params.parseMode,
    });
  }

  /**
   * Prepares webhook update handling.
   * NOTE: Webhook registration with Telegram (setWebhook) should not be called automatically
   * in development or tests. Use this method as an entry point for processing incoming updates.
   */
  processWebhookUpdate(update: unknown): void {
    // Webhook update parsing and routing placeholder
    // TODO: Verify telegram webhook secret header and dispatch update events
  }
}

export const telegramService = new TelegramService();
