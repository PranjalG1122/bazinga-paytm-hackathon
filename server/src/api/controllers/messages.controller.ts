import { Request, Response } from 'express';
import { errorResponse } from '../../utils/response.js';
import { translationService } from '../../layers/translation/translation.service.js';
import { TranslationProviderError } from '../../layers/translation/translation.types.js';

const isNonEmptyString = (v: unknown): v is string => typeof v === 'string' && v.trim().length > 0;

export function sendTranslationError(res: Response, err: unknown): void {
  const error = err as Error;
  if (err instanceof TranslationProviderError) {
    console.error('[Translation]', error.message, err.body);
    res.status(err.status).json(errorResponse(error.message, 'TRANSLATION_PROVIDER_ERROR', err.body));
    return;
  }
  console.error('[Translation]', error.message);
  res.status(500).json(errorResponse(error.message));
}

/**
 * API 1: POST /api/messages/incoming
 * { data } (any language) -> { language (detected), data (English) }
 */
export async function translateIncoming(req: Request, res: Response): Promise<void> {
  const { data } = req.body ?? {};
  if (!isNonEmptyString(data)) {
    res.status(400).json(errorResponse('`data` is required and must be a non-empty string'));
    return;
  }

  try {
    const result = await translationService.understand(data);
    res.json({ language: result.language, data: result.text });
  } catch (err) {
    sendTranslationError(res, err);
  }
}

/**
 * API 2: POST /api/messages/outgoing
 * { language, data (English) } -> { language, data (translated) }
 */
export async function translateOutgoing(req: Request, res: Response): Promise<void> {
  const { language, data } = req.body ?? {};
  if (!isNonEmptyString(language)) {
    res.status(400).json(errorResponse('`language` is required and must be a non-empty string'));
    return;
  }
  if (!isNonEmptyString(data)) {
    res.status(400).json(errorResponse('`data` is required and must be a non-empty string'));
    return;
  }

  try {
    const translated = await translationService.localize(data, language);
    res.json({ language, data: translated });
  } catch (err) {
    sendTranslationError(res, err);
  }
}
