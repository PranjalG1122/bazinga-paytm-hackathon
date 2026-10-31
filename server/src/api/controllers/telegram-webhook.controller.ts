import { Request, Response, NextFunction } from 'express';
import { validateWebhookSecret, processTelegramWebhookUpdate } from '../../layers/telegram/telegram.webhook.js';
import { successResponse } from '../../utils/response.js';

/**
 * POST /api/telegram/webhook
 * Receives incoming Telegram update events from Telegram Bot API.
 */
export async function handleTelegramWebhook(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const secretHeader = req.headers['x-telegram-bot-api-secret-token'] as string | undefined;
    validateWebhookSecret(secretHeader);

    const result = await processTelegramWebhookUpdate(req.body);

    res.status(200).json(
      successResponse({
        processed: true,
        result,
      })
    );
  } catch (error) {
    next(error);
  }
}
