/**
 * Reporting API Service
 * Handles various inventory and system reports
 */

import apiClient from './client';
import type { ApiResponse } from '../types';

// ===========================
// Report Types
// ===========================

export interface StockReport {
  itemId: string;
  itemName: string;
  itemCode: string;
  totalQuantity: number;
  locationBreakdown: {
    locationId: string;
    locationName: string;
    quantity: number;
  }[];
  reorderPoint?: number;
  needsReorder: boolean;
}

export interface TransactionReport {
  date: string;
  type: 'INBOUND' | 'OUTBOUND' | 'TRANSFER' | 'ADJUSTMENT';
  referenceId: string;
  itemName: string;
  quantity: number;
  location: string;
}

export interface ProcurementReport {
  supplierId: string;
  supplierName: string;
  totalOrders: number;
  totalAmount: number;
  pendingOrders: number;
  completedOrders: number;
  averageDeliveryTime: number;
}

export interface ProductionReport {
  recipeId: string;
  recipeName: string;
  totalProduced: number;
  totalWorkOrders: number;
  completedWorkOrders: number;
  averageEfficiency: number;
}

export interface DistributionReport {
  beneficiaryId: string;
  beneficiaryName: string;
  totalDeliveries: number;
  totalItemsDelivered: number;
  pendingDeliveries: number;
  completedDeliveries: number;
}

export interface LowStockAlert {
  itemId: string;
  itemName: string;
  itemCode: string;
  currentStock: number;
  reorderPoint: number;
  deficit: number;
  locations: string[];
}

export interface DashboardStats {
  inventory: {
    totalItems: number;
    totalStockValue: number;
    lowStockItems: number;
    outOfStockItems: number;
  };
  procurement: {
    pendingPurchaseOrders: number;
    totalPurchaseValue: number;
    pendingGoodsReceipts: number;
  };
  production: {
    activeWorkOrders: number;
    completedThisMonth: number;
    totalProduction: number;
  };
  distribution: {
    pendingDeliveries: number;
    completedThisMonth: number;
    totalBeneficiaries: number;
  };
}

// ===========================
// Report Parameters
// ===========================

export interface StockReportParams {
  locationId?: string;
  categoryId?: string;
  lowStockOnly?: boolean;
  startDate?: string;
  endDate?: string;
}

export interface TransactionReportParams {
  startDate: string;
  endDate: string;
  type?: string;
  itemId?: string;
  locationId?: string;
}

export interface ProcurementReportParams {
  startDate: string;
  endDate: string;
  supplierId?: string;
}

export interface ProductionReportParams {
  startDate: string;
  endDate: string;
  recipeId?: string;
}

export interface DistributionReportParams {
  startDate: string;
  endDate: string;
  beneficiaryId?: string;
}

// ===========================
// Reporting API
// ===========================

export const reportsApi = {
  /**
   * Get stock report
   */
  async getStockReport(params?: StockReportParams): Promise<ApiResponse<StockReport[]>> {
    const { data } = await apiClient.get<ApiResponse<StockReport[]>>(
      '/api/reporting/stock',
      { params }
    );
    return data;
  },

  /**
   * Get transaction history report
   */
  async getTransactionReport(params: TransactionReportParams): Promise<ApiResponse<TransactionReport[]>> {
    const { data } = await apiClient.get<ApiResponse<TransactionReport[]>>(
      '/api/reporting/transactions',
      { params }
    );
    return data;
  },

  /**
   * Get procurement report
   */
  async getProcurementReport(params: ProcurementReportParams): Promise<ApiResponse<ProcurementReport[]>> {
    const { data } = await apiClient.get<ApiResponse<ProcurementReport[]>>(
      '/api/reporting/procurement',
      { params }
    );
    return data;
  },

  /**
   * Get production report
   */
  async getProductionReport(params: ProductionReportParams): Promise<ApiResponse<ProductionReport[]>> {
    const { data } = await apiClient.get<ApiResponse<ProductionReport[]>>(
      '/api/reporting/production',
      { params }
    );
    return data;
  },

  /**
   * Get distribution report
   */
  async getDistributionReport(params: DistributionReportParams): Promise<ApiResponse<DistributionReport[]>> {
    const { data } = await apiClient.get<ApiResponse<DistributionReport[]>>(
      '/api/reporting/distribution',
      { params }
    );
    return data;
  },

  /**
   * Get low stock alerts
   */
  async getLowStockAlerts(): Promise<ApiResponse<LowStockAlert[]>> {
    const { data } = await apiClient.get<ApiResponse<LowStockAlert[]>>(
      '/api/reporting/alerts/low-stock'
    );
    return data;
  },

  /**
   * Get dashboard statistics
   */
  async getDashboardStats(): Promise<ApiResponse<DashboardStats>> {
    const { data } = await apiClient.get<ApiResponse<DashboardStats>>(
      '/api/reporting/dashboard'
    );
    return data;
  },

  /**
   * Export report to CSV
   */
  async exportReport(reportType: string, params: any): Promise<Blob> {
    const { data } = await apiClient.get(
      `/api/reporting/export/${reportType}`,
      {
        params,
        responseType: 'blob',
      }
    );
    return data;
  },
};

export default reportsApi;
