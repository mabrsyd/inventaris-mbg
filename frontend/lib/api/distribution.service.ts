/**
 * Distribution API Service
 * Handles Beneficiaries and Delivery Orders
 */

import apiClient from './client';
import { API_CONFIG } from '../config/api.config';
import type {
  Beneficiary,
  DeliveryOrder,
  ApiResponse,
  PaginatedResponse,
} from '../types';

// ===========================
// Beneficiaries
// ===========================

export interface BeneficiariesQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  type?: string;
}

export interface CreateBeneficiaryDto {
  name: string;
  type: string;
  contactPerson: string;
  phone: string;
  address: string;
}

export interface UpdateBeneficiaryDto {
  name?: string;
  type?: string;
  contactPerson?: string;
  phone?: string;
  address?: string;
}

export const beneficiariesApi = {
  /**
   * Get all beneficiaries with pagination
   */
  async getAll(params?: BeneficiariesQueryParams): Promise<PaginatedResponse<Beneficiary>> {
    const { data } = await apiClient.get<PaginatedResponse<Beneficiary>>(
      API_CONFIG.ENDPOINTS.BENEFICIARIES,
      { params }
    );
    return data;
  },

  /**
   * Get beneficiary by ID
   */
  async getById(id: string): Promise<ApiResponse<Beneficiary>> {
    const { data } = await apiClient.get<ApiResponse<Beneficiary>>(
      `${API_CONFIG.ENDPOINTS.BENEFICIARIES}/${id}`
    );
    return data;
  },

  /**
   * Create new beneficiary
   */
  async create(dto: CreateBeneficiaryDto): Promise<ApiResponse<Beneficiary>> {
    const { data } = await apiClient.post<ApiResponse<Beneficiary>>(
      API_CONFIG.ENDPOINTS.BENEFICIARIES,
      dto
    );
    return data;
  },

  /**
   * Update beneficiary
   */
  async update(id: string, dto: UpdateBeneficiaryDto): Promise<ApiResponse<Beneficiary>> {
    const { data } = await apiClient.patch<ApiResponse<Beneficiary>>(
      `${API_CONFIG.ENDPOINTS.BENEFICIARIES}/${id}`,
      dto
    );
    return data;
  },

  /**
   * Delete beneficiary
   */
  async delete(id: string): Promise<ApiResponse<void>> {
    const { data } = await apiClient.delete<ApiResponse<void>>(
      `${API_CONFIG.ENDPOINTS.BENEFICIARIES}/${id}`
    );
    return data;
  },
};

// ===========================
// Delivery Orders
// ===========================

export interface DeliveryOrdersQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  beneficiaryId?: string;
}

export interface CreateDeliveryOrderDto {
  sourceLocationId: string;
  destinationLocationId: string;
  beneficiaryId?: string;
  workOrderId?: string;
  scheduledDeliveryDate?: string;
  transportInfo?: any;
  referenceDocument?: string;
  notes?: string;
  items: {
    itemId: string;
    quantity: number;
    batchNumber?: string;
  }[];
}

export interface UpdateDeliveryOrderDto {
  beneficiaryId?: string;
  scheduledDate?: string;
  actualDate?: string;
  notes?: string;
  status?: string;
}

export const deliveryOrdersApi = {
  /**
   * Get all delivery orders with pagination
   */
  async getAll(params?: DeliveryOrdersQueryParams): Promise<PaginatedResponse<DeliveryOrder>> {
    const { data } = await apiClient.get<PaginatedResponse<DeliveryOrder>>(
      API_CONFIG.ENDPOINTS.DELIVERY_ORDERS,
      { params }
    );
    return data;
  },

  /**
   * Get delivery order by ID
   */
  async getById(id: string): Promise<ApiResponse<DeliveryOrder>> {
    const { data } = await apiClient.get<ApiResponse<DeliveryOrder>>(
      `${API_CONFIG.ENDPOINTS.DELIVERY_ORDERS}/${id}`
    );
    return data;
  },

  /**
   * Create new delivery order
   */
  async create(dto: CreateDeliveryOrderDto): Promise<ApiResponse<DeliveryOrder>> {
    const { data } = await apiClient.post<ApiResponse<DeliveryOrder>>(
      API_CONFIG.ENDPOINTS.DELIVERY_ORDERS,
      dto
    );
    return data;
  },

  /**
   * Update delivery order
   */
  async update(id: string, dto: UpdateDeliveryOrderDto): Promise<ApiResponse<DeliveryOrder>> {
    const { data } = await apiClient.patch<ApiResponse<DeliveryOrder>>(
      `${API_CONFIG.ENDPOINTS.DELIVERY_ORDERS}/${id}`,
      dto
    );
    return data;
  },

  /**
   * Delete delivery order
   */
  async delete(id: string): Promise<ApiResponse<void>> {
    const { data } = await apiClient.delete<ApiResponse<void>>(
      `${API_CONFIG.ENDPOINTS.DELIVERY_ORDERS}/${id}`
    );
    return data;
  },

  /**
   * Dispatch delivery order
   */
  async dispatch(id: string): Promise<ApiResponse<DeliveryOrder>> {
    const { data } = await apiClient.post<ApiResponse<DeliveryOrder>>(
      `${API_CONFIG.ENDPOINTS.DELIVERY_ORDERS}/${id}/dispatch`
    );
    return data;
  },

  /**
   * Complete delivery
   */
  async complete(id: string): Promise<ApiResponse<DeliveryOrder>> {
    const { data } = await apiClient.post<ApiResponse<DeliveryOrder>>(
      `${API_CONFIG.ENDPOINTS.DELIVERY_ORDERS}/${id}/complete`
    );
    return data;
  },

  /**
   * Cancel delivery order
   */
  async cancel(id: string, reason: string): Promise<ApiResponse<DeliveryOrder>> {
    const { data } = await apiClient.post<ApiResponse<DeliveryOrder>>(
      `${API_CONFIG.ENDPOINTS.DELIVERY_ORDERS}/${id}/cancel`,
      { reason }
    );
    return data;
  },

  /**
   * Get delivery order statistics
   */
  async getStats(): Promise<ApiResponse<{
    total: number;
    pending: number;
    dispatched: number;
    completed: number;
    cancelled: number;
  }>> {
    const { data } = await apiClient.get(`${API_CONFIG.ENDPOINTS.DELIVERY_ORDERS}/stats`);
    return data;
  },
};

export default {
  beneficiaries: beneficiariesApi,
  deliveryOrders: deliveryOrdersApi,
};
