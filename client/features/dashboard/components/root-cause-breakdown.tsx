'use client';

import React from 'react';
import { RootCauseItem } from '../types/dashboard.types';
import { useDashboardStore } from '@/stores/dashboard-store';
import { getRootCauseLabel } from '@/lib/utils';
import { Activity, Check } from 'lucide-react';

interface RootCauseBreakdownProps {
  rootCauses: RootCauseItem[];
  totalTickets: number;
}

export function RootCauseBreakdown({ rootCauses, totalTickets }: RootCauseBreakdownProps) {
  const { rootCauseFilter, setRootCauseFilter } = useDashboardStore();

  return (
    <div className="bg-white border border-slate-200 rounded p-4 sm:p-5 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 mb-4 border-b border-slate-100 gap-2">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded bg-blue-50 text-[#002970]">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#0F2042]">Root Cause Intelligence Breakdown</h3>
            <p className="text-xs text-slate-500">
              Distribution of merchant dormancy &amp; friction points across cohorts
            </p>
          </div>
        </div>

        {rootCauseFilter ? (
          <button
            onClick={() => setRootCauseFilter(null)}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded transition cursor-pointer self-start sm:self-auto"
          >
            <span>Filtering: {getRootCauseLabel(rootCauseFilter)}</span>
            <span className="text-slate-400 hover:text-slate-700 ml-1">× Reset</span>
          </button>
        ) : (
          <span className="text-xs text-slate-400 font-medium">Click category to filter tickets</span>
        )}
      </div>

      {/* Grid of interactive categories */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {rootCauses.map((item) => {
          const isSelected = rootCauseFilter === item.root_cause;
          const percentage = totalTickets > 0 ? (item.count / totalTickets) * 100 : 0;

          return (
            <button
              key={item.root_cause}
              onClick={() => setRootCauseFilter(item.root_cause)}
              className={`p-3.5 rounded border text-left transition cursor-pointer flex flex-col justify-between group ${
                isSelected
                  ? 'bg-blue-50/70 border-[#00BAF2] ring-2 ring-[#00BAF2]/20'
                  : 'bg-slate-50/50 border-slate-200 hover:bg-white hover:border-slate-300 hover:shadow-xs'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                      isSelected
                        ? 'bg-[#00BAF2] text-white'
                        : 'bg-slate-200 text-slate-600 group-hover:bg-slate-300'
                    }`}
                  >
                    {item.count} Cases
                  </span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-[#002970]" />}
                </div>
                <div className="text-xs font-bold text-slate-900 group-hover:text-[#002970] transition-colors leading-snug line-clamp-2">
                  {getRootCauseLabel(item.root_cause)}
                </div>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-200/60">
                {/* Progress bar visual */}
                <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden mb-1">
                  <div
                    className={`h-full rounded-full ${
                      isSelected ? 'bg-[#002970]' : 'bg-[#00BAF2]'
                    }`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-400">
                  <span>Share</span>
                  <span className="font-semibold text-slate-700">{percentage.toFixed(0)}%</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
