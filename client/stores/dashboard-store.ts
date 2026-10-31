import { create } from 'zustand';
import { TicketState, RootCauseType } from '@/features/dashboard/types/dashboard.types';

interface DashboardUIState {
  // Selected Ticket for Sheet/Drawer drilldown
  selectedTicketId: string | null;
  isDetailPanelOpen: boolean;

  // Active Filters
  statusFilter: TicketState | null;
  rootCauseFilter: RootCauseType | string | null;
  searchQuery: string;

  // Actions
  setSelectedTicketId: (id: string | null) => void;
  openDetailPanel: (id: string) => void;
  closeDetailPanel: () => void;
  setStatusFilter: (status: TicketState | null) => void;
  setRootCauseFilter: (cause: RootCauseType | string | null) => void;
  setSearchQuery: (query: string) => void;
  clearAllFilters: () => void;
}

export const useDashboardStore = create<DashboardUIState>((set) => ({
  selectedTicketId: null,
  isDetailPanelOpen: false,

  statusFilter: null,
  rootCauseFilter: null,
  searchQuery: '',

  setSelectedTicketId: (id) => set({ selectedTicketId: id }),
  openDetailPanel: (id) => set({ selectedTicketId: id, isDetailPanelOpen: true }),
  closeDetailPanel: () => set({ isDetailPanelOpen: false }),
  setStatusFilter: (status) =>
    set((state) => ({ statusFilter: state.statusFilter === status ? null : status })),
  setRootCauseFilter: (cause) =>
    set((state) => ({ rootCauseFilter: state.rootCauseFilter === cause ? null : cause })),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  clearAllFilters: () =>
    set({
      statusFilter: null,
      rootCauseFilter: null,
      searchQuery: '',
    }),
}));
