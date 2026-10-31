import { Request, Response, NextFunction } from "express";
import { successResponse } from "../../utils/response.js";
import { ValidationError } from "../../utils/errors.js";
import { translationService } from '../../layers/translation/translation.service.js';
import { agentService } from '../../layers/agent/agent.service.js';
import { sendTelegramMessage } from '../../layers/telegram/telegram.service.js';
import { getTelegramConversationContext } from '../../layers/telegram/telegram-context.service.js';

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
  detectedLanguage: string;
  agentReply: string;
  localizedReply: string;
  pipeline: string[];
}

const PROCESSING_MESSAGE = 'Thank you. Your request is being processed.';

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

  const merchantContext = metadata || getTelegramConversationContext(chatId);
  const preferredLanguage =
    language === 'auto' && typeof merchantContext?.preferredLanguage === 'string'
      ? merchantContext.preferredLanguage
      : language;

  // Translate the merchant's message into the language Hermes operates in.
  const understood = await translationService.understand(message.trim(), preferredLanguage);
  const detectedLanguage = understood.language || language;

  // Acknowledge immediately before the potentially long-running agent turn.
  const processingReply = await translationService.localize(PROCESSING_MESSAGE, detectedLanguage);
  await sendTelegramMessage(chatId, processingReply);

  const context = merchantContext
    ? `\n\nMerchant context (trusted application data):\n${JSON.stringify(merchantContext)}`
    : '';
  let agentResponse;
  let localizedReply: string;
  try {
    agentResponse = await agentService.sendMessage({
      message: `${understood.text}${context}`,
      userId: userId ? String(userId) : String(chatId),
      sessionId: `telegram-${String(chatId)}`,
      metadata: merchantContext,
    });

    localizedReply = await translationService.localize(agentResponse.reply, detectedLanguage);
    await sendTelegramMessage(chatId, localizedReply);
  } catch (error) {
    const fallback = 'Sorry, we could not complete your request right now. A support agent will follow up.';
    try {
      const localizedFallback = await translationService.localize(fallback, detectedLanguage);
      await sendTelegramMessage(chatId, localizedFallback);
    } catch (notificationError) {
      console.error('[Response Workflow] Failed to send failure notification', notificationError);
    }
    throw error;
  }

  return {
    message: "Response flow processed successfully.",
    chatId,
    receivedMessage: message,
    detectedLanguage,
    agentReply: agentResponse.reply,
    localizedReply,
    pipeline: [
      "1. Translation Layer (Detect language & translate to English)",
      "2. Telegram Layer (Send localized processing acknowledgement)",
      "3. Hermes Agent Layer (Process query, choose tools, or escalate)",
      "4. Translation Layer (Translate response back to user language)",
      "5. Telegram Layer (Send final localized message)",
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
