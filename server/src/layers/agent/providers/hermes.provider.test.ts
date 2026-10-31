import { afterEach, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { HermesAgentProvider } from './hermes.provider.js';
import { config } from '../../../config/env.js';

describe('Hermes agent provider', () => {
  const originalFetch = global.fetch;
  const originalAgent = { ...config.agent };

  afterEach(() => {
    global.fetch = originalFetch;
    Object.assign(config.agent, originalAgent);
  });

  it('calls the Hermes Chat Completions endpoint with stable Telegram session headers', async () => {
    config.agent.apiUrl = 'http://127.0.0.1:8642/v1';
    config.agent.apiKey = 'secret';
    config.agent.model = 'hermes-agent';

    global.fetch = (async (input: unknown, init?: RequestInit) => {
      assert.equal(String(input), 'http://127.0.0.1:8642/v1/chat/completions');
      const headers = init?.headers as Record<string, string>;
      assert.equal(headers.Authorization, 'Bearer secret');
      assert.equal(headers['X-Hermes-Session-Id'], 'telegram-42');
      assert.equal(headers['X-Hermes-Session-Key'], 'paytm:telegram:telegram-42');
      return new Response(JSON.stringify({
        choices: [{ message: { content: 'Done' }, finish_reason: 'stop' }],
      }));
    }) as typeof fetch;

    const result = await new HermesAgentProvider().sendMessage({
      message: 'Check payout',
      sessionId: 'telegram-42',
    });

    assert.equal(result.reply, 'Done');
    assert.equal(result.provider, 'hermes');
  });
});
