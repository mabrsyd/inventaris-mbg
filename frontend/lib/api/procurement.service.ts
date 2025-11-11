/**
 * Procurement API Service
 * Handles Purchase Orders and Goods Receipts
 */

import apiClient from './client';
import { API_CONFIG } from '../config/api.config';
import type {
  PurchaseOrder,
  GoodsReceipt,
  ApiResponse,
  PaginatedResponse,
} from '../types';

// ===========================
// Purchase Orders
// ===========================

export interface PurchaseOrdersQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  supplierId?: string;
}

export interface CreatePurchaseOrderDto {
  supplierId: string;
  destinationLocationId: string;
  expectedDeliveryDate?: string;
  notes?: string;
  items: {
    itemId: string;
    quantity: number;
    unitPrice?: number;
  }[];
}

export interface UpdatePurchaseOrderDto {
  expectedDeliveryDate?: string;
  notes?: string;
  items?: {
    itemId: string;
    quantity: number;
    unitPrice?: number;
  }[];
}

export const purchaseOrdersApi = {
  /**
   * Get all purchase orders with pagination
   */
  async getAll(params?: PurchaseOrdersQueryParams): Promise<PaginatedResponse<PurchaseOrder>> {
    const { data } = await apiClient.get<PaginatedResponse<PurchaseOrder>>(
      API_CONFIG.ENDPOINTS.PURCHASE_ORDERS,
      { params }
    );
    return data;
  },

  /**
   * Get purchase order by ID
   */
  async getById(id: string): Promise<ApiResponse<PurchaseOrder>> {
    const { data } = await apiClient.get<ApiResponse<PurchaseOrder>>(
      `${API_CONFIG.ENDPOINTS.PURCHASE_ORDERS}/${id}`
    );
    return data;
  },

  /**
   * Create new purchase order
   */
  async create(dto: CreatePurchaseOrderDto): Promise<ApiResponse<PurchaseOrder>> {
    const { data } = await apiClient.post<ApiResponse<PurchaseOrder>>(
      API_CONFIG.ENDPOINTS.PURCHASE_ORDERS,
      dto
    );
    return data;
  },

  /**
   * Update purchase order
   */
  async update(id: string, dto: UpdatePurchaseOrderDto): Promise<ApiResponse<PurchaseOrder>> {
    const { data } = await apiClient.patch<ApiResponse<PurchaseOrder>>(
      `${API_CONFIG.ENDPOINTS.PURCHASE_ORDERS}/${id}`,
      dto
    );
    return data;
  },

  /**
   * Delete purchase order
   */
  async delete(id: string): Promise<ApiResponse<void>> {
    const { data } = await apiClient.delete<ApiResponse<void>>(
      `${API_CONFIG.ENDPOINTS.PURCHASE_ORDERS}/${id}`
    );
    return data;
  },

  /**
   * Approve purchase order
   */
  async approve(id: string): Promise<ApiResponse<PurchaseOrder>> {
    const { data } = await apiClient.post<ApiResponse<PurchaseOrder>>(
      `${API_CONFIG.ENDPOINTS.PURCHASE_ORDERS}/${id}/approve`
    );
    return data;
  },

  /**
   * Submit purchase order for approval
   */
  async submit(id: string): Promise<ApiResponse<PurchaseOrder>> {
    const { data } = await apiClient.post<ApiResponse<PurchaseOrder>>(
      `${API_CONFIG.ENDPOINTS.PURCHASE_ORDERS}/${id}/submit`
    );
    return data;
  },

  /**
   * Reject purchase order
   */
  async reject(id: string, reason: string): Promise<ApiResponse<PurchaseOrder>> {
    const { data } = await apiClient.post<ApiResponse<PurchaseOrder>>(
      `${API_CONFIG.ENDPOINTS.PURCHASE_ORDERS}/${id}/reject`,
      { reason }
    );
    return data;
  },

  /**
   * Get purchase order statistics
   */
  async getStats(): Promise<ApiResponse<{
    total: number;
    pending: number;
    approved: number;
    completed: number;
    cancelled: number;
  }>> {
    const { data } = await apiClient.get(`${API_CONFIG.ENDPOINTS.PURCHASE_ORDERS}/stats`);
    return data;
  },
};

