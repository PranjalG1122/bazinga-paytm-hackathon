import { afterEach, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { executeResponseWorkflow } from './response.controller.js';
import { agentService } from '../../layers/agent/agent.service.js';
import { translationService } from '../../layers/translation/translation.service.js';
import { IAgentProvider } from '../../layers/agent/agent.types.js';
import { ITranslationProvider } from '../../layers/translation/translation.types.js';
import { HermesAgentProvider } from '../../layers/agent/providers/hermes.provider.js';
import { SarvamTranslationProvider } from '../../layers/translation/providers/sarvam.provider.js';
import { config } from '../../config/env.js';

describe('Telegram response workflow', () => {
  const originalFetch = global.fetch;
  const originalToken = config.telegram.botToken;

  afterEach(() => {
    global.fetch = originalFetch;
    config.telegram.botToken = originalToken;
    agentService.setProvider(new HermesAgentProvider());
    translationService.setProvider(new SarvamTranslationProvider());
  });

  it('acknowledges, calls Hermes, localizes, and sends the final reply in order', async () => {
    const events: string[] = [];
    const telegramTexts: string[] = [];
    config.telegram.botToken = 'test-token';

    const translator: ITranslationProvider = {
      name: 'test-translator',
      async translate(request) {
        events.push(`translate:${request.targetLanguage}`);
        return {
          translatedText:
            request.targetLanguage === 'en-IN' ? 'Where is my payout?' : `localized:${request.text}`,
          sourceLanguage: request.sourceLanguage === 'auto' ? 'hi-IN' : request.sourceLanguage || 'hi-IN',
          targetLanguage: request.targetLanguage,
          provider: this.name,
        };
      },
    };
    const agent: IAgentProvider = {
      name: 'test-agent',
      async sendMessage(request) {
        events.push('agent');
        assert.match(request.message, /Where is my payout/);
        assert.match(request.message, /merchant-1/);
        return { reply: 'Your payout is being checked.', provider: this.name };
      },
    };

    translationService.setProvider(translator);
    agentService.setProvider(agent);
    global.fetch = (async (_input: unknown, init?: RequestInit) => {
      events.push('telegram');
      const payload = JSON.parse(String(init?.body)) as { text: string };
      telegramTexts.push(payload.text);
      return new Response(JSON.stringify({
        ok: true,
        result: { message_id: telegramTexts.length, chat: { id: 42, type: 'private' }, date: 1 },
      }));
    }) as typeof fetch;

    const result = await executeResponseWorkflow({
      chatId: '42',
      message: 'मेरा भुगतान कहाँ है?',
      language: 'hi-IN',
      metadata: { merchantId: 'merchant-1' },
    });

    assert.deepEqual(events, [
      'translate:en-IN',
      'translate:hi-IN',
      'telegram',
      'agent',
      'translate:hi-IN',
      'telegram',
    ]);
    assert.equal(telegramTexts.length, 2);
    assert.match(telegramTexts[0], /being processed/);
    assert.match(telegramTexts[1], /payout is being checked/);
    assert.equal(result.detectedLanguage, 'hi-IN');
  });
});
