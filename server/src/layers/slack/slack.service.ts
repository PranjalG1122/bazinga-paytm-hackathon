import { config, assertEnv } from '../../config/env.js';
import { SlackClient } from './slack.client.js';
import { SlackPostNotificationRequest, SlackApiResponse } from './slack.types.js';

export class SlackService {
  private client: SlackClient | null = null;

  private getClient(): SlackClient {
    if (!this.client) {
      this.client = new SlackClient();
    }
    return this.client;
  }

  /**
   * Posts a notification message to a configured Slack channel.
   * Note: Slack integration is strictly one-way for notifications.
   */
  async postNotification(params: SlackPostNotificationRequest): Promise<SlackApiResponse> {
    const channel = params.channel || config.slack.channelId;
    const validatedChannel = assertEnv(channel, 'SLACK_CHANNEL_ID');

    const client = this.getClient();
    return await client.post<SlackApiResponse>('chat.postMessage', {
      channel: validatedChannel,
      text: params.text,
      blocks: params.blocks,
    });
  }
}

export const slackService = new SlackService();
