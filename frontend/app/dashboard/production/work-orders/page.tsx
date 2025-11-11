'use client';

/**
 * Work Orders List Page
 * Displays all work orders with search, filter, and status management
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Search, FileText, CheckCircle, XCircle, Clock, Play, MoreVertical } from 'lucide-react';
import {
  useWorkOrders,
  useDeleteWorkOrder,
  useStartWorkOrder,
  useCompleteWorkOrder,
  useCancelWorkOrder,
  useWorkOrderStats,
} from '@/lib/hooks/use-production';
import { WorkOrderStatus } from '@/lib/types';
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

export default function WorkOrdersPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [startId, setStartId] = useState<string | null>(null);
  const [completeDialog, setCompleteDialog] = useState<{ id: string; actualQuantity: number } | null>(null);
  const [cancelDialog, setCancelDialog] = useState<{ id: string; reason: string } | null>(null);

  // Fetch data
  const { data, isLoading } = useWorkOrders({ page, search, status: statusFilter });
  const { data: stats } = useWorkOrderStats();
  
  // Mutations
  const deleteMutation = useDeleteWorkOrder();
  const startMutation = useStartWorkOrder();
  const completeMutation = useCompleteWorkOrder();
  const cancelMutation = useCancelWorkOrder();

  // Handlers
  const handleDelete = () => {
    if (deleteId) {
      deleteMutation.mutate(deleteId);
      setDeleteId(null);
    }
  };

  const handleStart = () => {
    if (startId) {
      startMutation.mutate(startId);
      setStartId(null);
    }
  };

  const handleComplete = () => {
    if (completeDialog) {
      completeMutation.mutate({ id: completeDialog.id, actualQuantity: completeDialog.actualQuantity });
      setCompleteDialog(null);
    }
  };

  const handleCancel = () => {
    if (cancelDialog) {
      cancelMutation.mutate({ id: cancelDialog.id, reason: cancelDialog.reason });
      setCancelDialog(null);
    }
  };

  // Status badge styling
  const getStatusBadge = (status: string) => {
    const styles = {
      PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      IN_PROGRESS: 'bg-blue-100 text-blue-800 border-blue-300',
      COMPLETED: 'bg-green-100 text-green-800 border-green-300',
      CANCELLED: 'bg-red-100 text-red-800 border-red-300',
    };
    return styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-900 to-pink-700 bg-clip-text text-transparent">
              Work Orders
            </h1>
            <p className="text-slate-600 mt-1">Manage production work orders</p>
          </div>
          <Button
            onClick={() => router.push('/dashboard/production/work-orders/new')}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg"
          >
            <Plus className="mr-2 h-4 w-4" />
            New Work Order
          </Button>
        </div>

        {/* Stats Cards */}
        {stats?.data && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                  <p className="text-sm text-slate-600">In Progress</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.data.inProgress}</p>
                </div>
                <Play className="h-8 w-8 text-blue-500" />
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
          </div>
        )}

        {/* Search & Filters */}
        <Card className="p-4 bg-white shadow-md">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
              <Input
                placeholder="Search work orders..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border rounded-lg bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
        </Card>

        {/* Table */}
        <Card className="bg-white shadow-lg overflow-hidden">
          <Table>
            <TableHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
              <TableRow>
                <TableHead className="font-semibold">WO Number</TableHead>
                <TableHead className="font-semibold">Recipe</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="font-semibold">Quantity</TableHead>
                <TableHead className="font-semibold">Scheduled Date</TableHead>
                <TableHead className="font-semibold">Actual Quantity</TableHead>
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
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : data?.data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-slate-500">
                    No work orders found
                  </TableCell>
                </TableRow>
              ) : (
                data?.data.map((wo) => (
                  <TableRow key={wo.id} className="hover:bg-slate-50 transition-colors">
                    <TableCell className="font-medium text-slate-900">{wo.woNumber}</TableCell>
                    <TableCell className="text-slate-700">{wo.recipe?.name || 'N/A'}</TableCell>
                    <TableCell>
                      <Badge className={getStatusBadge(wo.status)}>
                        {wo.status.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-slate-700">{wo.plannedQuantity}</TableCell>
                    <TableCell className="text-slate-700">{wo.scheduledDate ? formatDate(wo.scheduledDate) : '-'}</TableCell>
                    <TableCell className="font-semibold text-slate-900">
                      {wo.actualQuantity || '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem onClick={() => router.push(`/dashboard/production/work-orders/${wo.id}`)}>
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => router.push(`/dashboard/production/work-orders/${wo.id}/edit`)}>
                            Edit
                          </DropdownMenuItem>
                          {wo.status === WorkOrderStatus.PLANNED && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => setStartId(wo.id)}>
                                <Play className="mr-2 h-4 w-4 text-blue-600" />
                                Start Production
                              </DropdownMenuItem>
                            </>
                          )}
                          {wo.status === WorkOrderStatus.IN_PROGRESS && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => setCompleteDialog({ id: wo.id, actualQuantity: wo.plannedQuantity })}>
                                <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                                Complete
                              </DropdownMenuItem>
                            </>
                          )}
                          {(wo.status === WorkOrderStatus.PLANNED || wo.status === WorkOrderStatus.IN_PROGRESS) && (
                            <DropdownMenuItem onClick={() => setCancelDialog({ id: wo.id, reason: '' })}>
                              <XCircle className="mr-2 h-4 w-4 text-red-600" />
                              Cancel
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => setDeleteId(wo.id)}
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

        {/* Pagination */}
        {data && data.pagination && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-600">
              Showing {((data.pagination.page - 1) * data.pagination.limit) + 1} to{' '}
              {Math.min(data.pagination.page * data.pagination.limit, data.pagination.total)} of{' '}
              {data.pagination.total} results
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(page + 1)}
                disabled={page >= data.pagination.totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}

      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Work Order</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this work order? This action cannot be undone.
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

      {/* Start Confirmation Dialog */}
      <AlertDialog open={!!startId} onOpenChange={() => setStartId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Start Work Order</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to start production for this work order?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleStart} className="bg-blue-600 hover:bg-blue-700">
              Start Production
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Complete Dialog with Actual Quantity */}
      <AlertDialog open={!!completeDialog} onOpenChange={() => setCompleteDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Complete Work Order</AlertDialogTitle>
            <AlertDialogDescription>
              Enter the actual quantity produced.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Input
              type="number"
              placeholder="Actual quantity..."
              value={completeDialog?.actualQuantity || ''}
              onChange={(e) => setCompleteDialog(completeDialog ? { ...completeDialog, actualQuantity: parseInt(e.target.value) || 0 } : null)}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleComplete} 
              className="bg-green-600 hover:bg-green-700"
              disabled={!completeDialog?.actualQuantity}
            >
              Complete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Cancel Dialog with Reason */}
      <AlertDialog open={!!cancelDialog} onOpenChange={() => setCancelDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Work Order</AlertDialogTitle>
            <AlertDialogDescription>
              Please provide a reason for cancelling this work order.
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