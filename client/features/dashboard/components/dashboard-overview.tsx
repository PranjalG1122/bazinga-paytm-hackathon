'use client';

import React from 'react';
import { useDashboard } from '../hooks/use-dashboard';
import { Header } from './header';
import { MetricsGrid } from './metrics-grid';
import { RootCauseBreakdown } from './root-cause-breakdown';
import { TicketTable } from './ticket-table';
import { TicketDetailPanel } from './ticket-detail-panel';
import { AlertCircle, RefreshCw, ShieldCheck } from 'lucide-react';
import Image from 'next/image';

export function DashboardOverview() {
  const { data, isLoading, isError, error, isFetching, refetch } = useDashboard();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="w-12 h-12 rounded-xl bg-[#002970] overflow-hidden flex items-center justify-center shadow-sm">
            <Image
              src="/logo.svg"
              alt="Wapsi Logo"
              width={48}
              height={48}
              className="w-full h-full object-contain"
              priority
            />
          </div>
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
            <RefreshCw className="w-4 h-4 animate-spin text-sky-500" />
            Loading Wapsi Control Room...
          </div>
          <p className="text-xs text-slate-400">Loading merchant records &amp; autonomous recovery telemetry</p>
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-6">
        <div className="max-w-md w-full bg-white border border-rose-200 rounded-lg p-6 shadow-sm text-center">
          <div className="w-11 h-11 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-3">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 mb-1">Telemetry Sync Failed</h3>
          <p className="text-xs text-slate-500 mb-4">
            {error?.message || 'Could not connect to the operations data provider.'}
          </p>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 rounded-md text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 transition cursor-pointer"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans text-slate-900">
      {/* Top Header & Live Ops Bar */}
      <Header
        generatedAt={data.generated_at}
        isFetching={isFetching}
        onRefresh={() => refetch()}
        openCount={data.stats.open_tickets}
        resolvedCount={data.stats.resolved}
        escalatedCount={data.stats.escalated}
        resolutionRate={data.stats.resolution_rate_pct}
      />

      {/* Main Operations Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Metric Cards Grid */}
        <MetricsGrid
          stats={data.stats}
          priorityTiers={data.priority_tiers}
        />

        {/* Root Cause Analytics Breakdown */}
        <RootCauseBreakdown
          rootCauses={data.root_causes}
          totalTickets={data.stats.total}
        />

        {/* Operational Ticket Queue with Advanced Prioritization Filters */}
        <TicketTable tickets={data.tickets} />
      </main>

      {/* Drilldown Slide-out Drawer */}
      <TicketDetailPanel tickets={data.tickets} />

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-3.5 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-slate-400 gap-2">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span className="font-semibold text-slate-600">Wapsi Merchant Reactivation</span>
            <span>•</span>
            <span>Paytm Indic Ops AI</span>
          </div>
          <div>Cohort: 30d+ Dormant Merchants • Production Certified</div>
        </div>
      </footer>
    </div>
  );
}
