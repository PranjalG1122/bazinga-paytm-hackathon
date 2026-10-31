/**
 * Correlates a proactive Telegram outreach with subsequent replies.
 * This in-memory implementation is appropriate for the POC; replace it with
 * Redis/a database before running multiple server instances.
 */
const contextByChatId = new Map<string, Record<string, unknown>>();

export function setTelegramConversationContext(
  chatId: string | number,
  context: Record<string, unknown>
): void {
  contextByChatId.set(String(chatId), context);
}

export function getTelegramConversationContext(
  chatId: string | number
): Record<string, unknown> | undefined {
  return contextByChatId.get(String(chatId));
}

export function clearTelegramConversationContext(chatId: string | number): void {
  contextByChatId.delete(String(chatId));
}
