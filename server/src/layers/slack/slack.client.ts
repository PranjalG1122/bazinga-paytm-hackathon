import { config, assertEnv } from '../../config/env.js';
import { SlackIntegrationError, TimeoutError } from '../../utils/errors.js';
import { SlackApiResponse } from './slack.types.js';

export class SlackClient {
  private readonly baseUrl = 'https://slack.com/api';
  private readonly defaultTimeoutMs: number;

  constructor(timeoutMs = 10000) {
    this.defaultTimeoutMs = timeoutMs;
  }

  /**
   * Retrieves the configured bot token securely.
   */
  private getToken(): string {
    return assertEnv(config.slack.botToken, 'SLACK_BOT_TOKEN');
  }

  /**
   * Posts an API call to Slack Web API directly.
   */
  async post<T extends SlackApiResponse>(endpoint: string, payload: Record<string, unknown>): Promise<T> {
    const token = this.getToken();
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.defaultTimeoutMs);

    try {
      const response = await fetch(`${this.baseUrl}/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      let data: T;
      try {
        data = (await response.json()) as T;
      } catch (parseErr) {
        throw new SlackIntegrationError(
          `Slack API HTTP ${response.status}: Failed to parse JSON response (${
            parseErr instanceof Error ? parseErr.message : 'Unknown parse error'
          })`
        );
      }

      if (!response.ok || !data.ok) {
        const errorDetail = data.error ? `: ${data.error}` : '';
        throw new SlackIntegrationError(`Slack API error [${response.status}]${errorDetail}`, data);
      }

      return data;
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') {
        throw new TimeoutError(`Slack API request timed out after ${this.defaultTimeoutMs}ms`);
      }
      throw err;
    } finally {
      clearTimeout(timer);
    }
  }
}

export const slackClient = new SlackClient();

