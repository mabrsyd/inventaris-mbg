"use client"

import React from 'react';
import DataTable from '@/components/tables/data-table';
import apiClient from '@/lib/api/client';
import type { StockReport } from '@/lib/api/reports.service';
import type { PaginatedResponse } from '@/lib/types';

const StockReportPage: React.FC = () => {
  const fetchStock = async (params: { page: number; pageSize: number; search?: string }) => {
    const { data } = await apiClient.get<PaginatedResponse<StockReport>>('/api/reporting/stock', {
      params: {
        page: params.page,
        limit: params.pageSize,
        search: params.search,
      },
    });

    const mapped = data.data.map((d) => ({ ...d, id: d.itemId }));

    return {
      data: mapped,
      total: data.pagination?.total ?? mapped.length,
    };
  };

  const columns = [
    { key: 'itemName', label: 'Item', render: (it: StockReport & { id: string }) => it.itemName },
    { key: 'itemCode', label: 'Code', render: (it: StockReport & { id: string }) => it.itemCode },
    { key: 'totalQuantity', label: 'Total', render: (it: StockReport & { id: string }) => it.totalQuantity },
    { key: 'needsReorder', label: 'Needs Reorder', render: (it: StockReport & { id: string }) => (it.needsReorder ? 'Yes' : 'No') },
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Stock Report</h1>
      <DataTable
        queryKey={["stock-report"]}
        fetchData={fetchStock}
        columns={columns}
        searchPlaceholder="Search stock report..."
        title="Stock Report"
      />
    </div>
  );
};

export default StockReportPage;