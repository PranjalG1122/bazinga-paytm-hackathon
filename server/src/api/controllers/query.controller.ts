import { Request, Response } from 'express';
import { successResponse, errorResponse } from '../../utils/response.js';
import { translationService } from '../../layers/translation/translation.service.js';
import { agentService } from '../../layers/agent/agent.service.js';
import { sendTranslationError } from './messages.controller.js';
// Import once the Telegram step is activated:
// import { telegramService } from '../../layers/telegram/telegram.service.js';

export interface QueryRequestBody {
  question?: string;
  query?: string;
  language?: string;
  chatId?: string | number;
  userId?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Handles incoming query requests containing a user question in an arbitrary language.
 *
 * Flow:
 * 1. Translation layer: Translates user question to the agent's working language (e.g., English).
 * 2. Agent layer: Processes the translated question and generates an answer.
 * 3. Translation layer: Translates the agent's answer back to the user's language.
 * 4. Telegram layer: Sends the localized answer to Telegram.
 */
export async function handleQuery(req: Request<unknown, unknown, QueryRequestBody>, res: Response): Promise<void> {
  const { question, query, language = 'auto', chatId, userId, metadata } = req.body || {};
  const userQuestion = question || query;

  if (!userQuestion || typeof userQuestion !== 'string' || !userQuestion.trim()) {
    res.status(400).json(
      errorResponse('A non-empty question or query field is required in the request body.', 'VALIDATION_ERROR')
    );
    return;
  }

  // Step 1: Translation layer (user language -> English).
  // If `language` is given it is used as the source; otherwise Sarvam detects it.
  let understood;
  try {
    understood = await translationService.understand(userQuestion, language);
  } catch (err) {
    sendTranslationError(res, err);
    return;
  }
  // Reply in the language the user actually wrote in (given or detected).
  const replyLanguage = understood.language;

  // Step 2: Agent layer works in English only.
  let agentResponse;
  try {
    agentResponse = await agentService.sendMessage({
      message: understood.text,
      userId,
      sessionId: chatId !== undefined ? String(chatId) : undefined,
      metadata,
    });
  } catch (err) {
    console.error('[Query] Agent failed:', (err as Error).message);
    res.status(502).json(errorResponse((err as Error).message, 'AGENT_ERROR'));
    return;
  }

  // Step 3: Translation layer (English -> user language).
  let localizedAnswer: string;
  try {
    localizedAnswer = await translationService.localize(agentResponse.reply, replyLanguage);
  } catch (err) {
    sendTranslationError(res, err);
    return;
  }

  /*
   * Step 4: Telegram layer (not activated yet)
   * if (chatId) {
   *   await telegramService.sendMessage({ chatId: String(chatId), text: localizedAnswer });
   * }
   */

  res.status(200).json(
    successResponse({
      language: replyLanguage,
      query: userQuestion,
      queryEnglish: understood.text,
      answer: localizedAnswer,
      answerEnglish: agentResponse.reply,
      chatId: chatId ?? null,
    })
  );
}