// ===========================
// Goods Receipts
// ===========================

export interface GoodsReceiptsQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  qcStatus?: string;
  purchaseOrderId?: string;
}

export interface CreateGoodsReceiptDto {
  purchaseOrderId?: string;
  locationId: string;
  referenceDocument?: string;
  items: {
    itemId: string;
    quantity: number;
    batchNumber?: string;
    expiryDate?: string;
  }[];
}

export interface UpdateGoodsReceiptDto {
  qcStatus?: 'PASSED' | 'FAILED' | 'PENDING';
  qcNotes?: string;
}

export const goodsReceiptsApi = {
  /**
   * Get all goods receipts with pagination
   */
  async getAll(params?: GoodsReceiptsQueryParams): Promise<PaginatedResponse<GoodsReceipt>> {
    const { data } = await apiClient.get<PaginatedResponse<GoodsReceipt>>(
      API_CONFIG.ENDPOINTS.GOODS_RECEIPTS,
      { params }
    );
    return data;
  },

  /**
   * Get goods receipt by ID
   */
  async getById(id: string): Promise<ApiResponse<GoodsReceipt>> {
    const { data } = await apiClient.get<ApiResponse<GoodsReceipt>>(
      `${API_CONFIG.ENDPOINTS.GOODS_RECEIPTS}/${id}`
    );
    return data;
  },

  /**
   * Create new goods receipt
   */
  async create(dto: CreateGoodsReceiptDto): Promise<ApiResponse<GoodsReceipt>> {
    const { data } = await apiClient.post<ApiResponse<GoodsReceipt>>(
      API_CONFIG.ENDPOINTS.GOODS_RECEIPTS,
      dto
    );
    return data;
  },

  /**
   * Update goods receipt
   */
  async update(id: string, dto: UpdateGoodsReceiptDto): Promise<ApiResponse<GoodsReceipt>> {
    const { data } = await apiClient.patch<ApiResponse<GoodsReceipt>>(
      `${API_CONFIG.ENDPOINTS.GOODS_RECEIPTS}/${id}`,
      dto
    );
    return data;
  },

  /**
   * Delete goods receipt
   */
  async delete(id: string): Promise<ApiResponse<void>> {
    const { data } = await apiClient.delete<ApiResponse<void>>(
      `${API_CONFIG.ENDPOINTS.GOODS_RECEIPTS}/${id}`
    );
    return data;
  },

  /**
   * Update QC status for goods receipt item
   */
  async updateQcStatus(
    id: string,
    itemId: string,
    qcStatus: 'PASSED' | 'FAILED' | 'PENDING',
    qcNotes?: string
  ): Promise<ApiResponse<GoodsReceipt>> {
    const { data } = await apiClient.patch<ApiResponse<GoodsReceipt>>(
      `${API_CONFIG.ENDPOINTS.GOODS_RECEIPTS}/${id}/items/${itemId}/qc`,
      { qcStatus, qcNotes }
    );
    return data;
  },

  /**
   * Update overall QC status for goods receipt
   */
  async updateQC(
    id: string,
    qcStatus: 'PASSED' | 'FAILED' | 'PENDING',
    qcNotes?: string,
    qcDate?: string
  ): Promise<ApiResponse<GoodsReceipt>> {
    const { data } = await apiClient.patch<ApiResponse<GoodsReceipt>>(
      `${API_CONFIG.ENDPOINTS.GOODS_RECEIPTS}/${id}/qc`,
      { qcStatus, qcNotes, qcDate }
    );
    return data;
  },
};

export default {
  purchaseOrders: purchaseOrdersApi,
  goodsReceipts: goodsReceiptsApi,
};
