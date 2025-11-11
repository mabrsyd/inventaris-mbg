'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Search, FileText, Package, CheckCircle, XCircle, AlertCircle, MoreVertical } from 'lucide-react';
import {
  useGoodsReceipts,
  useDeleteGoodsReceipt,
} from '@/lib/hooks/use-procurement';
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
import { formatDate } from '@/lib/utils/date';

export default function GoodsReceiptsPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [qcFilter, setQcFilter] = useState<string>('');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data, isLoading } = useGoodsReceipts({ page, search, qcStatus: qcFilter });
  const deleteMutation = useDeleteGoodsReceipt();

  const handleDelete = () => {
    if (deleteId) {
      deleteMutation.mutate(deleteId);
      setDeleteId(null);
    }
  };

  const getQcBadge = (status: string) => {
    const styles = {
      PASSED: 'bg-green-100 text-green-800 border-green-300',
      FAILED: 'bg-red-100 text-red-800 border-red-300',
      PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    };
    return styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800';
  };

  const getQcIcon = (status: string) => {
    switch (status) {
      case 'PASSED':
        return <CheckCircle className="h-4 w-4" />;
      case 'FAILED':
        return <XCircle className="h-4 w-4" />;
      case 'PENDING':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-900 to-purple-700 bg-clip-text text-transparent">
              Goods Receipts
            </h1>
            <p className="text-slate-600 mt-1">Manage incoming goods and quality control</p>
          </div>
          <Button
            onClick={() => router.push('/dashboard/procurement/goods-receipts/new')}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg"
          >
            <Plus className="mr-2 h-4 w-4" />
            New Goods Receipt
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4 bg-white shadow-md hover:shadow-lg transition-shadow border-l-4 border-slate-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Total Receipts</p>
                <p className="text-2xl font-bold text-slate-900">{data?.pagination?.total || 0}</p>
              </div>
              <FileText className="h-8 w-8 text-slate-500" />
            </div>
          </Card>

          <Card className="p-4 bg-white shadow-md hover:shadow-lg transition-shadow border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">QC Passed</p>
                <p className="text-2xl font-bold text-green-600">
                  {data?.data.filter((gr: any) => gr.items && gr.items.length > 0 && gr.items.every((i: any) => i.qcStatus === 'PASSED')).length || 0}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </Card>

          <Card className="p-4 bg-white shadow-md hover:shadow-lg transition-shadow border-l-4 border-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">QC Pending</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {data?.data.filter((gr: any) => gr.items && gr.items.length > 0 && gr.items.some((i: any) => i.qcStatus === 'PENDING')).length || 0}
                </p>
              </div>
              <AlertCircle className="h-8 w-8 text-yellow-500" />
            </div>
          </Card>

          <Card className="p-4 bg-white shadow-md hover:shadow-lg transition-shadow border-l-4 border-red-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">QC Failed</p>
                <p className="text-2xl font-bold text-red-600">
                  {data?.data.filter((gr: any) => gr.items && gr.items.length > 0 && gr.items.some((i: any) => i.qcStatus === 'FAILED')).length || 0}
                </p>
              </div>
              <XCircle className="h-8 w-8 text-red-500" />
            </div>
          </Card>
        </div>

        <Card className="p-4 bg-white shadow-md">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
              <Input
                placeholder="Search goods receipts..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={qcFilter}
              onChange={(e) => setQcFilter(e.target.value)}
              className="px-4 py-2 border rounded-lg bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All QC Status</option>
              <option value="PASSED">Passed</option>
              <option value="PENDING">Pending</option>
              <option value="FAILED">Failed</option>
            </select>
          </div>
        </Card>

        <Card className="bg-white shadow-lg overflow-hidden">
          <Table>
            <TableHeader className="bg-gradient-to-r from-indigo-50 to-purple-50">
              <TableRow>
                <TableHead className="font-semibold">GR Number</TableHead>
                <TableHead className="font-semibold">Purchase Order</TableHead>
                <TableHead className="font-semibold">Received Date</TableHead>
                <TableHead className="font-semibold">Location</TableHead>
                <TableHead className="font-semibold">QC Status</TableHead>
                <TableHead className="font-semibold">Items Count</TableHead>
                <TableHead className="text-right font-semibold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : data?.data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-slate-500">
                    No goods receipts found
                  </TableCell>
                </TableRow>
              ) : (
                data?.data.map((gr: any) => {
                  const allPassed = gr.items && gr.items.length > 0 ? gr.items.every((i: any) => i.qcStatus === 'PASSED') : false;
                  const anyFailed = gr.items && gr.items.length > 0 ? gr.items.some((i: any) => i.qcStatus === 'FAILED') : false;
                  const overallQc = anyFailed ? 'FAILED' : allPassed ? 'PASSED' : 'PENDING';
                  
                  return (
                    <TableRow key={gr.id} className="hover:bg-slate-50 transition-colors">
                      <TableCell className="font-medium text-slate-900">{gr.receiptNumber}</TableCell>
                      <TableCell className="text-slate-700">{gr.purchaseOrder?.poNumber || 'N/A'}</TableCell>
                      <TableCell className="text-slate-700">{formatDate(gr.receivedDate)}</TableCell>
                      <TableCell className="text-slate-700">{gr.location?.name || 'N/A'}</TableCell>
                      <TableCell>
                        <Badge className={getQcBadge(overallQc)}>
                          <span className="flex items-center gap-1">
                            {getQcIcon(overallQc)}
                            {overallQc}
                          </span>
                        </Badge>
                      </TableCell>
                      <TableCell className="text-slate-700">{gr.items?.length || 0} items</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem onClick={() => router.push(`/dashboard/procurement/goods-receipts/${gr.id}`)}>
                              <FileText className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => setDeleteId(gr.id)}
                              className="text-red-600 focus:text-red-600"
                            >
                              <XCircle className="mr-2 h-4 w-4" />
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
            <AlertDialogTitle>Delete Goods Receipt</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this goods receipt? This action cannot be undone.
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
