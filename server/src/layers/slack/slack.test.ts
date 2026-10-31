import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { config } from '../../config/env.js';
import { notifySlack, SlackService } from './slack.service.js';
import { SlackClient } from './slack.client.js';


describe('Slack Notification Layer', () => {
  const originalFetch = globalThis.fetch;
  const originalToken = config.slack.botToken;
  const originalChannel = config.slack.channelId;

  beforeEach(() => {
    config.slack.botToken = 'xoxb-mock-token';
    config.slack.channelId = 'C1234567890';
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    config.slack.botToken = originalToken;
    config.slack.channelId = originalChannel;
  });

  it('successfully posts a notification message', async () => {
    let capturedUrl = '';
    let capturedOptions: RequestInit | undefined;

    globalThis.fetch = async (url, options) => {
      capturedUrl = String(url);
      capturedOptions = options;
      return new Response(
        JSON.stringify({ ok: true, channel: 'C1234567890', ts: '1234567890.123456' }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    };

    await notifySlack('Hello team!');

    assert.equal(capturedUrl, 'https://slack.com/api/chat.postMessage');
    assert.equal(capturedOptions?.method, 'POST');

    const headers = capturedOptions?.headers as Record<string, string>;
    assert.equal(headers['Authorization'], 'Bearer xoxb-mock-token');
    assert.equal(headers['Content-Type'], 'application/json; charset=utf-8');

    const body = JSON.parse(String(capturedOptions?.body));
    assert.deepEqual(body, {
      channel: 'C1234567890',
      text: 'Hello team!',
    });
  });

  it('rejects empty or whitespace-only messages', async () => {
    await assert.rejects(
      async () => {
        await notifySlack('');
      },
      (err: Error) => {
        assert.equal(err.message, 'Slack notification message cannot be empty');
        return true;
      }
    );

    await assert.rejects(
      async () => {
        await notifySlack('   \n\t  ');
      },
      (err: Error) => {
        assert.equal(err.message, 'Slack notification message cannot be empty');
        return true;
      }
    );
  });

  it('fails with missing SLACK_BOT_TOKEN without exposing tokens', async () => {
    config.slack.botToken = undefined;

    await assert.rejects(
      async () => {
        await notifySlack('Test message');
      },
      (err: Error) => {
        assert.match(err.message, /Missing required configuration: SLACK_BOT_TOKEN/);
        assert.doesNotMatch(err.message, /xoxb-/);
        return true;
      }
    );
  });

  it('fails with missing SLACK_CHANNEL_ID', async () => {
    config.slack.channelId = undefined;

    await assert.rejects(
      async () => {
        await notifySlack('Test message');
      },
      (err: Error) => {
        assert.match(err.message, /Missing required configuration: SLACK_CHANNEL_ID/);
        return true;
      }
    );
  });

  it('throws descriptive error when Slack returns ok: false with error code', async () => {
    globalThis.fetch = async () => {
      return new Response(
        JSON.stringify({ ok: false, error: 'channel_not_found' }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    };

    await assert.rejects(
      async () => {
        await notifySlack('Test message');
      },
      (err: Error) => {
        assert.match(err.message, /Slack API error \[200\]: channel_not_found/);
        assert.doesNotMatch(err.message, /xoxb-/);
        return true;
      }
    );
  });

  it('throws descriptive error on HTTP failure status', async () => {
    globalThis.fetch = async () => {
      return new Response(
        JSON.stringify({ ok: false, error: 'invalid_auth' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    };

    await assert.rejects(
      async () => {
        await notifySlack('Test message');
      },
      (err: Error) => {
        assert.match(err.message, /Slack API error \[401\]: invalid_auth/);
        assert.doesNotMatch(err.message, /xoxb-/);
        return true;
      }
    );
  });

  it('handles network error cleanly', async () => {
    globalThis.fetch = async () => {
      throw new Error('connect ECONNREFUSED 127.0.0.1:443');
    };

    await assert.rejects(
      async () => {
        await notifySlack('Test message');
      },
      (err: Error) => {
        assert.match(err.message, /connect ECONNREFUSED/);
        assert.doesNotMatch(err.message, /xoxb-/);
        return true;
      }
    );
  });

  it('handles request timeout cleanly', async () => {
    const fastTimeoutClient = new SlackClient(20);
    const service = new SlackService(fastTimeoutClient);

    globalThis.fetch = async (_url, options) => {
      return new Promise((_resolve, reject) => {
        options?.signal?.addEventListener('abort', () => {
          const abortError = new Error('The operation was aborted');
          abortError.name = 'AbortError';
          reject(abortError);
        });
      });
    };

    await assert.rejects(
      async () => {
        await service.postNotification({ text: 'Hello' });
      },
      (err: Error) => {
        assert.match(err.message, /timed out after 20ms/);
        return true;
      }
    );
  });
});
