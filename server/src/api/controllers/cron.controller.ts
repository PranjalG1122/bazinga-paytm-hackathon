import { Request, Response, NextFunction } from 'express';
import { successResponse } from '../../utils/response.js';
import { sendTelegramMessage } from '../../layers/telegram/telegram.service.js';
import { getMockDatabaseData, Ticket } from '../../data/data.service.js';
import { setTelegramConversationContext } from '../../layers/telegram/telegram-context.service.js';

export interface CronRunOptions {
  chatId?: string | number;
  message?: string;
  dormancyThresholdDays?: number;
  batchSize?: number;
  dryRun?: boolean;
  merchantId?: string;
}

const DEFAULT_OUTREACH_MESSAGE = 'Hello, how can PayTM help you today?';

export interface ProcessedAccountResult {
  merchantId: string;
  merchantName: string;
  business: string;
  city: string;
  daysInactive: number;
  rootCause: string;
  language: string;
  priorityTier?: string;
  telegramLinked: boolean;
  moneyOwed: number;
  outreachMessage: string;
  notified: boolean;
}

/**
 * Cron Job API:
 * Triggered periodically (or on demand).
 *
 * Flow:
 * 1. Fetches merchant account records from mock data (data.json) where days_inactive >= dormancyThresholdDays (default 30 days).
 * 2. Prepares proactive intervention details using the account/ticket metadata.
 * 3. Sends Telegram notification(s) via the Telegram layer to linked merchants / active chat.
 */
export async function runDormancyCron(
  req: Request<unknown, unknown, CronRunOptions>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const {
      chatId = process.env.TELEGRAM_DEFAULT_CHAT_ID,
      message,
      dormancyThresholdDays = 30,
      batchSize = 100,
      dryRun = false,
      merchantId,
    } = req.body || {};

    // 1. Fetch data from mock database
    const dbData = getMockDatabaseData();
    const allTickets: Ticket[] = dbData.tickets || [];

    // Select linked accounts inactive for at least the configured threshold.
    const dormantAccounts = allTickets
      .filter(
        (ticket) =>
          ticket.days_inactive >= dormancyThresholdDays &&
          ticket.merchant.telegram_linked &&
          (!merchantId || ticket.merchant.id === merchantId)
      )
      .slice(0, batchSize);

    // 2. Process accounts and determine notifications
    const targetChatId = chatId ? String(chatId).trim() : undefined;
    let telegramSent = false;
    let sentCount = 0;

    const processedResults: ProcessedAccountResult[] = dormantAccounts.map((ticket) => {
      const merchant = ticket.merchant;
      const outreachText = message || ticket.last_message?.text_local || ticket.last_message?.text_en || DEFAULT_OUTREACH_MESSAGE;

      return {
        merchantId: merchant.id,
        merchantName: merchant.name,
        business: merchant.business,
        city: merchant.city,
        daysInactive: ticket.days_inactive,
        rootCause: ticket.root_cause,
        language: merchant.language,
        priorityTier: ticket.priority?.tier,
        telegramLinked: merchant.telegram_linked,
        moneyOwed: merchant.history?.money_owed ?? 0,
        outreachMessage: outreachText,
        notified: false,
      };
    });

    // 3. Dispatch Telegram notifications
    const selectedTicket = dormantAccounts[0];
    const selectedResult = processedResults[0];
    if (!dryRun && targetChatId && selectedTicket && selectedResult) {
      setTelegramConversationContext(targetChatId, {
        ticketId: selectedTicket.id,
        merchantId: selectedTicket.merchant.id,
        merchantName: selectedTicket.merchant.name,
        business: selectedTicket.merchant.business,
        city: selectedTicket.merchant.city,
        preferredLanguage: selectedTicket.merchant.language,
        daysInactive: selectedTicket.days_inactive,
        rootCause: selectedTicket.root_cause,
        summary: selectedTicket.summary,
        priority: selectedTicket.priority,
        moneyOwed: selectedTicket.merchant.history?.money_owed ?? 0,
      });
      await sendTelegramMessage(targetChatId, selectedResult.outreachMessage);
      telegramSent = true;
      sentCount = 1;
      selectedResult.notified = true;
    }

    res.status(200).json(
      successResponse({
        message: 'Dormancy cron job triggered and processed successfully using mock dataset.',
        summary: {
          totalAccountsFound: allTickets.length,
          dormantAccountsFiltered: dormantAccounts.length,
          notificationsDispatched: sentCount,
          targetChatId: targetChatId ?? null,
        },
        telegramNotification: {
          sent: telegramSent,
          targetChatId: targetChatId ?? null,
          message: telegramSent
            ? selectedResult?.outreachMessage
            : 'Skipped (no eligible account or no chatId provided)',
        },
        config: {
          dormancyThresholdDays,
          batchSize,
          dryRun,
          merchantId: merchantId ?? null,
        },
        dormantAccounts: processedResults,
      })
    );
  } catch (error) {
    next(error);
  }
}
