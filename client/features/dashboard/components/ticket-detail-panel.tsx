'use client';

import React from 'react';
import { 
  X, 
  MapPin, 
  Languages, 
  Send, 
  CornerDownLeft, 
  AlertCircle,
  Clock,
  Info,
  IndianRupee,
  ShieldAlert,
  Calendar,
  TrendingUp
} from 'lucide-react';
import { Ticket } from '../types/dashboard.types';
import { useDashboardStore } from '@/stores/dashboard-store';
import { getStatusConfig, getPriorityTierConfig, getRootCauseLabel, formatDateTime, formatCurrencyINR } from '@/lib/utils';

interface TicketDetailPanelProps {
  tickets: Ticket[];
}

export function TicketDetailPanel({ tickets }: TicketDetailPanelProps) {
  const { selectedTicketId, isDetailPanelOpen, closeDetailPanel } = useDashboardStore();

  const ticket = tickets.find((t) => t.id === selectedTicketId);

  if (!isDetailPanelOpen || !ticket) {
    return null;
  }

  const status = getStatusConfig(ticket.state);
  const priority = getPriorityTierConfig(ticket.priority?.tier);

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={closeDetailPanel}
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-[2px] z-40 transition-opacity"
      />

      {/* Drawer Container */}
      <div className="fixed inset-y-0 right-0 max-w-xl w-full bg-white z-50 shadow-2xl flex flex-col border-l border-slate-200 animate-in slide-in-from-right duration-200">
        {/* Drawer Header */}
        <div className="p-5 border-b border-slate-200 bg-slate-50/90 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-bold border ${status.badgeBg} ${status.badgeText} ${status.border}`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${status.dotColor}`} />
                {status.label}
              </span>
              {ticket.priority && (
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] border ${priority.badgeBg} ${priority.badgeText} ${priority.border}`}
                >
                  {priority.label} (Score: {ticket.priority.score.toFixed(1)})
                </span>
              )}
              <span className="text-xs text-slate-400 font-mono">
                {ticket.merchant.id}
              </span>
            </div>
            <h3 className="text-xl font-extrabold text-[#0F2042] mt-2">
              {ticket.merchant.name}
            </h3>
            <div className="text-xs text-slate-600 flex items-center gap-2 mt-1">
              <span className="font-semibold text-slate-800">{ticket.merchant.business}</span>
              <span className="text-slate-300">•</span>
              <span className="flex items-center gap-1 text-slate-500">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                {ticket.merchant.city}
              </span>
            </div>
          </div>

          <button
            onClick={closeDetailPanel}
            className="p-1.5 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition cursor-pointer"
            title="Close panel"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5 text-xs text-slate-700">
          {/* Operational Case Summary */}
          <div className="bg-sky-50/70 border border-sky-200 rounded p-4">
            <div className="text-[11px] font-bold uppercase tracking-wider text-sky-900 mb-1.5 flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-sky-600" />
              <span>Operational Executive Summary</span>
            </div>
            <p className="text-xs leading-relaxed text-slate-900 font-medium">
              {ticket.summary}
            </p>
          </div>

          {/* Priority Insights (New Field from data.json) */}
          {ticket.priority && ticket.priority.reasons.length > 0 && (
            <div className="bg-amber-50/60 border border-amber-200 rounded p-4">
              <div className="text-[11px] font-bold uppercase tracking-wider text-amber-900 mb-2 flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-amber-600" />
                <span>Priority Scoring &amp; Classification Drivers</span>
              </div>
              <ul className="space-y-1.5">
                {ticket.priority.reasons.map((reason, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-xs font-semibold text-amber-950">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    <span>{reason}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Merchant Financial & Historical Profile (New Field from data.json) */}
          {ticket.merchant.history && (
            <div className="border border-slate-200 rounded p-4 bg-white shadow-2xs space-y-3">
              <div className="text-[11px] font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2">
                <IndianRupee className="w-3.5 h-3.5 text-blue-600" />
                <span>Merchant Business Profile &amp; Volume Telemetry</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                    Avg Monthly Volume
                  </span>
                  <span className="text-sm font-bold text-slate-900 mt-0.5 block">
                    {formatCurrencyINR(ticket.merchant.history.avg_monthly_volume)}
                  </span>
                </div>

                <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                    Money Owed / Held
                  </span>
                  <span className={`text-sm font-bold mt-0.5 block ${
                    ticket.merchant.history.money_owed > 0 ? 'text-rose-600' : 'text-emerald-700'
                  }`}>
                    {ticket.merchant.history.money_owed > 0
                      ? formatCurrencyINR(ticket.merchant.history.money_owed)
                      : 'None (₹0)'}
                  </span>
                </div>

                <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                    Lifetime Volume
                  </span>
                  <span className="text-sm font-bold text-slate-900 mt-0.5 block">
                    {formatCurrencyINR(ticket.merchant.history.lifetime_volume)}
                  </span>
                </div>

                <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                    Merchant Tenure
                  </span>
                  <span className="text-xs font-semibold text-slate-800 mt-0.5 block">
                    {ticket.merchant.history.tenure_months} months
                  </span>
                </div>

                <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                    Lifetime Txn Count
                  </span>
                  <span className="text-xs font-semibold text-slate-800 mt-0.5 block">
                    {ticket.merchant.history.lifetime_txn_count.toLocaleString('en-IN')} txns
                  </span>
                </div>

                <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                    Volume Trend
                  </span>
                  <span className={`text-xs font-bold mt-0.5 block flex items-center gap-1 ${
                    ticket.merchant.history.trend_pct >= 0 ? 'text-emerald-700' : 'text-rose-600'
                  }`}>
                    <TrendingUp className="w-3 h-3" />
                    {ticket.merchant.history.trend_pct >= 0 ? '+' : ''}{ticket.merchant.history.trend_pct}%
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Key Metric Indicators */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Root Cause Friction
              </span>
              <div className="text-sm font-bold text-[#002970] mt-1">
                {getRootCauseLabel(ticket.root_cause)}
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Dormancy State
              </span>
              <div className="text-sm font-bold text-slate-900 mt-1">
                {ticket.days_inactive} Days Inactive
                <span className="text-xs font-normal text-slate-500 ml-1">
                  ({ticket.dormancy_bucket}d+ tier)
                </span>
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Paytm System Ticket UUID
              </span>
              <div className="text-[11px] font-mono text-slate-700 font-semibold mt-1 break-all">
                {ticket.id}
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Channel &amp; Language
              </span>
              <div className="text-xs font-bold text-slate-800 mt-1 flex items-center gap-1.5">
                <Languages className="w-3.5 h-3.5 text-slate-400" />
                <span>{ticket.merchant.language}</span>
                {ticket.merchant.telegram_linked && (
                  <span className="px-1.5 py-0.2 rounded bg-sky-100 text-sky-800 text-[10px] font-semibold">
                    Telegram Linked
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Last Message Section */}
          <div className="border border-slate-200 rounded p-4.5 bg-white shadow-2xs space-y-3.5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2">
                {ticket.last_message.direction === 'out' ? (
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                    <Send className="w-3 h-3" /> Outbound (Paytm Reactivation AI)
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <CornerDownLeft className="w-3 h-3" /> Inbound (Merchant Reply)
                  </span>
                )}
                <span className="text-[11px] font-semibold text-slate-500">
                  Total Messages: {ticket.message_count}
                </span>
              </div>
              <span className="text-[11px] text-slate-400 font-mono">
                {formatDateTime(ticket.last_message.created_at)}
              </span>
            </div>

            {/* English Version */}
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">
                English Reference
              </div>
              <div className="p-3 rounded bg-slate-50 border border-slate-200 text-slate-800 leading-relaxed font-sans text-xs">
                {ticket.last_message.text_en}
              </div>
            </div>

            {/* Localized Version */}
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">
                Localized Sent / Received Text ({ticket.merchant.language})
              </div>
              <div className="p-3 rounded bg-sky-50/50 border border-sky-100 text-slate-900 leading-relaxed font-medium text-xs">
                {ticket.last_message.text_local}
              </div>
            </div>
          </div>

          {/* Lifecycle Timestamps */}
          <div className="border border-slate-200 rounded p-4 bg-slate-50/70 space-y-2.5">
            <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>Lifecycle Timeline (UTC)</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-2.5 bg-white rounded border border-slate-200">
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                  Opened At
                </span>
                <span className="font-mono text-slate-800 font-semibold mt-0.5 block">
                  {formatDateTime(ticket.opened_at)}
                </span>
              </div>
              <div className="p-2.5 bg-white rounded border border-slate-200">
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                  Updated At
                </span>
                <span className="font-mono text-slate-800 font-semibold mt-0.5 block">
                  {formatDateTime(ticket.updated_at)}
                </span>
              </div>
              <div className="p-2.5 bg-white rounded border border-slate-200">
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                  Closed At
                </span>
                <span className="font-mono text-slate-800 font-semibold mt-0.5 block">
                  {formatDateTime(ticket.closed_at)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Drawer Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
            <Info className="w-3.5 h-3.5 text-slate-400" />
            <span>Paytm Internal Record • Verified AI Action</span>
          </div>
          <button
            onClick={closeDetailPanel}
            className="px-3.5 py-1.5 rounded text-xs font-semibold bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 transition cursor-pointer shadow-2xs"
          >
            Close Panel
          </button>
        </div>
      </div>
    </>
  );
}
