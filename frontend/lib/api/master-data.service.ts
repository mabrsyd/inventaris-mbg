/**
 * Categories API Service
 */

import apiClient from './client';
import { API_CONFIG } from '@/lib/config/api.config';
import { Category, PaginatedResponse, ApiResponse, PaginationParams } from '@/lib/types';

export const categoriesApi = {
  getCategories: async (params?: PaginationParams): Promise<PaginatedResponse<Category>> => {
    const response = await apiClient.get<PaginatedResponse<Category>>(
      API_CONFIG.ENDPOINTS.CATEGORIES,
      { params }
    );
    return response.data;
  },

  getCategoryById: async (id: string): Promise<Category> => {
    const response = await apiClient.get<ApiResponse<Category>>(
      `${API_CONFIG.ENDPOINTS.CATEGORIES}/${id}`
    );
    return response.data.data;
  },

  createCategory: async (data: Partial<Category>): Promise<Category> => {
    const response = await apiClient.post<ApiResponse<Category>>(
      API_CONFIG.ENDPOINTS.CATEGORIES,
      data
    );
    return response.data.data;
  },

  updateCategory: async (id: string, data: Partial<Category>): Promise<Category> => {
    const response = await apiClient.patch<ApiResponse<Category>>(
      `${API_CONFIG.ENDPOINTS.CATEGORIES}/${id}`,
      data
    );
    return response.data.data;
  },

  deleteCategory: async (id: string): Promise<void> => {
    await apiClient.delete(`${API_CONFIG.ENDPOINTS.CATEGORIES}/${id}`);
  },
};

/**
 * Locations API Service
 */

import { Location, LocationType } from '@/lib/types';

export const locationsApi = {
  getLocations: async (params?: PaginationParams & { type?: LocationType }): Promise<PaginatedResponse<Location>> => {
    const response = await apiClient.get<PaginatedResponse<Location>>(
      API_CONFIG.ENDPOINTS.LOCATIONS,
      { params }
    );
    return response.data;
  },

  getLocationById: async (id: string): Promise<Location> => {
    const response = await apiClient.get<ApiResponse<Location>>(
      `${API_CONFIG.ENDPOINTS.LOCATIONS}/${id}`
    );
    return response.data.data;
  },

  createLocation: async (data: Partial<Location>): Promise<Location> => {
    const response = await apiClient.post<ApiResponse<Location>>(
      API_CONFIG.ENDPOINTS.LOCATIONS,
      data
    );
    return response.data.data;
  },

  updateLocation: async (id: string, data: Partial<Location>): Promise<Location> => {
    const response = await apiClient.patch<ApiResponse<Location>>(
      `${API_CONFIG.ENDPOINTS.LOCATIONS}/${id}`,
      data
    );
    return response.data.data;
  },

  deleteLocation: async (id: string): Promise<void> => {
    await apiClient.delete(`${API_CONFIG.ENDPOINTS.LOCATIONS}/${id}`);
  },
};

/**
 * Suppliers API Service
 */

import { Supplier } from '@/lib/types';

export const suppliersApi = {
  getSuppliers: async (params?: PaginationParams): Promise<PaginatedResponse<Supplier>> => {
    const response = await apiClient.get<PaginatedResponse<Supplier>>(
      API_CONFIG.ENDPOINTS.SUPPLIERS,
      { params }
    );
    return response.data;
  },

  getSupplierById: async (id: string): Promise<Supplier> => {
    const response = await apiClient.get<ApiResponse<Supplier>>(
      `${API_CONFIG.ENDPOINTS.SUPPLIERS}/${id}`
    );
    return response.data.data;
  },

  createSupplier: async (data: Partial<Supplier>): Promise<Supplier> => {
    const response = await apiClient.post<ApiResponse<Supplier>>(
      API_CONFIG.ENDPOINTS.SUPPLIERS,
      data
    );
    return response.data.data;
  },

  updateSupplier: async (id: string, data: Partial<Supplier>): Promise<Supplier> => {
    const response = await apiClient.patch<ApiResponse<Supplier>>(
      `${API_CONFIG.ENDPOINTS.SUPPLIERS}/${id}`,
      data
    );
    return response.data.data;
  },

  deleteSupplier: async (id: string): Promise<void> => {
    await apiClient.delete(`${API_CONFIG.ENDPOINTS.SUPPLIERS}/${id}`);
  },
};
