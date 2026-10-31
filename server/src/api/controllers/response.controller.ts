import { Request, Response, NextFunction } from "express";
import { successResponse } from "../../utils/response.js";
import { ValidationError } from "../../utils/errors.js";
// Import services when ready:
// import { translationService } from '../../layers/translation/translation.service.js';
// import { agentService } from '../../layers/agent/agent.service.js';
// import { notifySlack } from '../../layers/slack/slack.service.js';
// import { telegramService } from '../../layers/telegram/telegram.service.js';

export interface TelegramIncomingMessageBody {
  chatId: string | number;
  message: string;
  userId?: string;
  language?: string;
  metadata?: Record<string, unknown>;
}

export interface InternalResponseResult {
  message: string;
  chatId: string | number;
  receivedMessage: string;
  pipeline: string[];
}

/**
 * Core business workflow for merchant incoming messages.
 * Callable internally by the Telegram webhook or externally via HTTP.
 */
export async function executeResponseWorkflow(
  body: TelegramIncomingMessageBody
): Promise<InternalResponseResult> {
  const { chatId, message, userId, language = "auto", metadata } = body || {};

  if (!message || typeof message !== "string" || !message.trim()) {
    throw new ValidationError("A non-empty `message` string is required.");
  }

  if (!chatId) {
    throw new ValidationError("A valid `chatId` is required.");
  }

  console.log(`[Response Workflow] Processing incoming message from chatId=${chatId}: "${message.slice(0, 60)}"`);

  /*
   * -------------------------------------------------------------------------
   * STEP 1: TRANSLATION LAYER (Detect language & translate incoming -> English)
   * -------------------------------------------------------------------------
   * const understood = await translationService.understand(message, language);
   * const detectedLanguage = understood.language;
   * const englishMessage = understood.text;
   */

  /*
   * -------------------------------------------------------------------------
   * STEP 2: AGENT LAYER (Process query in English)
   * -------------------------------------------------------------------------
   * const agentResponse = await agentService.sendMessage({
   *   message: englishMessage,
   *   userId: userId ? String(userId) : String(chatId),
   *   sessionId: String(chatId),
   *   metadata,
   * });
   * const rawAgentReply = agentResponse.reply;
   */

  /*
   * -------------------------------------------------------------------------
   * STEP 3: SLACK LAYER (Notify Slack conditionally based on agent output)
   * -------------------------------------------------------------------------
   * const shouldEscalate = agentResponse.action === 'ESCALATE' || metadata?.escalate;
   * if (shouldEscalate) {
   *   await notifySlack(`[Alert] Escalation needed for merchant ${chatId}: ${rawAgentReply}`);
   * }
   */

  /*
   * -------------------------------------------------------------------------
   * STEP 4: TRANSLATION LAYER (Translate agent reply back to initial language)
   * -------------------------------------------------------------------------
   * const localizedReply = await translationService.localize(rawAgentReply, detectedLanguage);
   */

  /*
   * -------------------------------------------------------------------------
   * STEP 5: TELEGRAM LAYER (Send localized reply to user)
   * -------------------------------------------------------------------------
   * await telegramService.sendMessage({
   *   chatId: String(chatId),
   *   text: localizedReply,
   * });
   */

  return {
    message: "Response flow processed successfully.",
    chatId,
    receivedMessage: message,
    pipeline: [
      "1. Translation Layer (Detect language & translate to English)",
      "2. Agent Layer (Process query & decide action)",
      "3. Slack Layer (Conditional notification/escalation)",
      "4. Translation Layer (Translate response back to user language)",
      "5. Telegram Layer (Send final localized message to Telegram)",
    ],
  };
}

/**
 * Response API:
 * Triggered when a merchant responds to a Telegram message via HTTP POST.
 */
export async function handleResponse(
  req: Request<unknown, unknown, TelegramIncomingMessageBody>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const result = await executeResponseWorkflow(req.body);
    res.status(200).json(successResponse(result));
  } catch (error) {
    next(error);
  }
}
