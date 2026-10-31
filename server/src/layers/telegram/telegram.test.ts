import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { TelegramClient, TelegramIntegrationError } from './telegram.client.js';
import { sendTelegramMessage } from './telegram.service.js';
import {
  validateWebhookSecret,
  processTelegramWebhookUpdate,
  setMerchantOnboardingAdapter,
  setResponseServiceAdapter,
} from './telegram.webhook.js';
import {
  MerchantOnboardingEvent,
  NormalizedIncomingTelegramMessage,
} from './telegram.types.js';
import { config } from '../../config/env.js';
import { ValidationError, UnauthorizedError, IntegrationError } from '../../utils/errors.js';

describe('Telegram Integration Layer', () => {
  const originalFetch = global.fetch;
  const originalBotToken = config.telegram.botToken;
  const originalSecret = config.telegram.webhookSecret;

  beforeEach(() => {
    config.telegram.botToken = 'test-bot-token-12345';
    config.telegram.webhookSecret = 'test-secret-abcdef';
  });

  afterEach(() => {
    global.fetch = originalFetch;
    config.telegram.botToken = originalBotToken;
    config.telegram.webhookSecret = originalSecret;
  });

  describe('Outbound Messaging: sendTelegramMessage', () => {
    it('successfully sends an outbound message', async () => {
      let requestedUrl = '';
      let requestedPayload: Record<string, unknown> | null = null;

      global.fetch = (async (input: unknown, init?: RequestInit) => {
        requestedUrl = String(input);
        requestedPayload = JSON.parse(String(init?.body)) as Record<string, unknown>;
        return new Response(
          JSON.stringify({
            ok: true,
            result: {
              message_id: 101,
              date: 1600000000,
              chat: { id: 123456, type: 'private' },
              text: 'Hello merchant',
            },
          }),
          { status: 200 }
        );
      }) as typeof fetch;

      await sendTelegramMessage(123456, 'Hello merchant');

      assert.match(requestedUrl, /\/sendMessage$/);
      assert.equal(requestedPayload?.['chat_id'], '123456');
      assert.equal(requestedPayload?.['text'], 'Hello merchant');
    });

    it('rejects empty chatId or whitespace message', async () => {
      await assert.rejects(
        () => sendTelegramMessage('', 'Valid text'),
        (err: Error) => err instanceof ValidationError
      );

      await assert.rejects(
        () => sendTelegramMessage(12345, '   '),
        (err: Error) => err instanceof ValidationError
      );
    });

    it('handles Telegram API error response when ok is false', async () => {
      global.fetch = (async () => {
        return new Response(
          JSON.stringify({
            ok: false,
            error_code: 403,
            description: 'Forbidden: bot was blocked by the user',
          }),
          { status: 403 }
        );
      }) as typeof fetch;

      await assert.rejects(
        () => sendTelegramMessage(123456, 'Hello'),
        (err: Error) => {
          assert(err instanceof IntegrationError);
          assert.match(err.message, /bot was blocked/);
          // Verify token is never exposed in error message
          assert(!err.message.includes('test-bot-token'));
          return true;
        }
      );
    });

    it('handles network failure cleanly without exposing token in error', async () => {
      global.fetch = (async () => {
        throw new Error('Connection reset by peer');
      }) as typeof fetch;

      await assert.rejects(
        () => sendTelegramMessage(123456, 'Hello'),
        (err: Error) => {
          assert(err instanceof IntegrationError);
          assert(!err.message.includes('test-bot-token'));
          return true;
        }
      );
    });
  });

  describe('Webhook Validation & Update Processing', () => {
    it('validates timing-safe webhook secret correctly', () => {
      assert.doesNotThrow(() => validateWebhookSecret('test-secret-abcdef'));

      assert.throws(
        () => validateWebhookSecret('invalid-secret'),
        (err: Error) => err instanceof UnauthorizedError
      );

      assert.throws(
        () => validateWebhookSecret(undefined),
        (err: Error) => err instanceof UnauthorizedError
      );
    });

    it('processes /start onboarding with merchant payload', async () => {
      let receivedOnboarding: MerchantOnboardingEvent | null = null;
      setMerchantOnboardingAdapter({
        async handleStart(event: MerchantOnboardingEvent): Promise<void> {
          receivedOnboarding = event;
        },
      });

      const update = {
        update_id: 1,
        message: {
          message_id: 10,
          date: 1600000000,
          chat: { id: 987654, type: 'private' },
          from: { id: 987654, is_bot: false, first_name: 'Ramesh', username: 'ramesh_store' },
          text: '/start merchant_456',
        },
      };

      const result = await processTelegramWebhookUpdate(update);
      assert.equal(result.status, 'onboarding');
      assert.equal(receivedOnboarding !== null, true);
      assert.equal((receivedOnboarding as unknown as MerchantOnboardingEvent).chatId, '987654');
      assert.equal((receivedOnboarding as unknown as MerchantOnboardingEvent).startPayload, 'merchant_456');
      assert.equal((receivedOnboarding as unknown as MerchantOnboardingEvent).telegramUserId, '987654');
    });

    it('forwards ordinary customer text message to response adapter', async () => {
      let forwardedMessage: NormalizedIncomingTelegramMessage | null = null;
      setResponseServiceAdapter({
        async handleIncomingMessage(msg: NormalizedIncomingTelegramMessage): Promise<void> {
          forwardedMessage = msg;
        },
      });

      const update = {
        update_id: 2,
        message: {
          message_id: 20,
          date: 1600000100,
          chat: { id: 987654, type: 'private' },
          from: { id: 987654, is_bot: false, first_name: 'Ramesh' },
          text: 'Where is my payout?',
          reply_to_message: {
            message_id: 15,
            date: 1600000050,
            chat: { id: 987654, type: 'private' },
            text: 'Previous message',
          },
        },
      };

      const result = await processTelegramWebhookUpdate(update);
      assert.equal(result.status, 'message');
      assert.equal(forwardedMessage !== null, true);
      assert.equal((forwardedMessage as unknown as NormalizedIncomingTelegramMessage).chatId, '987654');
      assert.equal((forwardedMessage as unknown as NormalizedIncomingTelegramMessage).text, 'Where is my payout?');
      assert.equal((forwardedMessage as unknown as NormalizedIncomingTelegramMessage).messageId, 20);
      assert.equal((forwardedMessage as unknown as NormalizedIncomingTelegramMessage).replyToMessageId, 15);
      assert.equal((forwardedMessage as unknown as NormalizedIncomingTelegramMessage).userId, '987654');
    });

    it('safely ignores bot-generated messages and non-text messages', async () => {
      const botMessageUpdate = {
        update_id: 3,
        message: {
          message_id: 30,
          date: 1600000200,
          chat: { id: 987654, type: 'private' },
          from: { id: 111, is_bot: true, first_name: 'OurBot' },
          text: 'Bot output',
        },
      };

      const nonTextUpdate = {
        update_id: 4,
        message: {
          message_id: 31,
          date: 1600000300,
          chat: { id: 987654, type: 'private' },
          from: { id: 987654, is_bot: false, first_name: 'Ramesh' },
        },
      };

      const res1 = await processTelegramWebhookUpdate(botMessageUpdate);
      assert.equal(res1.status, 'ignored');

      const res2 = await processTelegramWebhookUpdate(nonTextUpdate);
      assert.equal(res2.status, 'ignored');
    });
  });
});
