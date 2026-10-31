import { TelegramClient } from './telegram.client.js';
import {
  TelegramMessage,
  TelegramSendMessageRequest,
  TelegramWebhookUpdate,
} from './telegram.types.js';

const POLL_TIMEOUT_SECONDS = 30;
const POLL_RETRY_DELAY_MS = 3000;

export type TelegramMessageHandler = (message: TelegramMessage) => Promise<void>;

export class TelegramService {
  private client: TelegramClient | null = null;
  private polling = false;

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
   * Long-polling loop using getUpdates. No public URL or webhook needed.
   * Runs until stopPolling() is called.
   */
  async startPolling(onMessage: TelegramMessageHandler): Promise<void> {
    const client = this.getClient();
    if (this.polling) return;
    this.polling = true;
    let offset = 0;
    console.log('[Telegram] Long polling started');

    while (this.polling) {
      try {
        const updates = await client.request<TelegramWebhookUpdate[]>('getUpdates', {
          offset,
          timeout: POLL_TIMEOUT_SECONDS,
          allowed_updates: ['message'],
        });

        for (const update of updates) {
          offset = update.update_id + 1;
          if (!update.message) continue;
          try {
            await onMessage(update.message);
          } catch (err) {
            console.error('[Telegram] Message handler error:', (err as Error).message);
          }
        }
      } catch (err) {
        console.error('[Telegram] Polling error:', (err as Error).message);
        await new Promise((resolve) => setTimeout(resolve, POLL_RETRY_DELAY_MS));
      }
    }
  }

  stopPolling(): void {
    this.polling = false;
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
