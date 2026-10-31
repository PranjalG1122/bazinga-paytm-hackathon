import { Router } from 'express';
import { handleTelegramWebhook } from '../controllers/telegram-webhook.controller.js';

export const telegramWebhookRouter = Router();

// POST /api/telegram/webhook
telegramWebhookRouter.post('/webhook', handleTelegramWebhook);
