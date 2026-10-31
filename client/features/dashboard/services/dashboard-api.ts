import { DashboardResponse } from '../types/dashboard.types';

export async function fetchDashboardData(): Promise<DashboardResponse> {
  const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL;

  if (!serverUrl || !serverUrl.trim()) {
    throw new Error(
      'NEXT_PUBLIC_SERVER_URL is not defined in client/.env. Please configure your backend API URL.'
    );
  }

  const endpoint = `${serverUrl.replace(/\/+$/, '')}/api/dashboard`;
  const response = await fetch(endpoint, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch dashboard data: ${response.status} ${response.statusText}`);
  }

  const result = await response.json();
  // Handle standard ApiResponse wrapper { success: true, data: ... } or direct data
  return (result.data || result) as DashboardResponse;
}
