/**
 * Inventory API functions
 * Handles inventory and stock related operations
 */

import apiClient from './client';
import type { Item, Stock, ApiResponse, PaginatedResponse } from '../types';

// ===========================
// Items API
// ===========================

/**
 * Get item by ID
 */
export const getItemById = async (id: string): Promise<Item | null> => {
  try {
    const { data } = await apiClient.get<ApiResponse<Item>>(`/api/items/${id}`);
    return data.data || null;
  } catch (error) {
    console.error('Failed to fetch item:', error);
    return null;
  }
};

/**
 * Create new item
 */
export const createItem = async (itemData: Partial<Item>): Promise<Item | null> => {
  try {
    const { data } = await apiClient.post<ApiResponse<Item>>('/api/items', itemData);
    return data.data || null;
  } catch (error) {
    console.error('Failed to create item:', error);
    return null;
  }
};

/**
 * Update item
 */
export const updateItem = async (id: string, itemData: Partial<Item>): Promise<Item | null> => {
  try {
    const { data } = await apiClient.put<ApiResponse<Item>>(`/api/items/${id}`, itemData);
    return data.data || null;
  } catch (error) {
    console.error('Failed to update item:', error);
    return null;
  }
};

/**
 * Delete item
 */
export const deleteItem = async (id: string): Promise<boolean> => {
  try {
    await apiClient.delete(`/api/items/${id}`);
    return true;
  } catch (error) {
    console.error('Failed to delete item:', error);
    return false;
  }
};

// ===========================
// Stock API
// ===========================

/**
 * Get stock data
 */
export const fetchStockData = async (): Promise<Stock[]> => {
  try {
    const { data } = await apiClient.get<PaginatedResponse<Stock>>('/api/stock');
    return data.data || [];
  } catch (error) {
    console.error('Failed to fetch stock data:', error);
    return [];
  }
};

/**
 * Get stock by ID
 */
export const getStockById = async (id: string): Promise<Stock | null> => {
  try {
    const { data } = await apiClient.get<ApiResponse<Stock>>(`/api/stock/${id}`);
    return data.data || null;
  } catch (error) {
    console.error('Failed to fetch stock:', error);
    return null;
  }
};

/**
 * Adjust stock
 */
export const adjustStock = async (id: string, adjustment: { quantity: number; reason: string }): Promise<Stock | null> => {
  try {
    const { data } = await apiClient.post<ApiResponse<Stock>>(`/api/stock/${id}/adjust`, adjustment);
    return data.data || null;
  } catch (error) {
    console.error('Failed to adjust stock:', error);
    return null;
  }
};