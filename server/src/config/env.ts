import dotenv from 'dotenv';

dotenv.config();

export interface AppConfig {
  nodeEnv: string;
  port: number;
  telegram: {
    botToken?: string;
    webhookSecret?: string;
  };
  slack: {
    botToken?: string;
    channelId?: string;
  };
  agent: {
    apiUrl?: string;
    apiKey?: string;
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
  },
  slack: {
    botToken: process.env.SLACK_BOT_TOKEN,
    channelId: process.env.SLACK_CHANNEL_ID,
  },
  agent: {
    apiUrl: process.env.AGENT_API_URL,
    apiKey: process.env.AGENT_API_KEY,
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
    throw new Error(`[Config Error] Missing required configuration: ${name}`);
  }
  return value;
}
