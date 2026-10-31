import { TelegramClient } from './telegram.client.js';
import { TelegramMessage } from './telegram.types.js';
import { ValidationError } from '../../utils/errors.js';

let sharedClient: TelegramClient | null = null;

function getClient(): TelegramClient {
  if (!sharedClient) {
    sharedClient = new TelegramClient();
  }
  return sharedClient;
}

/**
 * Sends a text message to an already established Telegram chat.
 *
 * @param chatId The destination Telegram chat id.
 * @param message The text message content to send.
 */
export async function sendTelegramMessage(
  chatId: string | number,
  message: string
): Promise<void> {
  if (chatId === undefined || chatId === null || String(chatId).trim() === '') {
    throw new ValidationError('A non-empty `chatId` is required to send a Telegram message.');
  }

  if (typeof message !== 'string' || !message.trim()) {
    throw new ValidationError('A non-empty `message` string is required to send a Telegram message.');
  }

  const client = getClient();
  await client.request<TelegramMessage>('sendMessage', {
    chat_id: String(chatId).trim(),
    text: message.trim(),
  });
}

/**
 * Service instance exporting helper methods.
 */
export const telegramService = {
  sendMessage: sendTelegramMessage,
};
