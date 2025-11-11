"use client"

import React from 'react';
import { TransactionReport } from '@/lib/api/reports.service';
import DataTable from '@/components/tables/data-table';
import apiClient from '@/lib/api/client';
import type { PaginatedResponse } from '@/lib/types';

const AuditLogsPage = () => {
  const fetchAuditLogs = async (params: { page: number; pageSize: number; search?: string }) => {
    // Default to last 30 days
    const endDate = new Date().toISOString().split('T')[0];
    const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    const { data } = await apiClient.get<PaginatedResponse<TransactionReport>>('/api/reporting/transactions', {
      params: {
        startDate,
        endDate,
        page: params.page,
        limit: params.pageSize,
        search: params.search,
      },
    });
    // Map items to include an `id` required by DataTable (use referenceId as stable id)
    const mapped = data.data.map((d) => ({ ...d, id: d.referenceId || `${d.type}-${d.date}` }));

    return {
      data: mapped,
      total: data.pagination.total,
    };
  };

  const columns = [
    { key: 'date', label: 'Date', render: (item: TransactionReport & { id: string }) => item.date },
    { key: 'type', label: 'Type', render: (item: TransactionReport & { id: string }) => item.type },
    { key: 'referenceId', label: 'Reference', render: (item: TransactionReport & { id: string }) => item.referenceId },
    { key: 'itemName', label: 'Item', render: (item: TransactionReport & { id: string }) => item.itemName },
    { key: 'quantity', label: 'Quantity', render: (item: TransactionReport & { id: string }) => item.quantity },
    { key: 'location', label: 'Location', render: (item: TransactionReport & { id: string }) => item.location },
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Audit Logs</h1>
      <DataTable
        queryKey={['audit-logs']}
        fetchData={fetchAuditLogs}
        columns={columns}
        searchPlaceholder="Search audit logs..."
        title="Audit Logs"
      />
    </div>
  );
};

export default AuditLogsPage;