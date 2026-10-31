export interface TelegramApiResponse<T = unknown> {
  ok: boolean;
  result?: T;
  description?: string;
  error_code?: number;
}

export interface TelegramUser {
  id: number;
  is_bot: boolean;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
}

export interface TelegramChat {
  id: number;
  type: 'private' | 'group' | 'supergroup' | 'channel';
  title?: string;
  username?: string;
  first_name?: string;
  last_name?: string;
}

export interface TelegramMessage {
  message_id: number;
  from?: TelegramUser;
  chat: TelegramChat;
  date: number;
  text?: string;
  reply_to_message?: TelegramMessage;
}

export interface TelegramWebhookUpdate {
  update_id: number;
  message?: TelegramMessage;
  edited_message?: TelegramMessage;
  channel_post?: TelegramMessage;
  edited_channel_post?: TelegramMessage;
}

export interface TelegramWebhookInfo {
  url: string;
  has_custom_certificate: boolean;
  pending_update_count: number;
  ip_address?: string;
  last_error_date?: number;
  last_error_message?: string;
  last_synchronization_error_date?: number;
  max_connections?: number;
  allowed_updates?: string[];
}

/**
 * Normalized incoming merchant message to be handed off to the Response API.
 */
export interface NormalizedIncomingTelegramMessage {
  source: 'telegram';
  chatId: string;
  userId?: string;
  messageId: number;
  text: string;
  replyToMessageId?: number;
  date: number;
}

/**
 * Normalized merchant onboarding payload from /start.
 */
export interface MerchantOnboardingEvent {
  chatId: string;
  telegramUserId?: string;
  startPayload?: string;
  username?: string;
  firstName?: string;
}

/**
 * Interface for the Response Service adapter.
 */
export interface TelegramResponseServiceAdapter {
  handleIncomingMessage(message: NormalizedIncomingTelegramMessage): Promise<void>;
}

/**
 * Interface for Merchant Onboarding persistence adapter.
 */
export interface MerchantTelegramOnboardingAdapter {
  handleStart(event: MerchantOnboardingEvent): Promise<void>;
}
