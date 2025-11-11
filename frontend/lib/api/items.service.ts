/**
 * Items API Service
 * Handles all item-related API calls
 */

import apiClient from './client';
import { API_CONFIG } from '@/lib/config/api.config';
import {
  Item,
  PaginatedResponse,
  ApiResponse,
  ItemsQueryParams,
} from '@/lib/types';

export const itemsApi = {
  /**
   * Get all items with pagination and filters
   */
  getItems: async (params?: ItemsQueryParams): Promise<PaginatedResponse<Item>> => {
    const response = await apiClient.get<PaginatedResponse<Item>>(
      API_CONFIG.ENDPOINTS.ITEMS,
      { params }
    );
    return response.data;
  },

  /**
   * Get single item by ID
   */
  getItemById: async (id: string): Promise<Item> => {
    const response = await apiClient.get<ApiResponse<Item>>(
      `${API_CONFIG.ENDPOINTS.ITEMS}/${id}`
    );
    // Return full data including relations
    return response.data.data as Item;
  },

  /**
   * Create new item
   */
  createItem: async (data: Partial<Item>): Promise<Item> => {
    const response = await apiClient.post<ApiResponse<Item>>(
      API_CONFIG.ENDPOINTS.ITEMS,
      data
    );
    return response.data.data;
  },

  /**
   * Update existing item
   */
  updateItem: async (id: string, data: Partial<Item>): Promise<Item> => {
    const response = await apiClient.patch<ApiResponse<Item>>(
      `${API_CONFIG.ENDPOINTS.ITEMS}/${id}`,
      data
    );
    return response.data.data;
  },

  /**
   * Delete item
   */
  deleteItem: async (id: string): Promise<void> => {
    await apiClient.delete(`${API_CONFIG.ENDPOINTS.ITEMS}/${id}`);
  },

  /**
   * Get item stock summary
   */
  getItemStockSummary: async (id: string): Promise<any> => {
    const response = await apiClient.get<ApiResponse<any>>(
      `${API_CONFIG.ENDPOINTS.ITEMS}/${id}/stock-summary`
    );
    return response.data.data;
  },
};
