import { config, assertEnv } from '../../config/env.js';
import { SlackApiResponse } from './slack.types.js';

export class SlackClient {
  private readonly botToken: string;
  private readonly baseUrl = 'https://slack.com/api';

  constructor(token?: string) {
    const activeToken = token || config.slack.botToken;
    this.botToken = assertEnv(activeToken, 'SLACK_BOT_TOKEN');
  }

  /**
   * Posts an API call to Slack Web API.
   */
  async post<T extends SlackApiResponse>(endpoint: string, payload: Record<string, unknown>): Promise<T> {
    const response = await fetch(`${this.baseUrl}/${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        Authorization: `Bearer ${this.botToken}`,
      },
      body: JSON.stringify(payload),
    });

    const data = (await response.json()) as T;

    if (!response.ok || !data.ok) {
      throw new Error(`Slack API error [${response.status}]: ${data.error || 'Unknown error'}`);
    }

    return data;
  }
}
