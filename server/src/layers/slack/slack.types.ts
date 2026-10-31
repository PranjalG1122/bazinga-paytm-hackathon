export interface SlackPostNotificationRequest {
  channel?: string; // Optional if fallback configured in env
  text: string;
}

export interface SlackApiResponse {
  ok: boolean;
  channel?: string;
  ts?: string;
  error?: string;
  warning?: string;
}

