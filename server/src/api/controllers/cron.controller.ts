import { Request, Response, NextFunction } from 'express';
import { successResponse } from '../../utils/response.js';
import { sendTelegramMessage } from '../../layers/telegram/telegram.service.js';
import { getMockDatabaseData, Ticket } from '../../data/data.service.js';

export interface CronRunOptions {
  chatId?: string | number;
  message?: string;
  dormancyThresholdDays?: number;
  batchSize?: number;
  dryRun?: boolean;
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
      message = DEFAULT_OUTREACH_MESSAGE,
      dormancyThresholdDays = 30,
      batchSize = 100,
      dryRun = false,
    } = req.body || {};

    // 1. Fetch data from mock database
    const dbData = getMockDatabaseData();
    const allTickets: Ticket[] = dbData.tickets || [];

    // Filter accounts inactive for > 1 month (> dormancyThresholdDays)
    const dormantAccounts = allTickets
      .filter((ticket) => ticket.days_inactive >= dormancyThresholdDays && ticket.merchant.telegram_linked)
      .slice(0, batchSize);

    // 2. Process accounts and determine notifications
    const targetChatId = chatId ? String(chatId).trim() : undefined;
    let telegramSent = false;
    let sentCount = 0;

    const processedResults: ProcessedAccountResult[] = dormantAccounts.map((ticket) => {
      const merchant = ticket.merchant;
      const outreachText = ticket.last_message?.text_en || message;

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
    if (!dryRun && targetChatId) {
      // Send outreach notification for the cron trigger
      await sendTelegramMessage(targetChatId, message);
      telegramSent = true;
      sentCount = 1;
      if (processedResults.length > 0) {
        processedResults[0].notified = true;
      }
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
          message: targetChatId ? message : 'Skipped (no chatId provided in request body or TELEGRAM_DEFAULT_CHAT_ID)',
        },
        config: {
          dormancyThresholdDays,
          batchSize,
          dryRun,
        },
        dormantAccounts: processedResults,
      })
    );
  } catch (error) {
    next(error);
  }
}
