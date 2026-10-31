import { useQuery } from '@tanstack/react-query';
import { fetchDashboardData } from '../services/dashboard-api';
import { DashboardResponse } from '../types/dashboard.types';

export const DASHBOARD_QUERY_KEY = ['dashboard-data'];

export function useDashboard() {
  return useQuery<DashboardResponse, Error>({
    queryKey: DASHBOARD_QUERY_KEY,
    queryFn: fetchDashboardData,
    staleTime: 1000 * 60 * 2, // 2 minutes
    refetchOnWindowFocus: false,
  });
}
