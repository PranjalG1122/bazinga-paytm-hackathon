'use client';

import React from 'react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  HelpCircle, 
  Layers, 
  Clock, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Globe,
  Activity,
  IndianRupee,
  ShieldAlert
} from 'lucide-react';
import { DashboardStats } from '../types/dashboard.types';
import { useDashboardStore } from '@/stores/dashboard-store';
import { formatCurrencyINR } from '@/lib/utils';

interface MetricsGridProps {
  stats: DashboardStats;
  priorityTiers?: Record<string, number>;
}

export function MetricsGrid({ stats, priorityTiers }: MetricsGridProps) {
  const { statusFilter, setStatusFilter } = useDashboardStore();

  return (
    <div className="space-y-4">
      {/* Financial Exposure & Recovery Overview */}
      {(stats.monthly_volume_at_risk !== undefined || stats.monthly_volume_recovered !== undefined) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-2xs flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center font-bold border border-rose-100">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  Monthly Volume At Risk
                </span>
                <div className="text-2xl font-bold text-slate-900 tracking-tight">
                  {formatCurrencyINR(stats.monthly_volume_at_risk)}
                </div>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] px-2 py-0.5 rounded bg-rose-50 text-rose-700 font-semibold border border-rose-200/60">
                Dormant Exposure
              </span>
              <p className="text-[11px] text-slate-400 mt-1">Pending triage</p>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-2xs flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold border border-emerald-100">
                <IndianRupee className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  Monthly Volume Recovered
                </span>
                <div className="text-2xl font-bold text-slate-900 tracking-tight">
                  {formatCurrencyINR(stats.monthly_volume_recovered)}
                </div>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200/60">
                Reactivated
              </span>
              <p className="text-[11px] text-slate-400 mt-1">Restored to Paytm</p>
            </div>
          </div>
        </div>
      )}

      {/* Primary KPI Header row */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <h2 className="text-sm font-bold text-slate-900">Workstream Performance</h2>
          <p className="text-xs text-slate-500">Autonomous ticket resolution and merchant cohort breakdown</p>
        </div>
        {statusFilter && (
          <button
            onClick={() => setStatusFilter(null)}
            className="text-xs text-sky-600 hover:text-sky-800 font-medium cursor-pointer"
          >
            Clear status filter
          </button>
        )}
      </div>

      {/* 5 Primary Status Metric Cards (Clean, neutral card design with subtle colored accents) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {/* Open Tickets */}
        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                Open Tickets
              </span>
              <div className="p-1 rounded bg-slate-50 text-slate-500 border border-slate-100">
                <Layers className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900 tracking-tight">
              {stats.open_tickets}
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>In pipeline</span>
            <span className="font-medium text-slate-700">
              {((stats.open_tickets / stats.total) * 100).toFixed(0)}%
            </span>
          </div>
        </div>

        {/* Resolved */}
        <button
          onClick={() => setStatusFilter('RESOLVED')}
          className={`text-left p-3.5 rounded-lg border transition cursor-pointer shadow-2xs flex flex-col justify-between ${
            statusFilter === 'RESOLVED'
              ? 'bg-slate-50 border-slate-400 ring-1 ring-slate-400'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div>
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-600">
                Resolved
              </span>
              <div className="p-1 rounded bg-emerald-50 text-emerald-600">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900 tracking-tight">
              {stats.resolved}
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Resolution</span>
            <span className="font-semibold text-emerald-700">{stats.resolution_rate_pct.toFixed(0)}%</span>
          </div>
        </button>

        {/* Escalated */}
        <button
          onClick={() => setStatusFilter('ESCALATED')}
          className={`text-left p-3.5 rounded-lg border transition cursor-pointer shadow-2xs flex flex-col justify-between ${
            statusFilter === 'ESCALATED'
              ? 'bg-slate-50 border-slate-400 ring-1 ring-slate-400'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div>
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-600">
                Escalated
              </span>
              <div className="p-1 rounded bg-amber-50 text-amber-600">
                <AlertTriangle className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900 tracking-tight">
              {stats.escalated}
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Human Review</span>
            <span className="font-semibold text-amber-700">
              {((stats.escalated / stats.total) * 100).toFixed(0)}%
            </span>
          </div>
        </button>

        {/* No Response */}
        <button
          onClick={() => setStatusFilter('NO_RESPONSE')}
          className={`text-left p-3.5 rounded-lg border transition cursor-pointer shadow-2xs flex flex-col justify-between ${
            statusFilter === 'NO_RESPONSE'
              ? 'bg-slate-50 border-slate-400 ring-1 ring-slate-400'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div>
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-600">
                No Response
              </span>
              <div className="p-1 rounded bg-slate-100 text-slate-500">
                <HelpCircle className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900 tracking-tight">
              {stats.no_response}
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Follow-up done</span>
            <span className="font-medium text-slate-600">
              {((stats.no_response / stats.total) * 100).toFixed(0)}%
            </span>
          </div>
        </button>

        {/* Total Handled */}
        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-600">
                Total Cohort
              </span>
              <div className="p-1 rounded bg-slate-100 text-slate-600">
                <Activity className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900 tracking-tight">
              {stats.total}
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>High Priority (P1)</span>
            <span className="font-semibold text-rose-700">
              {priorityTiers?.['P1'] ?? 0}
            </span>
          </div>
        </div>
      </div>

      {/* Operational Efficiency & Communication KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Resolution Rate */}
        <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-2xs flex items-center justify-between">
          <div>
            <div className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
              Resolution Rate
            </div>
            <div className="text-base font-bold text-slate-900 mt-0.5">
              {stats.resolution_rate_pct.toFixed(1)}%
            </div>
          </div>
          <span className="text-[10px] font-medium text-slate-500 bg-slate-50 px-2 py-0.5 rounded border border-slate-200/60">
            &gt;25% benchmark
          </span>
        </div>

        {/* Avg Resolution Duration */}
        <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-2xs flex items-center justify-between">
          <div>
            <div className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
              Avg Resolution SLA
            </div>
            <div className="text-base font-bold text-slate-900 mt-0.5">
              {stats.avg_minutes_to_resolve.toFixed(1)} mins
            </div>
          </div>
          <Clock className="w-4 h-4 text-slate-400" />
        </div>

        {/* Message Exchange In / Out */}
        <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-2xs flex items-center justify-between">
          <div>
            <div className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
              Messages Out / In
            </div>
            <div className="text-base font-bold text-slate-900 mt-0.5">
              {stats.messages_out} <span className="text-slate-300 font-light">/</span> {stats.messages_in}
            </div>
          </div>
          <span className="text-[10px] font-medium text-slate-500">
            {(stats.messages_out / stats.messages_in).toFixed(1)}:1
          </span>
        </div>

        {/* Localized Percentage */}
        <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-2xs flex items-center justify-between">
          <div>
            <div className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
              Indic Localization
            </div>
            <div className="text-base font-bold text-slate-900 mt-0.5">
              {stats.localized_pct.toFixed(0)}% Native
            </div>
          </div>
          <Globe className="w-4 h-4 text-slate-400" />
        </div>
      </div>
    </div>
  );
}
