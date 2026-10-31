import crypto from 'crypto';
import {
  TelegramWebhookUpdate,
  NormalizedIncomingTelegramMessage,
  MerchantOnboardingEvent,
  TelegramResponseServiceAdapter,
  MerchantTelegramOnboardingAdapter,
} from './telegram.types.js';
import { UnauthorizedError, ValidationError } from '../../utils/errors.js';
import { config, assertEnv } from '../../config/env.js';
import { executeResponseWorkflow } from '../../api/controllers/response.controller.js';

/**
 * Default fallback implementation for merchant onboarding.
 * In a full production environment, this should persist the merchant-to-chatId
 * relationship in a database.
 */
export const defaultMerchantOnboardingAdapter: MerchantTelegramOnboardingAdapter = {
  async handleStart(event: MerchantOnboardingEvent): Promise<void> {
    console.log(
      `[Telegram Onboarding] Merchant opted in: chatId=${event.chatId}, startPayload=${event.startPayload ?? 'none'}, userId=${event.telegramUserId ?? 'unknown'}`
    );
    // TODO: Connect to merchant database model (e.g., db.merchants.updateOne({ id: event.startPayload }, { $set: { telegramChatId: event.chatId } }))
  },
};

/**
 * Direct internal adapter forwarding incoming Telegram messages to the Response workflow.
 */
export const defaultResponseServiceAdapter: TelegramResponseServiceAdapter = {
  async handleIncomingMessage(msg: NormalizedIncomingTelegramMessage): Promise<void> {
    console.log(
      `[Telegram -> Response Workflow] Forwarding incoming update from chatId=${msg.chatId}`
    );
    // Telegram expects a fast 2xx response, so the slow agent workflow runs
    // asynchronously after the update has been accepted.
    void executeResponseWorkflow({
      chatId: msg.chatId,
      message: msg.text,
      userId: msg.userId,
    }).catch((error) => {
      console.error(`[Telegram -> Response Workflow] Failed for chatId=${msg.chatId}`, error);
    });
  },
};

let activeOnboardingAdapter: MerchantTelegramOnboardingAdapter = defaultMerchantOnboardingAdapter;
let activeResponseAdapter: TelegramResponseServiceAdapter = defaultResponseServiceAdapter;
const processedUpdateIds = new Set<number>();
const MAX_REMEMBERED_UPDATES = 1000;

export function setMerchantOnboardingAdapter(adapter: MerchantTelegramOnboardingAdapter): void {
  activeOnboardingAdapter = adapter;
}

export function setResponseServiceAdapter(adapter: TelegramResponseServiceAdapter): void {
  activeResponseAdapter = adapter;
}

/**
 * Timing-safe header validation for Telegram's secret token.
 */
export function validateWebhookSecret(incomingSecretHeader: string | undefined): void {
  const secret = assertEnv(config.telegram.webhookSecret, 'TELEGRAM_WEBHOOK_SECRET');

  if (!incomingSecretHeader || typeof incomingSecretHeader !== 'string') {
    throw new UnauthorizedError('Missing Telegram webhook secret token header');
  }

  const headerBuffer = Buffer.from(incomingSecretHeader);
  const secretBuffer = Buffer.from(secret);

  if (headerBuffer.length !== secretBuffer.length || !crypto.timingSafeEqual(headerBuffer, secretBuffer)) {
    throw new UnauthorizedError('Invalid Telegram webhook secret token');
  }
}

export type WebhookProcessResult =
  | { status: 'ignored'; reason: string }
  | { status: 'onboarding'; event: MerchantOnboardingEvent }
  | { status: 'message'; message: NormalizedIncomingTelegramMessage };

/**
 * Processes an incoming Telegram webhook update.
 */
export async function processTelegramWebhookUpdate(
  update: unknown
): Promise<WebhookProcessResult> {
  if (!update || typeof update !== 'object') {
    throw new ValidationError('Invalid webhook payload: expected an object.');
  }

  const telegramUpdate = update as TelegramWebhookUpdate;

  if (typeof telegramUpdate.update_id !== 'number') {
    throw new ValidationError('Invalid webhook payload: missing numeric update_id.');
  }

  if (processedUpdateIds.has(telegramUpdate.update_id)) {
    return { status: 'ignored', reason: 'Duplicate Telegram update ignored' };
  }
  processedUpdateIds.add(telegramUpdate.update_id);
  if (processedUpdateIds.size > MAX_REMEMBERED_UPDATES) {
    const oldest = processedUpdateIds.values().next().value as number | undefined;
    if (oldest !== undefined) processedUpdateIds.delete(oldest);
  }

  if (!telegramUpdate.message) {
    return { status: 'ignored', reason: 'Update does not contain a standard message' };
  }

  const message = telegramUpdate.message;

  // 1. Ignore bot's own messages
  if (message.from?.is_bot) {
    return { status: 'ignored', reason: 'Ignored message sent by a bot' };
  }

  // 2. Ignore non-text messages for now
  if (typeof message.text !== 'string' || !message.text.trim()) {
    return { status: 'ignored', reason: 'Non-text message ignored' };
  }

  // 3. Support private chats only
  if (message.chat?.type && message.chat.type !== 'private') {
    return { status: 'ignored', reason: 'Non-private chat message ignored' };
  }

  const chatId = String(message.chat.id);
  const text = message.text.trim();

  // 4. Check for /start onboarding
  if (text.startsWith('/start')) {
    const parts = text.split(/\s+/);
    const startPayload = parts.length > 1 ? parts.slice(1).join(' ') : undefined;

    const onboardingEvent: MerchantOnboardingEvent = {
      chatId,
      telegramUserId: message.from ? String(message.from.id) : undefined,
      startPayload,
      username: message.from?.username,
      firstName: message.from?.first_name,
    };

    await activeOnboardingAdapter.handleStart(onboardingEvent);
    return { status: 'onboarding', event: onboardingEvent };
  }

  // 5. Ordinary merchant text message -> normalize and forward to Response API
  const normalizedMessage: NormalizedIncomingTelegramMessage = {
    source: 'telegram',
    chatId,
    userId: message.from ? String(message.from.id) : undefined,
    messageId: message.message_id,
    text,
    replyToMessageId: message.reply_to_message?.message_id,
    date: message.date,
  };

  await activeResponseAdapter.handleIncomingMessage(normalizedMessage);
  return { status: 'message', message: normalizedMessage };
}
