import { TicketState } from '@/features/dashboard/types/dashboard.types';

export function formatDateTime(isoString: string | null | undefined): string {
  if (!isoString) return '—';
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    return new Intl.DateTimeFormat('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
      timeZone: 'UTC', // Retain clean UTC representation matching the server timestamp
    }).format(d) + ' UTC';
  } catch {
    return isoString;
  }
}

export function formatRelativeTime(isoString: string | null | undefined): string {
  if (!isoString) return '—';
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    return d.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
      timeZone: 'UTC',
    });
  } catch {
    return isoString;
  }
}

export function formatCurrencyINR(amount: number | null | undefined): string {
  if (amount === undefined || amount === null) return '—';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function getStatusConfig(state: TicketState): {
  label: string;
  badgeBg: string;
  badgeText: string;
  border: string;
  dotColor: string;
} {
  switch (state) {
    case 'RESOLVED':
      return {
        label: 'Resolved',
        badgeBg: 'bg-emerald-50',
        badgeText: 'text-emerald-700',
        border: 'border-emerald-200',
        dotColor: 'bg-emerald-500',
      };
    case 'ESCALATED':
      return {
        label: 'Escalated',
        badgeBg: 'bg-amber-50',
        badgeText: 'text-amber-800',
        border: 'border-amber-200',
        dotColor: 'bg-amber-500',
      };
    case 'NO_RESPONSE':
      return {
        label: 'No Response',
        badgeBg: 'bg-slate-100',
        badgeText: 'text-slate-700',
        border: 'border-slate-200',
        dotColor: 'bg-slate-400',
      };
    case 'IN_CONVERSATION':
      return {
        label: 'In Conversation',
        badgeBg: 'bg-sky-50',
        badgeText: 'text-sky-700',
        border: 'border-sky-200',
        dotColor: 'bg-sky-500',
      };
    case 'CONTACTED':
      return {
        label: 'Contacted',
        badgeBg: 'bg-indigo-50',
        badgeText: 'text-indigo-700',
        border: 'border-indigo-200',
        dotColor: 'bg-indigo-500',
      };
    default:
      return {
        label: state,
        badgeBg: 'bg-gray-100',
        badgeText: 'text-gray-700',
        border: 'border-gray-200',
        dotColor: 'bg-gray-400',
      };
  }
}

export function getPriorityTierConfig(tier?: 'P1' | 'P2' | 'P3'): {
  label: string;
  badgeBg: string;
  badgeText: string;
  border: string;
} {
  switch (tier) {
    case 'P1':
      return {
        label: 'P1 High',
        badgeBg: 'bg-rose-50',
        badgeText: 'text-rose-700 font-bold',
        border: 'border-rose-200',
      };
    case 'P2':
      return {
        label: 'P2 Medium',
        badgeBg: 'bg-amber-50',
        badgeText: 'text-amber-700 font-semibold',
        border: 'border-amber-200',
      };
    case 'P3':
      return {
        label: 'P3 Standard',
        badgeBg: 'bg-slate-50',
        badgeText: 'text-slate-600',
        border: 'border-slate-200',
      };
    default:
      return {
        label: '—',
        badgeBg: 'bg-slate-50',
        badgeText: 'text-slate-500',
        border: 'border-slate-200',
      };
  }
}

export function getRootCauseLabel(cause: string): string {
  const map: Record<string, string> = {
    stuck_payout: 'Stuck Payout',
    failed_transaction: 'Failed Transaction',
    kyc_pending: 'KYC Pending',
    settlement_on_hold: 'Settlement On Hold',
    lost_interest: 'Lost Interest',
    stuck_transaction: 'Stuck Transaction',
  };
  return map[cause] || cause.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}
