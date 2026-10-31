import { createApp } from './app.js';
import { config } from './config/env.js';
import { telegramService } from './layers/telegram/telegram.service.js';
import { handleIncomingMessage } from './layers/telegram/telegram.bot.js';

const app = createApp();

const server = app.listen(config.port, () => {
  console.log(`[Server] Layered backend running at http://localhost:${config.port}`);
  console.log(`[Server] Environment: ${config.nodeEnv}`);

  if (config.telegram.botToken) {
    void telegramService.startPolling(handleIncomingMessage);
  } else {
    console.warn('[Telegram] TELEGRAM_BOT_TOKEN is not set; bot polling is disabled.');
  }
});

process.on('SIGTERM', () => {
  console.log('[Server] SIGTERM received. Shutting down gracefully...');
  telegramService.stopPolling();
  server.close(() => {
    console.log('[Server] Closed out remaining connections.');
    process.exit(0);
  });
});
