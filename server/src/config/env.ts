import dotenv from 'dotenv';
import { ConfigurationError } from '../utils/errors.js';

dotenv.config();

export interface AppConfig {
  nodeEnv: string;
  port: number;
  telegram: {
    botToken?: string;
    webhookSecret?: string;
    webhookUrl?: string;
  };
  slack: {
    botToken?: string;
    channelId?: string;
  };
  agent: {
    apiUrl?: string;
    apiKey?: string;
    model: string;
    timeoutMs: number;
  };
  translation: {
    sarvamApiKey?: string;
  };
}

const parsePort = (val: string | undefined, defaultPort = 5000): number => {
  if (!val) return defaultPort;
  const parsed = parseInt(val, 10);
  return isNaN(parsed) ? defaultPort : parsed;
};

export const config: AppConfig = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parsePort(process.env.PORT, 5000),
  telegram: {
    botToken: process.env.TELEGRAM_BOT_TOKEN,
    webhookSecret: process.env.TELEGRAM_WEBHOOK_SECRET,
    webhookUrl: process.env.TELEGRAM_WEBHOOK_URL,
  },
  slack: {
    botToken: process.env.SLACK_BOT_TOKEN,
    channelId: process.env.SLACK_CHANNEL_ID,
  },
  agent: {
    apiUrl: process.env.HERMES_API_URL || process.env.AGENT_API_URL,
    apiKey: process.env.HERMES_API_KEY || process.env.AGENT_API_KEY,
    model: process.env.HERMES_MODEL || 'hermes-agent',
    timeoutMs: parsePort(process.env.HERMES_TIMEOUT_MS, 300_000),
  },
  translation: {
    sarvamApiKey: process.env.SARVAM_API_KEY,
  },
};

/**
 * Validates that a required environment variable is present.
 * Throws a descriptive error when an integration is accessed without proper credentials.
 */
export function assertEnv(value: string | undefined, name: string): string {
  if (!value || value.trim() === '') {
    throw new ConfigurationError(`Missing required configuration: ${name}`);
  }
  return value;
}
