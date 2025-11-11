/**
 * Reporting Hooks
 * Custom React hooks for various reports
 */

import { useQuery, useMutation } from '@tanstack/react-query';
import { toast } from './use-toast';
import {
  reportsApi,
  type StockReportParams,
  type TransactionReportParams,
  type ProcurementReportParams,
  type ProductionReportParams,
  type DistributionReportParams,
} from '../api/reports.service';
import { QUERY_KEYS } from '../config/api.config';

/**
 * Fetch stock report
 */
export function useStockReport(params?: StockReportParams) {
  return useQuery({
    queryKey: [QUERY_KEYS.REPORTS, 'stock', params],
    queryFn: () => reportsApi.getStockReport(params),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Fetch transaction report
 */
export function useTransactionReport(params: TransactionReportParams) {
  return useQuery({
    queryKey: [QUERY_KEYS.REPORTS, 'transactions', params],
    queryFn: () => reportsApi.getTransactionReport(params),
    enabled: !!(params.startDate && params.endDate),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Fetch procurement report
 */
export function useProcurementReport(params: ProcurementReportParams) {
  return useQuery({
    queryKey: [QUERY_KEYS.REPORTS, 'procurement', params],
    queryFn: () => reportsApi.getProcurementReport(params),
    enabled: !!(params.startDate && params.endDate),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Fetch production report
 */
export function useProductionReport(params: ProductionReportParams) {
  return useQuery({
    queryKey: [QUERY_KEYS.REPORTS, 'production', params],
    queryFn: () => reportsApi.getProductionReport(params),
    enabled: !!(params.startDate && params.endDate),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Fetch distribution report
 */
export function useDistributionReport(params: DistributionReportParams) {
  return useQuery({
    queryKey: [QUERY_KEYS.REPORTS, 'distribution', params],
    queryFn: () => reportsApi.getDistributionReport(params),
    enabled: !!(params.startDate && params.endDate),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Fetch low stock alerts
 */
export function useLowStockAlerts() {
  return useQuery({
    queryKey: [QUERY_KEYS.REPORTS, 'low-stock'],
    queryFn: async () => {
      const response = await reportsApi.getLowStockAlerts();
      return response.data; // Unwrap the ApiResponse
    },
    staleTime: 1000 * 60 * 2, // 2 minutes (more frequent for alerts)
    refetchInterval: 1000 * 60 * 5, // Auto-refetch every 5 minutes
  });
}

/**
 * Fetch dashboard statistics
 */
export function useDashboardStats() {
  return useQuery({
    queryKey: [QUERY_KEYS.REPORTS, 'dashboard'],
    queryFn: async () => {
      const response = await reportsApi.getDashboardStats();
      return response.data; // Unwrap the ApiResponse
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
    refetchInterval: 1000 * 60 * 5, // Auto-refetch every 5 minutes
  });
}

/**
 * Export report to CSV
 */
export function useExportReport() {
  return useMutation({
    mutationKey: ['reports', 'export'],
    mutationFn: ({ reportType, params }: { reportType: string; params: any }) =>
      reportsApi.exportReport(reportType, params),
    onSuccess: (blob, variables) => {
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${variables.reportType}-report-${new Date().toISOString()}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast({
        title: 'Success',
        description: 'Report exported successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to export report',
        variant: 'destructive',
      });
    },
  });
}
