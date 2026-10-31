import { TelegramClient } from './telegram.client.js';
import { TelegramWebhookInfo } from './telegram.types.js';
import { config, assertEnv } from '../../config/env.js';

/**
 * Registers the Telegram webhook using setWebhook.
 */
export async function setWebhook(): Promise<boolean> {
  const webhookUrl = assertEnv(config.telegram.webhookUrl, 'TELEGRAM_WEBHOOK_URL');
  const secretToken = assertEnv(config.telegram.webhookSecret, 'TELEGRAM_WEBHOOK_SECRET');

  const client = new TelegramClient();
  const result = await client.request<boolean>('setWebhook', {
    url: webhookUrl,
    secret_token: secretToken,
    allowed_updates: ['message'],
  });

  return result;
}

/**
 * Retrieves the current Telegram webhook status using getWebhookInfo.
 */
export async function getWebhookInfo(): Promise<TelegramWebhookInfo> {
  const client = new TelegramClient();
  return await client.request<TelegramWebhookInfo>('getWebhookInfo');
}

/**
 * Deletes the configured webhook (useful if switching to polling or resetting).
 */
export async function deleteWebhook(dropPendingUpdates = false): Promise<boolean> {
  const client = new TelegramClient();
  return await client.request<boolean>('deleteWebhook', {
    drop_pending_updates: dropPendingUpdates,
  });
}
