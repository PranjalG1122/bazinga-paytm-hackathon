import fs from 'fs';
import path from 'path';

export interface TicketMerchantHistory {
  joined_at: string;
  tenure_months: number;
  lifetime_volume: number;
  lifetime_txn_count: number;
  avg_monthly_volume: number;
  trend_pct: number;
  money_owed: number;
}

export interface TicketMerchant {
  id: string;
  name: string;
  business: string;
  city: string;
  language: string;
  telegram_linked: boolean;
  history?: TicketMerchantHistory;
}

export interface TicketLastMessage {
  direction: 'in' | 'out';
  text_en: string;
  text_local: string;
  created_at: string;
}

export interface TicketPriority {
  score: number;
  tier: 'P1' | 'P2' | 'P3';
  reasons: string[];
}

export interface Ticket {
  id: string;
  dormancy_bucket: number;
  state: 'IN_CONVERSATION' | 'CONTACTED' | 'RESOLVED' | 'NO_RESPONSE' | 'ESCALATED';
  root_cause: string;
  summary: string;
  opened_at: string;
  updated_at: string;
  closed_at: string | null;
  days_inactive: number;
  priority?: TicketPriority;
  merchant: TicketMerchant;
  message_count: number;
  last_message: TicketLastMessage;
}

export interface MockDashboardData {
  generated_at: string;
  stats: Record<string, unknown>;
  priority_tiers?: Record<string, number>;
  root_causes: Array<{ root_cause: string; count: number }>;
  tickets: Ticket[];
}

let cachedData: MockDashboardData | null = null;

/**
 * Returns the mock data loaded from data.json.
 */
export function getMockDatabaseData(): MockDashboardData {
  if (cachedData) {
    return cachedData;
  }

  // Find data.json regardless of whether running from src/ or dist/
  const candidatePaths = [
    path.resolve(process.cwd(), 'src/data/data.json'),
    path.resolve(process.cwd(), 'server/src/data/data.json'),
    path.resolve(__dirname, 'data.json'),
    path.resolve(__dirname, '../../src/data/data.json'),
  ];

  for (const candidate of candidatePaths) {
    if (fs.existsSync(candidate)) {
      const content = fs.readFileSync(candidate, 'utf-8');
      cachedData = JSON.parse(content) as MockDashboardData;
      return cachedData;
    }
  }

  throw new Error('Could not find data.json mock data file');
}
