/**
 * Stock API Service
 * Handles all stock-related API calls
 */

import apiClient from './client';
import { API_CONFIG } from '@/lib/config/api.config';
import {
  Stock,
  PaginatedResponse,
  ApiResponse,
} from '@/lib/types';

export interface StockQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  itemId?: string;
  locationId?: string;
  batchNumber?: string;
}

export const stockApi = {
  /**
   * Get all stock with pagination and filters
   */
  getStock: async (params?: StockQueryParams): Promise<PaginatedResponse<Stock>> => {
    const response = await apiClient.get<PaginatedResponse<Stock>>(
      '/api/stock',
      { params }
    );
    return response.data;
  },

  /**
   * Get single stock by ID
   */
  getStockById: async (id: string): Promise<Stock> => {
    const response = await apiClient.get<ApiResponse<Stock>>(
      `/api/stock/${id}`
    );
    return response.data.data;
  },

  /**
   * Get low stock items
   */
  getLowStock: async (params?: StockQueryParams): Promise<PaginatedResponse<any>> => {
    const response = await apiClient.get<PaginatedResponse<any>>(
      '/api/stock/low-stock',
      { params }
    );
    return response.data;
  },

  /**
   * Get expiring stock
   */
  getExpiringStock: async (params?: { days?: number }): Promise<PaginatedResponse<Stock>> => {
    const response = await apiClient.get<PaginatedResponse<Stock>>(
      '/api/stock/expiring',
      { params }
    );
    return response.data;
  },

  /**
   * Get stock history for an item
   */
  getStockHistory: async (itemId: string, params?: StockQueryParams): Promise<PaginatedResponse<any>> => {
    const response = await apiClient.get<PaginatedResponse<any>>(
      `/api/stock/history/${itemId}`,
      { params }
    );
    return response.data;
  },
};
