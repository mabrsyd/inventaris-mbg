"use client"

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Package, MapPin, Calendar, AlertTriangle, Search } from 'lucide-react';
import { useStock } from '@/lib/hooks/use-stock';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';

const StockPage = () => {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  const { data, isLoading } = useStock({ page, limit: 10, search });

  const getStockStatus = (quantity: number, reserved: number) => {
    const available = quantity - reserved;
    if (available <= 0) return { label: 'Out of Stock', color: 'bg-red-50 border-red-300 text-red-700' };
    if (available <= 10) return { label: 'Low Stock', color: 'bg-orange-50 border-orange-300 text-orange-700' };
    return { label: 'In Stock', color: 'bg-green-50 border-green-300 text-green-700' };
  };

  const isExpiringSoon = (expiryDate?: Date | string) => {
    if (!expiryDate) return false;
    const expiry = new Date(expiryDate);
    const now = new Date();
    const daysUntilExpiry = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
  };

  const isExpired = (expiryDate?: Date | string) => {
    if (!expiryDate) return false;
    return new Date(expiryDate) < new Date();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-900 to-indigo-700 bg-clip-text text-transparent">
              Stock Management
            </h1>
            <p className="text-slate-600 mt-1">Monitor stock levels across all locations</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4 bg-white shadow-md hover:shadow-lg transition-shadow border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Total Stock Records</p>
                <p className="text-2xl font-bold text-slate-900">{data?.pagination?.total || 0}</p>
              </div>
              <Package className="h-8 w-8 text-blue-500" />
            </div>
          </Card>

          <Card className="p-4 bg-white shadow-md hover:shadow-lg transition-shadow border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Total Quantity</p>
                <p className="text-2xl font-bold text-green-600">
                  {data?.data.reduce((sum: number, s: any) => sum + (s.quantity || 0), 0) || 0}
                </p>
              </div>
              <Package className="h-8 w-8 text-green-500" />
            </div>
          </Card>

          <Card className="p-4 bg-white shadow-md hover:shadow-lg transition-shadow border-l-4 border-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Reserved</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {data?.data.reduce((sum: number, s: any) => sum + (s.reservedQuantity || 0), 0) || 0}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-yellow-500" />
            </div>
          </Card>

          <Card className="p-4 bg-white shadow-md hover:shadow-lg transition-shadow border-l-4 border-indigo-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Available</p>
                <p className="text-2xl font-bold text-indigo-600">
                  {data?.data.reduce((sum: number, s: any) => sum + ((s.quantity || 0) - (s.reservedQuantity || 0)), 0) || 0}
                </p>
              </div>
              <Package className="h-8 w-8 text-indigo-500" />
            </div>
          </Card>
        </div>

        {/* Search */}
        <Card className="p-4 bg-white shadow-md">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
              <Input
                placeholder="Cari item atau lokasi..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </Card>

        {/* Table */}
        <Card className="bg-white shadow-lg overflow-hidden">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Stock Records
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
                <TableRow>
                  <TableHead className="font-semibold">Item</TableHead>
                  <TableHead className="font-semibold">SKU</TableHead>
                  <TableHead className="font-semibold">Location</TableHead>
                  <TableHead className="font-semibold">Batch</TableHead>
                  <TableHead className="font-semibold">Quantity</TableHead>
                  <TableHead className="font-semibold">Reserved</TableHead>
                  <TableHead className="font-semibold">Available</TableHead>
                  <TableHead className="font-semibold">Expiry Date</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    </TableRow>
                  ))
                ) : data?.data.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-slate-500">
                      Tidak ada data stock
                    </TableCell>
                  </TableRow>
                ) : (
                  data?.data.map((stock: any) => {
                    const available = stock.quantity - stock.reservedQuantity;
                    const stockStatus = getStockStatus(stock.quantity, stock.reservedQuantity);
                    const expiringSoon = isExpiringSoon(stock.expiryDate);
                    const expired = isExpired(stock.expiryDate);

                    return (
                      <TableRow key={stock.id} className="hover:bg-slate-50 transition-colors">
                        <TableCell className="font-medium text-slate-900">
                          {stock.item?.name || 'N/A'}
                        </TableCell>
                        <TableCell className="text-slate-600 font-mono text-xs">
                          {stock.item?.sku || '-'}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3 text-slate-400" />
                            <span className="text-slate-600">{stock.location?.name || 'N/A'}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-slate-600 font-mono text-xs">
                          {stock.batchNumber || '-'}
                        </TableCell>
                        <TableCell className="font-semibold text-slate-900">
                          {stock.quantity || 0}
                        </TableCell>
                        <TableCell className="text-yellow-600">
                          {stock.reservedQuantity || 0}
                        </TableCell>
                        <TableCell className="font-semibold text-green-600">
                          {available}
                        </TableCell>
                        <TableCell>
                          {stock.expiryDate ? (
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3 text-slate-400" />
                              <span className={`text-xs ${expired ? 'text-red-600 font-semibold' : expiringSoon ? 'text-orange-600' : 'text-slate-600'}`}>
                                {new Date(stock.expiryDate).toLocaleDateString('id-ID')}
                              </span>
                              {expired && <Badge variant="destructive" className="ml-1">Kadaluarsa</Badge>}
                              {expiringSoon && !expired && <Badge variant="outline" className="ml-1 bg-orange-50 text-orange-700 border-orange-300">Segera Kadaluarsa</Badge>}
                            </div>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={stockStatus.color}>
                            {stockStatus.label}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>

            {/* Pagination */}
            {data && data.pagination && data.pagination.totalPages > 1 && (
              <div className="flex items-center justify-between mt-4">
                <p className="text-sm text-slate-600">
                  Halaman {data.pagination.page} dari {data.pagination.totalPages}
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setPage(page - 1)} disabled={page === 1}>
                    Sebelumnya
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setPage(page + 1)} disabled={page >= data.pagination.totalPages}>
                    Selanjutnya
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

      </div>
    </div>
  );
};

export default StockPage;