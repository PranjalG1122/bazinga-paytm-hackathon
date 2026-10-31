import { setWebhook, getWebhookInfo, deleteWebhook } from '../layers/telegram/telegram.setup.js';

async function main(): Promise<void> {
  const command = process.argv[2];

  try {
    switch (command) {
      case 'set': {
        console.log('[Telegram Setup] Registering webhook with Telegram...');
        const success = await setWebhook();
        console.log(`[Telegram Setup] Webhook registered successfully: ${success}`);
        break;
      }
      case 'info': {
        console.log('[Telegram Setup] Fetching webhook info from Telegram...');
        const info = await getWebhookInfo();
        console.log('[Telegram Setup] Current Webhook Info:');
        console.log(JSON.stringify(info, null, 2));
        break;
      }
      case 'delete': {
        console.log('[Telegram Setup] Deleting webhook registration...');
        const success = await deleteWebhook();
        console.log(`[Telegram Setup] Webhook deleted successfully: ${success}`);
        break;
      }
      default:
        console.error('Unknown command. Usage: node dist/scripts/telegram-setup.js [set|info|delete]');
        process.exit(1);
    }
  } catch (err) {
    console.error('[Telegram Setup] Command failed:', (err as Error).message);
    process.exit(1);
  }
}

void main();
