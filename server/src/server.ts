import { createApp } from './app.js';
import { config } from './config/env.js';

const app = createApp();

const server = app.listen(config.port, () => {
  console.log(`[Server] Layered backend running at http://localhost:${config.port}`);
  console.log(`[Server] Environment: ${config.nodeEnv}`);
});

process.on('SIGTERM', () => {
  console.log('[Server] SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('[Server] Closed out remaining connections.');
    process.exit(0);
  });
});
