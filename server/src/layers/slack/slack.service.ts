import { config, assertEnv } from '../../config/env.js';
import { ValidationError } from '../../utils/errors.js';
import { slackClient, SlackClient } from './slack.client.js';
import { SlackPostNotificationRequest, SlackApiResponse } from './slack.types.js';

export class SlackService {
  constructor(private readonly client: SlackClient = slackClient) {}

  /**
   * Posts a notification message to a configured Slack channel.
   * Note: Slack integration is strictly one-way for notifications.
   */
  async postNotification(params: SlackPostNotificationRequest): Promise<SlackApiResponse> {
    const channel = params.channel || config.slack.channelId;
    const validatedChannel = assertEnv(channel, 'SLACK_CHANNEL_ID');

    if (!params.text || params.text.trim() === '') {
      throw new ValidationError('Slack notification message cannot be empty');
    }

    return await this.client.post<SlackApiResponse>('chat.postMessage', {
      channel: validatedChannel,
      text: params.text,
    });
  }
}

export const slackService = new SlackService();

/**
 * Public notification function: posts message to configured SLACK_CHANNEL_ID.
 */
export async function notifySlack(message: string): Promise<void> {
  if (typeof message !== 'string' || message.trim() === '') {
    throw new ValidationError('Slack notification message cannot be empty');
  }

  const channelId = assertEnv(config.slack.channelId, 'SLACK_CHANNEL_ID');

  await slackClient.post<SlackApiResponse>('chat.postMessage', {
    channel: channelId,
    text: message,
  });
}


