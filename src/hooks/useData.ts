import { useState, useEffect } from 'react';
import { userService } from '@/services/user.service';
import { analyticsService } from '@/services/analytics.service';
import { referralService } from '@/services/referral.service';
import {
  DashboardStats,
  UserAnalytics,
  BookingAnalytics,
  RevenueAnalytics,
  ServiceAnalytics,
  ReferralStats,
} from '@/types';

// Generic hook for data fetching
export function useDataFetch<T>(
  fetchFunction: () => Promise<T>,
  dependencies: any[] = []
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refetch = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchFunction();
      setData(result);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refetch();
  }, dependencies);

  return { data, loading, error, refetch };
}

// Users hook
export function useUsers(page = 1, limit = 20) {
  return useDataFetch(
    () => userService.getUsers({ page, limit }),
    [page, limit]
  );
}



// Dashboard stats hook
export function useDashboardStats() {
  return useDataFetch<DashboardStats>(
    () => analyticsService.getDashboardOverview() as any,
    []
  );
}

// Analytics hooks
export function useUserAnalytics(startDate?: string, endDate?: string) {
  return useDataFetch<UserAnalytics>(
    () => analyticsService.getUserAnalytics(startDate, endDate) as any,
    [startDate, endDate]
  );
}

export function useBookingAnalytics(startDate?: string, endDate?: string) {
  return useDataFetch<BookingAnalytics>(
    () => analyticsService.getBookingAnalytics(startDate, endDate) as any,
    [startDate, endDate]
  );
}

export function useRevenueAnalytics(startDate?: string, endDate?: string) {
  return useDataFetch<RevenueAnalytics>(
    () => analyticsService.getRevenueAnalytics(startDate, endDate) as any,
    [startDate, endDate]
  );
}

export function useServiceAnalytics() {
  return useDataFetch<ServiceAnalytics>(
    () => analyticsService.getServiceAnalytics() as any,
    []
  );
}

// Referrals hooks
export function useReferrals(page = 1, limit = 50, status?: string) {
  return useDataFetch(
    () => referralService.getReferrals(page, limit, status),
    [page, limit, status]
  );
}

export function useReferralStats() {
  return useDataFetch<ReferralStats>(
    () => referralService.getReferralStats(),
    []
  );
}
