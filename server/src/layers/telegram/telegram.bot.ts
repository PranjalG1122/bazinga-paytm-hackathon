import { telegramService } from './telegram.service.js';
import { TelegramMessage, TelegramOutboundRequest } from './telegram.types.js';
import { translationService } from '../translation/translation.service.js';
import { agentService } from '../agent/agent.service.js';

/**
 * Merchant conversation flow over Telegram.
 * All reply logic works in English; translation happens only at the edges.
 */

/**
 * Handles a message the merchant sent us.
 * We reply in the language the merchant actually wrote in, even if it differs
 * from their stored preference.
 */
export async function handleIncomingMessage(message: TelegramMessage): Promise<void> {
  const chatId = message.chat.id;
  const text = message.text;

  if (typeof text !== 'string') {
    await telegramService.sendMessage({ chatId, text: 'Please send a text message.' });
    return;
  }

  if (text.startsWith('/start')) {
    console.log(`[Telegram] /start chatId=${chatId} name=${message.from?.first_name ?? ''}`);
    await telegramService.sendMessage({
      chatId,
      text: 'Hello! You can send us a message in any language.',
    });
    return;
  }

  try {
    const { language, text: englishText } = await translationService.understand(text);
    console.log(`[Telegram] Incoming chatId=${chatId} language=${language}`);
    console.log(`  original: ${text}`);
    console.log(`  english:  ${englishText}`);

    const { reply } = await agentService.sendMessage({
      message: englishText,
      userId: String(chatId),
    });
    const localized = await translationService.localize(reply, language);
    await telegramService.sendMessage({ chatId, text: localized });
  } catch (err) {
    // Known gap: if translation fails, the merchant gets no reply; we only log it.
    console.error(`[Telegram] Incoming chatId=${chatId} failed:`, (err as Error).message);
  }
}

/**
 * We start the conversation. Our system passes the merchant's preferred language.
 */
export async function sendToMerchant(request: TelegramOutboundRequest): Promise<string> {
  const localized = await translationService.localize(request.data, request.language);
  await telegramService.sendMessage({ chatId: request.chatId, text: localized });
  console.log(`[Telegram] Sent chatId=${request.chatId} language=${request.language}`);
  return localized;
}
