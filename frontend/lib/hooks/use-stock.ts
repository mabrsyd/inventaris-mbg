/**
 * Stock Hooks
 * Custom hooks for stock data fetching
 */

'use client';

import { useQuery } from '@tanstack/react-query';
import { stockApi, StockQueryParams } from '@/lib/api/stock.service';

const STOCK_QUERY_KEYS = {
  STOCK: ['stock'] as const,
  STOCK_DETAIL: (id: string) => ['stock', id] as const,
  LOW_STOCK: ['stock', 'low'] as const,
  EXPIRING_STOCK: ['stock', 'expiring'] as const,
  STOCK_HISTORY: (itemId: string) => ['stock', 'history', itemId] as const,
};

/**
 * Hook to fetch paginated stock list
 */
export const useStock = (params?: StockQueryParams) => {
  return useQuery({
    queryKey: [...STOCK_QUERY_KEYS.STOCK, params],
    queryFn: () => stockApi.getStock(params),
    staleTime: 30 * 1000, // 30 seconds (stock changes frequently)
  });
};

/**
 * Hook to fetch single stock by ID
 */
export const useStockById = (id: string) => {
  return useQuery({
    queryKey: STOCK_QUERY_KEYS.STOCK_DETAIL(id),
    queryFn: () => stockApi.getStockById(id),
    enabled: !!id,
    staleTime: 1 * 60 * 1000, // 1 minute
  });
};

/**
 * Hook to fetch low stock items
 */
export const useLowStock = (params?: StockQueryParams) => {
  return useQuery({
    queryKey: [...STOCK_QUERY_KEYS.LOW_STOCK, params],
    queryFn: () => stockApi.getLowStock(params),
    staleTime: 1 * 60 * 1000, // 1 minute
  });
};

/**
 * Hook to fetch expiring stock
 */
export const useExpiringStock = (params?: { days?: number }) => {
  return useQuery({
    queryKey: [...STOCK_QUERY_KEYS.EXPIRING_STOCK, params],
    queryFn: () => stockApi.getExpiringStock(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Hook to fetch stock history for an item
 */
export const useStockHistory = (itemId: string, params?: StockQueryParams) => {
  return useQuery({
    queryKey: [...STOCK_QUERY_KEYS.STOCK_HISTORY(itemId), params],
    queryFn: () => stockApi.getStockHistory(itemId, params),
    enabled: !!itemId,
    staleTime: 30 * 1000, // 30 seconds
  });
};
