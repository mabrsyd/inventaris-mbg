"use client"

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import DataTablePagination from './data-table-pagination';
import DataTableToolbar from './data-table-toolbar';
import { Loader2 } from 'lucide-react';

interface Column<T> {
  key: keyof T | string;
  label: string;
  render?: (item: T) => React.ReactNode;
}

interface DataTableProps<T> {
  queryKey: string[];
  fetchData: (params: { page: number; pageSize: number; search?: string }) => Promise<{ data: T[]; total: number }>;
  columns: Column<T>[];
  searchPlaceholder?: string;
  title?: string;
  onAdd?: () => void;
  addLabel?: string;
}

export function DataTable<T extends { id: string | number }>({ 
  queryKey, 
  fetchData, 
  columns, 
  searchPlaceholder = "Search...",
  title,
  onAdd,
  addLabel
}: DataTableProps<T>) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');

  const { data, isLoading, isError } = useQuery({
    queryKey: [...queryKey, page, pageSize, search],
    queryFn: () => fetchData({ page, pageSize, search }),
  });

  const totalPages = data ? Math.ceil(data.total / pageSize) : 0;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (isError) {
    return <div className="text-center text-red-500">Error loading data</div>;
  }

  return (
    <div className="space-y-4">
      <DataTableToolbar 
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder={searchPlaceholder}
        title={title}
        onAdd={onAdd}
        addLabel={addLabel}
      />
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead key={String(column.key)}>{column.label}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            ) : (
              data?.data.map((item) => (
                <TableRow key={item.id}>
                  {columns.map((column) => (
                    <TableCell key={String(column.key)}>
                      {column.render 
                        ? column.render(item) 
                        : String(item[column.key as keyof T] ?? '')}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination
        currentPage={page}
        totalPages={totalPages}
        totalItems={data?.total || 0}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
      />
    </div>
  );
}

export default DataTable;