'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Search, FileText, CheckCircle, XCircle, Clock, Truck, MoreVertical } from 'lucide-react';
import {
  useDeliveryOrders,
  useDeleteDeliveryOrder,
  useDispatchDeliveryOrder,
  useCompleteDeliveryOrder,
  useCancelDeliveryOrder,
  useDeliveryOrderStats,
} from '@/lib/hooks/use-distribution';
import { DeliveryOrderStatus } from '@/lib/types';
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

export default function DeliveryOrdersPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [dispatchId, setDispatchId] = useState<string | null>(null);
  const [completeId, setCompleteId] = useState<string | null>(null);
  const [cancelDialog, setCancelDialog] = useState<{ id: string; reason: string } | null>(null);

  const { data, isLoading } = useDeliveryOrders({ page, search, status: statusFilter });
  const { data: stats } = useDeliveryOrderStats();
  
  const deleteMutation = useDeleteDeliveryOrder();
  const dispatchMutation = useDispatchDeliveryOrder();
  const completeMutation = useCompleteDeliveryOrder();
  const cancelMutation = useCancelDeliveryOrder();

  const handleDelete = () => {
    if (deleteId) {
      deleteMutation.mutate(deleteId);
      setDeleteId(null);
    }
  };

  const handleDispatch = () => {
    if (dispatchId) {
      dispatchMutation.mutate(dispatchId);
      setDispatchId(null);
    }
  };

  const handleComplete = () => {
    if (completeId) {
      completeMutation.mutate(completeId);
      setCompleteId(null);
    }
  };

  const handleCancel = () => {
    if (cancelDialog) {
      cancelMutation.mutate({ id: cancelDialog.id, reason: cancelDialog.reason });
      setCancelDialog(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      DISPATCHED: 'bg-blue-100 text-blue-800 border-blue-300',
      COMPLETED: 'bg-green-100 text-green-800 border-green-300',
      CANCELLED: 'bg-red-100 text-red-800 border-red-300',
    };
    return styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-emerald-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-green-900 to-emerald-700 bg-clip-text text-transparent">
              Delivery Orders
            </h1>
            <p className="text-slate-600 mt-1">Manage distribution delivery orders</p>
          </div>
          <Button
            onClick={() => router.push('/dashboard/distribution/delivery-orders/new')}
            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg"
          >
            <Plus className="mr-2 h-4 w-4" />
            New Delivery Order
          </Button>
        </div>

        {stats?.data && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Card className="p-4 bg-white shadow-md hover:shadow-lg transition-shadow border-l-4 border-slate-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Total Orders</p>
                  <p className="text-2xl font-bold text-slate-900">{stats.data.total}</p>
                </div>
                <FileText className="h-8 w-8 text-slate-500" />
              </div>
            </Card>

            <Card className="p-4 bg-white shadow-md hover:shadow-lg transition-shadow border-l-4 border-yellow-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Pending</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.data.pending}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-500" />
              </div>
            </Card>

            <Card className="p-4 bg-white shadow-md hover:shadow-lg transition-shadow border-l-4 border-blue-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Dispatched</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.data.dispatched}</p>
                </div>
                <Truck className="h-8 w-8 text-blue-500" />
              </div>
            </Card>

            <Card className="p-4 bg-white shadow-md hover:shadow-lg transition-shadow border-l-4 border-green-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Completed</p>
                  <p className="text-2xl font-bold text-green-600">{stats.data.completed}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </Card>

            <Card className="p-4 bg-white shadow-md hover:shadow-lg transition-shadow border-l-4 border-red-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Cancelled</p>
                  <p className="text-2xl font-bold text-red-600">{stats.data.cancelled}</p>
                </div>
                <XCircle className="h-8 w-8 text-red-500" />
              </div>
            </Card>
          </div>
        )}

        <Card className="p-4 bg-white shadow-md">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
              <Input
                placeholder="Search delivery orders..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border rounded-lg bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="DISPATCHED">Dispatched</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
        </Card>

        <Card className="bg-white shadow-lg overflow-hidden">
          <Table>
            <TableHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
              <TableRow>
                <TableHead className="font-semibold">DO Number</TableHead>
                <TableHead className="font-semibold">Beneficiary</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="font-semibold">Scheduled Date</TableHead>
                <TableHead className="font-semibold">Actual Date</TableHead>
                <TableHead className="font-semibold">Created At</TableHead>
                <TableHead className="text-right font-semibold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : data?.data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-slate-500">
                    No delivery orders found
                  </TableCell>
                </TableRow>
              ) : (
                data?.data.map((order) => (
                  <TableRow key={order.id} className="hover:bg-slate-50 transition-colors">
                    <TableCell className="font-medium text-slate-900">{order.doNumber}</TableCell>
                    <TableCell className="text-slate-700">{order.beneficiary?.name || 'N/A'}</TableCell>
                    <TableCell>
                      <Badge className={getStatusBadge(order.status)}>
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-slate-700">{order.scheduledDeliveryDate ? formatDate(order.scheduledDeliveryDate) : '-'}</TableCell>
                    <TableCell className="text-slate-700">{order.actualDeliveryDate ? formatDate(order.actualDeliveryDate) : '-'}</TableCell>
                    <TableCell className="text-slate-600">{formatDate(order.createdAt)}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem onClick={() => router.push(`/distribution/delivery-orders/${order.id}`)}>
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => router.push(`/distribution/delivery-orders/${order.id}/edit`)}>
                            Edit
                          </DropdownMenuItem>
                          {order.status === DeliveryOrderStatus.PENDING && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => setDispatchId(order.id)}>
                                <Truck className="mr-2 h-4 w-4 text-blue-600" />
                                Dispatch
                              </DropdownMenuItem>
                            </>
                          )}
                          {order.status === DeliveryOrderStatus.IN_TRANSIT && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => setCompleteId(order.id)}>
                                <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                                Complete Delivery
                              </DropdownMenuItem>
                            </>
                          )}
                          {(order.status === DeliveryOrderStatus.PENDING || order.status === DeliveryOrderStatus.IN_TRANSIT) && (
                            <DropdownMenuItem onClick={() => setCancelDialog({ id: order.id, reason: '' })}>
                              <XCircle className="mr-2 h-4 w-4 text-red-600" />
                              Cancel
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => setDeleteId(order.id)}
                            className="text-red-600 focus:text-red-600"
                          >
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
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
            <AlertDialogTitle>Delete Delivery Order</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this delivery order? This action cannot be undone.
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

      <AlertDialog open={!!dispatchId} onOpenChange={() => setDispatchId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Dispatch Delivery Order</AlertDialogTitle>
            <AlertDialogDescription>
              Confirm to dispatch this delivery order?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDispatch} className="bg-blue-600 hover:bg-blue-700">
              Dispatch
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!completeId} onOpenChange={() => setCompleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Complete Delivery</AlertDialogTitle>
            <AlertDialogDescription>
              Mark this delivery as completed?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleComplete} className="bg-green-600 hover:bg-green-700">
              Complete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!cancelDialog} onOpenChange={() => setCancelDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Delivery Order</AlertDialogTitle>
            <AlertDialogDescription>
              Please provide a reason for cancelling this delivery order.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Input
              placeholder="Cancellation reason..."
              value={cancelDialog?.reason || ''}
              onChange={(e) => setCancelDialog(cancelDialog ? { ...cancelDialog, reason: e.target.value } : null)}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleCancel} 
              className="bg-red-600 hover:bg-red-700"
              disabled={!cancelDialog?.reason}
            >
              Cancel Order
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
