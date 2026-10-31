'use client';

import React, { useMemo, useState } from 'react';
import { 
  Search, 
  FilterX, 
  Languages, 
  ChevronRight, 
  MapPin,
  ArrowUpDown,
  ArrowDownWideNarrow,
  SlidersHorizontal
} from 'lucide-react';
import { Ticket, TicketState } from '../types/dashboard.types';
import { useDashboardStore } from '@/stores/dashboard-store';
import { getStatusConfig, getPriorityTierConfig, getRootCauseLabel, formatRelativeTime, formatCurrencyINR } from '@/lib/utils';

export type SortField =
  | 'DEFAULT'
  | 'MONTHLY_VOLUME'
  | 'LIFETIME_VOLUME'
  | 'TENURE'
  | 'MONEY_OWED'
  | 'INACTIVITY_DAYS'
  | 'PRIORITY_SCORE';

interface TicketTableProps {
  tickets: Ticket[];
}

export function TicketTable({ tickets }: TicketTableProps) {
  const {
    selectedTicketId,
    openDetailPanel,
    statusFilter,
    setStatusFilter,
    rootCauseFilter,
    setRootCauseFilter,
    searchQuery,
    setSearchQuery,
    clearAllFilters,
  } = useDashboardStore();

  const [dormancyFilter, setDormancyFilter] = useState<string>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [minVolumeFilter, setMinVolumeFilter] = useState<string>('ALL');
  const [tenureFilter, setTenureFilter] = useState<string>('ALL');
  const [moneyOwedOnly, setMoneyOwedOnly] = useState<boolean>(false);
  const [escalatedFirst, setEscalatedFirst] = useState<boolean>(true);
  const [sortBy, setSortBy] = useState<SortField>('DEFAULT');

  const filteredTickets = useMemo(() => {
    // 1. Filtering
    const result = tickets.filter((ticket) => {
      // Status filter
      if (statusFilter && ticket.state !== statusFilter) {
        return false;
      }
      // Root cause filter
      if (rootCauseFilter && ticket.root_cause !== rootCauseFilter) {
        return false;
      }
      // Dormancy filter
      if (dormancyFilter !== 'ALL') {
        const bucket = parseInt(dormancyFilter, 10);
        if (ticket.dormancy_bucket !== bucket) return false;
      }
      // Priority Tier filter
      if (priorityFilter !== 'ALL') {
        if (ticket.priority?.tier !== priorityFilter) return false;
      }
      // Minimum Volume Filter (High spenders / big merchants)
      if (minVolumeFilter !== 'ALL') {
        const minVol = parseFloat(minVolumeFilter);
        const merchantVol = ticket.merchant.history?.avg_monthly_volume ?? 0;
        if (merchantVol < minVol) return false;
      }
      // Tenure Filter (Loyal merchants, e.g. >1 year, >2 years)
      if (tenureFilter !== 'ALL') {
        const minMonths = parseInt(tenureFilter, 10);
        const tenure = ticket.merchant.history?.tenure_months ?? 0;
        if (tenure < minMonths) return false;
      }
      // Money Owed filter
      if (moneyOwedOnly) {
        const owed = ticket.merchant.history?.money_owed ?? 0;
        if (owed <= 0) return false;
      }
      // Search filter (merchant name, business, city, summary, ID)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = ticket.merchant.name.toLowerCase().includes(q);
        const matchesBusiness = ticket.merchant.business.toLowerCase().includes(q);
        const matchesCity = ticket.merchant.city.toLowerCase().includes(q);
        const matchesSummary = ticket.summary.toLowerCase().includes(q);
        const matchesId = ticket.id.toLowerCase().includes(q);
        const matchesMerchantId = ticket.merchant.id.toLowerCase().includes(q);
        return matchesName || matchesBusiness || matchesCity || matchesSummary || matchesId || matchesMerchantId;
      }
      return true;
    });

    // 2. Sorting & Prioritization Logic
    return result.sort((a, b) => {
      // If escalatedFirst is enabled, always pin ESCALATED status to the very top
      if (escalatedFirst) {
        const aEscalated = a.state === 'ESCALATED' ? 1 : 0;
        const bEscalated = b.state === 'ESCALATED' ? 1 : 0;
        if (aEscalated !== bEscalated) {
          return bEscalated - aEscalated;
        }
      }

      // Secondary / User selected sort
      switch (sortBy) {
        case 'MONTHLY_VOLUME': {
          const aVol = a.merchant.history?.avg_monthly_volume ?? 0;
          const bVol = b.merchant.history?.avg_monthly_volume ?? 0;
          return bVol - aVol;
        }
        case 'LIFETIME_VOLUME': {
          const aVol = a.merchant.history?.lifetime_volume ?? 0;
          const bVol = b.merchant.history?.lifetime_volume ?? 0;
          return bVol - aVol;
        }
        case 'TENURE': {
          const aTen = a.merchant.history?.tenure_months ?? 0;
          const bTen = b.merchant.history?.tenure_months ?? 0;
          return bTen - aTen;
        }
        case 'MONEY_OWED': {
          const aOwed = a.merchant.history?.money_owed ?? 0;
          const bOwed = b.merchant.history?.money_owed ?? 0;
          return bOwed - aOwed;
        }
        case 'INACTIVITY_DAYS': {
          return b.days_inactive - a.days_inactive;
        }
        case 'PRIORITY_SCORE': {
          const aScore = a.priority?.score ?? 0;
          const bScore = b.priority?.score ?? 0;
          return bScore - aScore;
        }
        case 'DEFAULT':
        default: {
          // Default composite priority:
          // 1. Priority Score descending
          // 2. Monthly volume descending
          const aScore = a.priority?.score ?? 0;
          const bScore = b.priority?.score ?? 0;
          if (bScore !== aScore) return bScore - aScore;

          const aVol = a.merchant.history?.avg_monthly_volume ?? 0;
          const bVol = b.merchant.history?.avg_monthly_volume ?? 0;
          return bVol - aVol;
        }
      }
    });
  }, [
    tickets,
    statusFilter,
    rootCauseFilter,
    dormancyFilter,
    priorityFilter,
    minVolumeFilter,
    tenureFilter,
    moneyOwedOnly,
    escalatedFirst,
    sortBy,
    searchQuery,
  ]);

  const hasActiveFilters = Boolean(
    statusFilter ||
    rootCauseFilter ||
    dormancyFilter !== 'ALL' ||
    priorityFilter !== 'ALL' ||
    minVolumeFilter !== 'ALL' ||
    tenureFilter !== 'ALL' ||
    moneyOwedOnly ||
    !escalatedFirst ||
    sortBy !== 'DEFAULT' ||
    searchQuery.trim()
  );

  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-2xs overflow-hidden">
      {/* Table Header & Search Controls */}
      <div className="p-4 border-b border-slate-200/80 flex flex-col gap-3 bg-white">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900">Merchant Recovery Queue</h3>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium">
                {filteredTickets.length} of {tickets.length} merchants
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Ranked dynamically by customer value, dispute severity, tenure, and transaction volume
            </p>
          </div>

          {/* Quick Smart Toggles */}
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-1.5 text-xs text-slate-600 font-medium cursor-pointer select-none">
              <input
                type="checkbox"
                checked={escalatedFirst}
                onChange={(e) => setEscalatedFirst(e.target.checked)}
                className="rounded border-slate-300 text-slate-900 focus:ring-0 cursor-pointer"
              />
              <span>Escalations First</span>
            </label>

            <label className="flex items-center gap-1.5 text-xs text-slate-600 font-medium cursor-pointer select-none">
              <input
                type="checkbox"
                checked={moneyOwedOnly}
                onChange={(e) => setMoneyOwedOnly(e.target.checked)}
                className="rounded border-slate-300 text-slate-900 focus:ring-0 cursor-pointer"
              />
              <span>Money Owed Only</span>
            </label>
          </div>
        </div>

        {/* Filter Controls Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2 pt-1">
          {/* Search Input */}
          <div className="relative sm:col-span-2">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search merchant, ID, business, city..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400 focus:bg-white transition"
            />
          </div>

          {/* Sort By Dropdown (Prioritization) */}
          <div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortField)}
              className="w-full text-xs px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-slate-400 cursor-pointer"
            >
              <option value="DEFAULT">Sort: AI Value Rank</option>
              <option value="MONTHLY_VOLUME">Highest Monthly Vol</option>
              <option value="TENURE">Longest with Paytm</option>
              <option value="MONEY_OWED">Highest Money Owed</option>
              <option value="PRIORITY_SCORE">Priority Score</option>
              <option value="INACTIVITY_DAYS">Longest Inactive</option>
            </select>
          </div>

          {/* Monthly Volume Tier */}
          <div>
            <select
              value={minVolumeFilter}
              onChange={(e) => setMinVolumeFilter(e.target.value)}
              className="w-full text-xs px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-slate-400 cursor-pointer"
            >
              <option value="ALL">Volume: All Amounts</option>
              <option value="100000">&gt; ₹1,00,000 / mo</option>
              <option value="50000">&gt; ₹50,000 / mo</option>
              <option value="20000">&gt; ₹20,000 / mo</option>
            </select>
          </div>

          {/* Paytm Tenure Filter */}
          <div>
            <select
              value={tenureFilter}
              onChange={(e) => setTenureFilter(e.target.value)}
              className="w-full text-xs px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-slate-400 cursor-pointer"
            >
              <option value="ALL">Tenure: Any Duration</option>
              <option value="36">3+ Years Loyal (36m)</option>
              <option value="24">2+ Years Loyal (24m)</option>
              <option value="12">1+ Year Loyal (12m)</option>
            </select>
          </div>

          {/* Status Quick Filter */}
          <div>
            <select
              value={statusFilter || ''}
              onChange={(e) => setStatusFilter((e.target.value as TicketState) || null)}
              className="w-full text-xs px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-slate-400 cursor-pointer"
            >
              <option value="">Status: All</option>
              <option value="ESCALATED">Escalated</option>
              <option value="IN_CONVERSATION">In Conversation</option>
              <option value="CONTACTED">Contacted</option>
              <option value="NO_RESPONSE">No Response</option>
              <option value="RESOLVED">Resolved</option>
            </select>
          </div>
        </div>

        {/* Clear Filters Reset Bar */}
        {hasActiveFilters && (
          <div className="flex items-center justify-between pt-1 text-xs">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-slate-400 font-medium text-[11px] uppercase tracking-wider mr-1">
                Active:
              </span>
              {escalatedFirst && (
                <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px]">
                  Escalated Top
                </span>
              )}
              {sortBy !== 'DEFAULT' && (
                <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px]">
                  Sort: {sortBy}
                </span>
              )}
              {minVolumeFilter !== 'ALL' && (
                <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px]">
                  Vol &gt; ₹{parseInt(minVolumeFilter, 10).toLocaleString('en-IN')}
                </span>
              )}
              {tenureFilter !== 'ALL' && (
                <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px]">
                  Tenure &gt; {tenureFilter}m
                </span>
              )}
              {moneyOwedOnly && (
                <span className="px-2 py-0.5 rounded bg-rose-50 text-rose-700 text-[11px] border border-rose-200">
                  Money Owed
                </span>
              )}
              {statusFilter && (
                <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px]">
                  {statusFilter}
                </span>
              )}
            </div>

            <button
              onClick={() => {
                clearAllFilters();
                setDormancyFilter('ALL');
                setPriorityFilter('ALL');
                setMinVolumeFilter('ALL');
                setTenureFilter('ALL');
                setMoneyOwedOnly(false);
                setEscalatedFirst(true);
                setSortBy('DEFAULT');
              }}
              className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-slate-600 hover:text-slate-900 transition cursor-pointer"
            >
              <FilterX className="w-3.5 h-3.5" />
              <span>Reset Filters</span>
            </button>
          </div>
        )}
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              <th className="py-2.5 px-4">Merchant &amp; Business</th>
              <th className="py-2.5 px-3">Value &amp; Volume</th>
              <th className="py-2.5 px-3">Tenure</th>
              <th className="py-2.5 px-3">Status</th>
              <th className="py-2.5 px-3">Root Cause</th>
              <th className="py-2.5 px-3">Inactivity</th>
              <th className="py-2.5 px-4">Latest Communication</th>
              <th className="py-2.5 px-3">Lang</th>
              <th className="py-2.5 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {filteredTickets.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-16 text-center text-slate-500">
                  <div className="max-w-xs mx-auto">
                    <p className="font-semibold text-slate-800 text-sm">No Merchants Match Filters</p>
                    <p className="text-xs text-slate-400 mt-1">
                      Adjust your tenure, volume, or status criteria.
                    </p>
                    <button
                      onClick={() => {
                        clearAllFilters();
                        setDormancyFilter('ALL');
                        setPriorityFilter('ALL');
                        setMinVolumeFilter('ALL');
                        setTenureFilter('ALL');
                        setMoneyOwedOnly(false);
                        setEscalatedFirst(true);
                        setSortBy('DEFAULT');
                      }}
                      className="mt-3 px-3 py-1.5 rounded-md text-xs font-medium bg-slate-900 text-white hover:bg-slate-800 transition cursor-pointer"
                    >
                      Reset All Filters
                    </button>
                  </div>
                </td>
              </tr>
            ) : (
              filteredTickets.map((ticket) => {
                const status = getStatusConfig(ticket.state);
                const isSelected = selectedTicketId === ticket.id;
                const isHighValue = (ticket.merchant.history?.avg_monthly_volume ?? 0) >= 50000;
                const isLoyal = (ticket.merchant.history?.tenure_months ?? 0) >= 24;

                return (
                  <tr
                    key={ticket.id}
                    onClick={() => openDetailPanel(ticket.id)}
                    className={`hover:bg-slate-50/70 transition cursor-pointer ${
                      isSelected ? 'bg-sky-50/30' : ''
                    }`}
                  >
                    {/* Merchant & Business */}
                    <td className="py-3 px-4">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-900">
                            {ticket.merchant.name}
                          </span>
                          {isHighValue && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                              High Vol
                            </span>
                          )}
                          {isLoyal && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-medium bg-blue-50 text-blue-700 border border-blue-200">
                              2y+ Loyal
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                          <span>{ticket.merchant.business}</span>
                          <span className="text-slate-300">•</span>
                          <span className="flex items-center gap-0.5 text-slate-400">
                            <MapPin className="w-3 h-3" />
                            {ticket.merchant.city}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Monthly Volume & Money Owed */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      {ticket.merchant.history ? (
                        <div>
                          <div className="font-semibold text-slate-900">
                            {formatCurrencyINR(ticket.merchant.history.avg_monthly_volume)}
                            <span className="text-slate-400 text-[10px] font-normal"> /mo</span>
                          </div>
                          {ticket.merchant.history.money_owed > 0 ? (
                            <div className="text-[10px] font-semibold text-rose-600">
                              Owed: {formatCurrencyINR(ticket.merchant.history.money_owed)}
                            </div>
                          ) : (
                            <div className="text-[10px] text-slate-400">
                              No money held
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>

                    {/* Paytm Tenure */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      {ticket.merchant.history ? (
                        <div>
                          <div className="font-medium text-slate-800">
                            {ticket.merchant.history.tenure_months} mos
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {ticket.merchant.history.lifetime_txn_count.toLocaleString('en-IN')} txns
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>

                    {/* Status Badge */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium border ${status.badgeBg} ${status.badgeText} ${status.border}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${status.dotColor}`} />
                        {status.label}
                      </span>
                    </td>

                    {/* Root Cause */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <div className="font-medium text-slate-800">
                        {getRootCauseLabel(ticket.root_cause)}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {ticket.merchant.id}
                      </div>
                    </td>

                    {/* Inactivity Duration */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <div className="font-medium text-slate-800">
                        {ticket.days_inactive}d inactive
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {ticket.dormancy_bucket}d+ bucket
                      </div>
                    </td>

                    {/* Latest Activity / Last Message preview */}
                    <td className="py-3 px-4 max-w-[240px]">
                      <div className="text-slate-800 truncate font-normal">
                        {ticket.last_message.text_en}
                      </div>
                      <div className="text-[10px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                        <span className="font-medium">
                          {ticket.last_message.direction === 'out' ? 'Outbound' : 'Inbound'}
                        </span>
                        <span>•</span>
                        <span className="font-mono">{formatRelativeTime(ticket.last_message.created_at)}</span>
                      </div>
                    </td>

                    {/* Language & Telegram */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <div className="inline-flex items-center gap-1 text-[11px] text-slate-600 font-mono">
                        <Languages className="w-3 h-3 text-slate-400" />
                        <span>{ticket.merchant.language}</span>
                      </div>
                      {ticket.merchant.telegram_linked && (
                        <span className="ml-1 text-[10px] text-sky-600 font-medium">
                          ✓
                        </span>
                      )}
                    </td>

                    {/* Inspect Button */}
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openDetailPanel(ticket.id);
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition cursor-pointer shadow-2xs"
                      >
                        <span>View</span>
                        <ChevronRight className="w-3 h-3 text-slate-400" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
