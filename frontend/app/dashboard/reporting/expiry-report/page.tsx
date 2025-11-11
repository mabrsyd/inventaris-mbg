"use client"

import React from 'react';
import DataTable from '@/components/tables/data-table';
import apiClient from '@/lib/api/client';
import type { PaginatedResponse } from '@/lib/types';
import { LowStockAlert } from '@/lib/api/reports.service';

const ExpiryReportPage = () => {
  const fetchExpiry = async (params: { page: number; pageSize: number; search?: string }) => {
    const { data } = await apiClient.get<PaginatedResponse<LowStockAlert>>('/api/reporting/low-stock-alerts', {
      params: {
        page: params.page,
        limit: params.pageSize,
        search: params.search,
      },
    });

    // ensure items have `id` for DataTable
    const mapped = data.data.map((d: LowStockAlert, idx: number) => ({ ...d, id: d.itemId || `item-${idx}` }));

    return {
      data: mapped,
      total: data.pagination?.total ?? mapped.length,
    };
  };

  const columns = [
    { key: 'itemName', label: 'Item' , render: (it: LowStockAlert & { id: string }) => it.itemName },
    { key: 'itemCode', label: 'Code' , render: (it: LowStockAlert & { id: string }) => it.itemCode },
    { key: 'currentStock', label: 'Current', render: (it: LowStockAlert & { id: string }) => it.currentStock },
    { key: 'reorderPoint', label: 'Reorder', render: (it: LowStockAlert & { id: string }) => it.reorderPoint },
    { key: 'deficit', label: 'Deficit', render: (it: LowStockAlert & { id: string }) => it.deficit },
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Expiry / Low Stock Alerts</h1>
      <DataTable
        queryKey={["expiry-report"]}
        fetchData={fetchExpiry}
        columns={columns}
        searchPlaceholder="Search low stock..."
        title="Low Stock Alerts"
      />
    </div>
  );
};

export default ExpiryReportPage;