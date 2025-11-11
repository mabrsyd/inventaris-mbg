'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Search, Package, AlertTriangle, DollarSign, MoreVertical } from 'lucide-react';
import { useItems, useDeleteItem } from '@/lib/hooks/use-items';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';

export default function ItemsPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data, isLoading } = useItems({ page, search, categoryId: categoryFilter });
  const deleteMutation = useDeleteItem();

  const handleDelete = () => {
    if (deleteId) {
      deleteMutation.mutate(deleteId);
      setDeleteId(null);
    }
  };

  const getStockStatus = (item: any) => {
    // Calculate total stock from all locations
    const totalStock = item.stock?.reduce((sum: number, s: any) => sum + (s.quantity || 0), 0) || 0;
    const totalReserved = item.stock?.reduce((sum: number, s: any) => sum + (s.reservedQuantity || 0), 0) || 0;
    const available = totalStock - totalReserved;
    
    if (available === 0) return { label: 'Out of Stock', color: 'bg-red-50 border-red-300 text-red-700' };
    if (available <= (item.reorderPoint || 0)) return { label: 'Low Stock', color: 'bg-orange-50 border-orange-300 text-orange-700' };
    return { label: 'In Stock', color: 'bg-green-50 border-green-300 text-green-700' };
  };

  // Calculate stats from items with stock data
  const totalValue = data?.data.reduce((acc: number, item: any) => {
    const totalStock = item.stock?.reduce((sum: number, s: any) => sum + (s.quantity || 0), 0) || 0;
    return acc + (totalStock * (item.price || 0));
  }, 0) || 0;

  const lowStockCount = data?.data.filter((item: any) => {
    const totalStock = item.stock?.reduce((sum: number, s: any) => sum + (s.quantity || 0), 0) || 0;
    const totalReserved = item.stock?.reduce((sum: number, s: any) => sum + (s.reservedQuantity || 0), 0) || 0;
    const available = totalStock - totalReserved;
    return available > 0 && available <= (item.reorderPoint || 0);
  }).length || 0;

  const outOfStockCount = data?.data.filter((item: any) => {
    const totalStock = item.stock?.reduce((sum: number, s: any) => sum + (s.quantity || 0), 0) || 0;
    const totalReserved = item.stock?.reduce((sum: number, s: any) => sum + (s.reservedQuantity || 0), 0) || 0;
    const available = totalStock - totalReserved;
    return available === 0;
  }).length || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-900 to-blue-700 bg-clip-text text-transparent">
              Inventory Items
            </h1>
            <p className="text-slate-600 mt-1">Manage your inventory items and stock levels</p>
          </div>
          <Button
            onClick={() => router.push('/dashboard/inventory/items/new')}
            className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white shadow-lg"
          >
            <Plus className="mr-2 h-4 w-4" />
            New Item
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4 bg-white shadow-md hover:shadow-lg transition-shadow border-l-4 border-indigo-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Total Items</p>
                <p className="text-2xl font-bold text-slate-900">{data?.pagination?.total || 0}</p>
              </div>
              <Package className="h-8 w-8 text-indigo-500" />
            </div>
          </Card>

          <Card className="p-4 bg-white shadow-md hover:shadow-lg transition-shadow border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Total Value</p>
                <p className="text-2xl font-bold text-green-600">${totalValue.toLocaleString()}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
          </Card>

          <Card className="p-4 bg-white shadow-md hover:shadow-lg transition-shadow border-l-4 border-orange-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Low Stock</p>
                <p className="text-2xl font-bold text-orange-600">{lowStockCount}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-500" />
            </div>
          </Card>

          <Card className="p-4 bg-white shadow-md hover:shadow-lg transition-shadow border-l-4 border-red-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Out of Stock</p>
                <p className="text-2xl font-bold text-red-600">{outOfStockCount}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </Card>
        </div>

        <Card className="p-4 bg-white shadow-md">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
              <Input
                placeholder="Search items..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </Card>

        <Card className="bg-white shadow-lg overflow-hidden">
          <Table>
            <TableHeader className="bg-gradient-to-r from-indigo-50 to-blue-50">
              <TableRow>
                <TableHead className="font-semibold">Item Name</TableHead>
                <TableHead className="font-semibold">SKU</TableHead>
                <TableHead className="font-semibold">Category</TableHead>
                <TableHead className="font-semibold">Type</TableHead>
                <TableHead className="font-semibold">Total Stock</TableHead>
                <TableHead className="font-semibold">Available</TableHead>
                <TableHead className="font-semibold">Reorder Point</TableHead>
                <TableHead className="font-semibold">Price</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="text-right font-semibold">Actions</TableHead>
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
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : data?.data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-8 text-slate-500">
                    No items found
                  </TableCell>
                </TableRow>
              ) : (
                data?.data.map((item: any) => {
                  const totalStock = item.stock?.reduce((sum: number, s: any) => sum + (s.quantity || 0), 0) || 0;
                  const totalReserved = item.stock?.reduce((sum: number, s: any) => sum + (s.reservedQuantity || 0), 0) || 0;
                  const available = totalStock - totalReserved;
                  const stockStatus = getStockStatus(item);
                  
                  return (
                    <TableRow key={item.id} className="hover:bg-slate-50 transition-colors">
                      <TableCell className="font-medium text-slate-900">{item.name}</TableCell>
                      <TableCell className="text-slate-600 font-mono text-xs">{item.sku}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-indigo-50 border-indigo-300 text-indigo-700">
                          {item.category?.name || 'N/A'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-blue-50 border-blue-300 text-blue-700">
                          {item.itemType || 'N/A'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-slate-900 font-semibold">{totalStock}</TableCell>
                      <TableCell className="text-green-600 font-semibold">{available}</TableCell>
                      <TableCell className="text-slate-600">{item.reorderPoint || 0}</TableCell>
                      <TableCell className="text-slate-900 font-medium">
                        ${item.price?.toFixed(2) || '0.00'}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={stockStatus.color}>
                          {stockStatus.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem onClick={() => router.push(`/dashboard/inventory/items/${item.id}`)}>
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => router.push(`/dashboard/inventory/items/${item.id}`)}>
                              Edit Item
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => setDeleteId(item.id)}
                              className="text-red-600 focus:text-red-600"
                            >
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </Card>

        {data && data.pagination && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-600">
              Showing {((data.pagination.page - 1) * data.pagination.limit) + 1} to{' '}
              {Math.min(data.pagination.page * data.pagination.limit, data.pagination.total)} of{' '}
              {data.pagination.total} results
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setPage(page - 1)} disabled={page === 1}>
                Previous
              </Button>
              <Button variant="outline" size="sm" onClick={() => setPage(page + 1)} disabled={page >= data.pagination.totalPages}>
                Next
              </Button>
            </div>
          </div>
        )}

      </div>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Item</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this item? This action cannot be undone and will affect inventory records.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
