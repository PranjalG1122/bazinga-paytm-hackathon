import { Request, Response } from 'express';
import { successResponse, errorResponse } from '../../utils/response.js';
// Import services for the layers once ready to be activated:
// import { translationService } from '../../layers/translation/translation.service.js';
// import { agentService } from '../../layers/agent/agent.service.js';
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

  /*
   * ===========================================================================
   * LAYER PIPELINE EXECUTION (Commented out until layers are fully ready)
   * ===========================================================================
   *
   * // Step 1: Send user question to Translation Layer
   * // Translates from the user's source language (e.g., Hindi, Spanish) to English.
   * const translationToAgent = await translationService.translate({
   *   text: userQuestion,
   *   sourceLanguage: language !== 'auto' ? language : undefined,
   *   targetLanguage: 'en',
   * });
   * const agentQuery = translationToAgent.translatedText;
   *
   * // Step 2: Send translated question to Agent Layer
   * // Agent processes the prompt and returns a response.
   * const agentResponse = await agentService.sendMessage({
   *   message: agentQuery,
   *   userId: userId,
   *   conversationId: chatId ? String(chatId) : undefined,
   *   metadata,
   * });
   * const rawAgentReply = agentResponse.reply;
   *
   * // Step 3: Send Agent response to Translation Layer
   * // Translates the reply back from English to the user's original language.
   * const targetLang = language && language !== 'auto' ? language : translationToAgent.sourceLanguage;
   * const translationToUser = await translationService.translate({
   *   text: rawAgentReply,
   *   sourceLanguage: 'en',
   *   targetLanguage: targetLang,
   * });
   * const finalLocalizedReply = translationToUser.translatedText;
   *
   * // Step 4: Send the localized response to Telegram Layer
   * if (chatId) {
   *   await telegramService.sendMessage({
   *     chatId: String(chatId),
   *     text: finalLocalizedReply,
   *   });
   * }
   * ===========================================================================
   */

  res.status(200).json(
    successResponse({
      message: 'Query received successfully. Pipeline layers are configured and will be connected upon completion.',
      query: userQuestion,
      language,
      chatId: chatId ?? null,
      pipeline: [
        '1. Translation Layer (User language -> Agent language)',
        '2. Agent Layer (Process query & generate response)',
        '3. Translation Layer (Agent response -> User language)',
        '4. Telegram Layer (Deliver response to Telegram)',
      ],
    })
  );
}
