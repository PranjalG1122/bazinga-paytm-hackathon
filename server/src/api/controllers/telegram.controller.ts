import { Request, Response } from 'express';
import { errorResponse } from '../../utils/response.js';
import { sendToMerchant } from '../../layers/telegram/telegram.bot.js';

const REQUIRED_FIELDS = ['chatId', 'language', 'data'] as const;

/**
 * POST /api/send
 * We start the conversation: { chatId, language (merchant's preferred), data (English) }.
 */
export async function sendMessage(req: Request, res: Response): Promise<void> {
  const body = req.body ?? {};
  const missing = REQUIRED_FIELDS.filter(
    (k) => body[k] === undefined || body[k] === null || body[k] === ''
  );
  if (missing.length) {
    res.status(400).json(errorResponse(`Missing required field(s): ${missing.join(', ')}`));
    return;
  }

  const { chatId, language, data } = body;
  try {
    const localized = await sendToMerchant({ chatId, language, data });
    res.json({ chatId, language, data: localized });
  } catch (err) {
    const message = (err as Error).message;
    console.error(`[Telegram] Send chatId=${chatId} failed:`, message);
    res.status(502).json(errorResponse(message));
  }
}
