'use client';

import React from 'react';
import Image from 'next/image';
import { 
  RefreshCw, 
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { formatDateTime } from '@/lib/utils';
import { useDashboardStore } from '@/stores/dashboard-store';

interface HeaderProps {
  generatedAt?: string;
  isFetching: boolean;
  onRefresh: () => void;
  openCount: number;
  resolvedCount: number;
  escalatedCount: number;
  resolutionRate: number;
}

export function Header({
  generatedAt,
  isFetching,
  onRefresh,
  openCount,
  resolvedCount,
  escalatedCount,
  resolutionRate,
}: HeaderProps) {
  const { setStatusFilter } = useDashboardStore();

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      {/* Top Banner / Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        {/* Left: Branding with Wapsi logo */}
        <div className="flex items-center gap-3">
          <div className="relative w-9 h-9 rounded-lg overflow-hidden border border-slate-200/80 shadow-xs flex-shrink-0 bg-[#002970]">
            <Image
              src="/logo.svg"
              alt="Wapsi Logo"
              width={36}
              height={36}
              className="w-full h-full object-contain"
              priority
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight text-slate-900">
                Wapsi
              </h1>
              <span className="text-slate-300 font-light text-sm">/</span>
              <span className="text-xs font-semibold text-slate-600">
                Paytm Merchant Retention Control Room
              </span>
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/70">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Engine
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Autonomous Indic multilingual intervention and payout recovery
            </p>
          </div>
        </div>

        {/* Right: Snapshot Timestamp & Actions */}
        <div className="flex items-center gap-3 self-end md:self-auto">
          {generatedAt && (
            <div className="text-right hidden lg:block">
              <div className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
                Telemetry As Of
              </div>
              <div className="text-xs font-medium text-slate-700 font-mono">
                {formatDateTime(generatedAt)}
              </div>
            </div>
          )}

          <button
            onClick={onRefresh}
            disabled={isFetching}
            title="Refresh dashboard data"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 shadow-2xs active:bg-slate-200 disabled:opacity-50 transition cursor-pointer"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${
                isFetching ? 'animate-spin text-sky-600' : 'text-slate-600'
              }`}
            />
            <span>{isFetching ? 'Syncing...' : 'Refresh'}</span>
          </button>
        </div>
      </div>

      {/* Control Room Live Ribbon / Quick Glance Bar */}
      <div className="bg-slate-50/80 border-t border-slate-200/70 px-4 sm:px-6 lg:px-8 py-2">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
          {/* Quick Filter Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-slate-400 font-medium text-[11px] uppercase tracking-wider mr-1">
              Quick Filter:
            </span>
            <button
              onClick={() => setStatusFilter(null)}
              className="px-2 py-0.5 rounded text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 transition cursor-pointer"
            >
              All
            </button>
            <button
              onClick={() => setStatusFilter('IN_CONVERSATION')}
              className="px-2 py-0.5 rounded text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 transition cursor-pointer flex items-center gap-1"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
              In Conversation
            </button>
            <button
              onClick={() => setStatusFilter('ESCALATED')}
              className="px-2 py-0.5 rounded text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 transition cursor-pointer flex items-center gap-1"
            >
              <AlertTriangle className="w-3 h-3 text-amber-500" />
              Escalated ({escalatedCount})
            </button>
            <button
              onClick={() => setStatusFilter('RESOLVED')}
              className="px-2 py-0.5 rounded text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 transition cursor-pointer flex items-center gap-1"
            >
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              Resolved ({resolvedCount})
            </button>
          </div>

          {/* Quick Metrics Bar */}
          <div className="flex items-center gap-4 text-[11px] text-slate-500">
            <div>
              <span>Open: </span>
              <strong className="text-slate-800 font-semibold">{openCount}</strong>
            </div>
            <span className="text-slate-300">•</span>
            <div>
              <span>Escalated: </span>
              <strong className="text-amber-700 font-semibold">{escalatedCount}</strong>
            </div>
            <span className="text-slate-300">•</span>
            <div>
              <span>Resolution Rate: </span>
              <strong className="text-emerald-700 font-semibold">
                {resolutionRate.toFixed(0)}%
              </strong>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
