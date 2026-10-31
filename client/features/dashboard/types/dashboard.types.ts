export type TicketState =
  | 'RESOLVED'
  | 'ESCALATED'
  | 'NO_RESPONSE'
  | 'IN_CONVERSATION'
  | 'CONTACTED';

export type RootCauseType =
  | 'stuck_payout'
  | 'failed_transaction'
  | 'kyc_pending'
  | 'settlement_on_hold'
  | 'lost_interest'
  | 'stuck_transaction';

export interface MerchantHistory {
  joined_at: string;
  tenure_months: number;
  lifetime_volume: number;
  lifetime_txn_count: number;
  avg_monthly_volume: number;
  trend_pct: number;
  money_owed: number;
}

export interface Merchant {
  id: string;
  name: string;
  business: string;
  city: string;
  language: string;
  telegram_linked: boolean;
  history?: MerchantHistory;
}

export interface LastMessage {
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
  state: TicketState;
  root_cause: RootCauseType | string;
  summary: string;
  opened_at: string;
  updated_at: string;
  closed_at: string | null;
  days_inactive: number;
  priority?: TicketPriority;
  merchant: Merchant;
  message_count: number;
  last_message: LastMessage;
}

export interface DashboardStats {
  open_tickets: number;
  resolved: number;
  escalated: number;
  no_response: number;
  total: number;
  resolution_rate_pct: number;
  avg_minutes_to_resolve: number;
  messages_out: number;
  messages_in: number;
  localized_pct: number;
  monthly_volume_at_risk?: number;
  monthly_volume_recovered?: number;
}

export interface RootCauseItem {
  root_cause: RootCauseType | string;
  count: number;
}

export interface DashboardResponse {
  generated_at: string;
  stats: DashboardStats;
  priority_tiers?: Record<string, number>;
  root_causes: RootCauseItem[];
  tickets: Ticket[];
}
