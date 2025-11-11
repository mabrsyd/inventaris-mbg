'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useWorkOrder, useDeleteWorkOrder, useCompleteWorkOrder, useCancelWorkOrder } from '@/lib/hooks/use-production';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { WorkOrderStatus } from '@/lib/types';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  AlertDialogFooter,
} from '@/components/ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal } from 'lucide-react';
import { formatDate } from '@/lib/utils/date';

export default function WorkOrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const workOrderId = params.id as string;
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const { data: workOrderResponse, isLoading: isLoadingWorkOrder } = useWorkOrder(workOrderId);
  const { mutate: deleteWorkOrder, isPending: isDeleting } = useDeleteWorkOrder();
  const { mutate: completeWorkOrder, isPending: isCompleting } = useCompleteWorkOrder();
  const { mutate: cancelWorkOrder, isPending: isCanceling } = useCancelWorkOrder();

  if (isLoadingWorkOrder) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
      </div>
    );
  }

  const workOrder = workOrderResponse?.data;

  if (!workOrder) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <p className="text-slate-600">Work order not found</p>
        <Button onClick={() => router.back()} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Go Back
        </Button>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      IN_PROGRESS: 'bg-blue-100 text-blue-800',
      COMPLETED: 'bg-green-100 text-green-800',
      CANCELLED: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-slate-100 text-slate-800';
  };

  const handleDelete = () => {
    deleteWorkOrder(workOrderId, {
      onSuccess: () => {
        router.push('/dashboard/production/work-orders');
      },
    });
  };

  const handleComplete = () => {
    completeWorkOrder(
      { id: workOrderId, actualQuantity: workOrder.plannedQuantity || 0 },
      {
        onSuccess: () => {
          // Work order will be refetched automatically
        },
      }
    );
  };

  const handleCancel = () => {
    cancelWorkOrder(
      { id: workOrderId, reason: 'Cancelled from detail page' },
      {
        onSuccess: () => {
          // Work order will be refetched automatically
        },
      }
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => router.back()}
              className="rounded-full"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Work Order Details</h1>
              <p className="text-slate-600 mt-1">#{workOrder.woNumber}</p>
            </div>
          </div>

          {/* Action Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="rounded-full">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem
                onClick={() => router.push(`/dashboard/production/work-orders/${workOrder.id}/edit`)}
              >
                Edit Details
              </DropdownMenuItem>
              {workOrder.status === WorkOrderStatus.PLANNED && (
                <DropdownMenuItem onClick={handleComplete} disabled={isCompleting}>
                  {isCompleting ? 'Completing...' : 'Mark as Completed'}
                </DropdownMenuItem>
              )}
              {workOrder.status !== WorkOrderStatus.CANCELLED && (
                <DropdownMenuItem onClick={handleCancel} disabled={isCanceling}>
                  {isCanceling ? 'Canceling...' : 'Cancel'}
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                onClick={() => {}}
                className="text-red-600 focus:text-red-600 focus:bg-red-50"
              >
                <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                  <AlertDialogTrigger asChild>
                    <button className="w-full text-left">Delete</button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Work Order</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete this work order? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        {isDeleting ? 'Deleting...' : 'Delete'}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Status Badge */}
        <div className="mb-6">
          <Badge className={`${getStatusColor(workOrder.status)} px-4 py-2 text-sm font-semibold`}>
            {workOrder.status.replace('_', ' ')}
          </Badge>
        </div>

        {/* Main Info Card */}
        <Card className="bg-white shadow-xl mb-6 border-0">
          <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-b-0">
            <CardTitle className="text-xl">Work Order Information</CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Recipe Info */}
              <div>
                <label className="text-sm font-medium text-slate-500 uppercase tracking-wide">Recipe</label>
                <p className="text-lg text-slate-900 mt-1 font-semibold">
                  {workOrder.recipe?.name || '-'}
                </p>
                {workOrder.recipe?.description && (
                  <p className="text-sm text-slate-600 mt-2">{workOrder.recipe.description}</p>
                )}
              </div>

              {/* Quantity */}
              <div>
                <label className="text-sm font-medium text-slate-500 uppercase tracking-wide">
                  Planned Quantity
                </label>
                <p className="text-lg text-slate-900 mt-1 font-semibold">{workOrder.plannedQuantity} units</p>
              </div>

              {/* Actual Quantity */}
              {workOrder.actualQuantity !== undefined && (
                <div>
                  <label className="text-sm font-medium text-slate-500 uppercase tracking-wide">
                    Actual Quantity
                  </label>
                  <p className="text-lg text-slate-900 mt-1 font-semibold">
                    {workOrder.actualQuantity || '-'} units
                  </p>
                </div>
              )}

              {/* Scheduled Date */}
              <div>
                <label className="text-sm font-medium text-slate-500 uppercase tracking-wide">
                  Scheduled Date
                </label>
                <p className="text-lg text-slate-900 mt-1">
                  {workOrder.scheduledDate ? formatDate(workOrder.scheduledDate) : '-'}
                </p>
              </div>

              {/* Start Date */}
              {workOrder.startDate && (
                <div>
                  <label className="text-sm font-medium text-slate-500 uppercase tracking-wide">
                    Start Date
                  </label>
                  <p className="text-lg text-slate-900 mt-1">{formatDate(workOrder.startDate)}</p>
                </div>
              )}

              {/* Completion Date */}
              {workOrder.completionDate && (
                <div>
                  <label className="text-sm font-medium text-slate-500 uppercase tracking-wide">
                    Completion Date
                  </label>
                  <p className="text-lg text-slate-900 mt-1">{formatDate(workOrder.completionDate)}</p>
                </div>
              )}

              {/* Kitchen Location */}
              {workOrder.kitchenLocation && (
                <div>
                  <label className="text-sm font-medium text-slate-500 uppercase tracking-wide">
                    Kitchen Location
                  </label>
                  <p className="text-lg text-slate-900 mt-1">{workOrder.kitchenLocation.name}</p>
                </div>
              )}
            </div>

            {/* Notes */}
            {workOrder.notes && (
              <div className="mt-6 pt-6 border-t border-slate-200">
                <label className="text-sm font-medium text-slate-500 uppercase tracking-wide">Notes</label>
                <p className="text-slate-700 mt-2 whitespace-pre-wrap">{workOrder.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Timestamps */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="bg-white shadow-lg border-0">
            <CardContent className="p-6">
              <label className="text-sm font-medium text-slate-500 uppercase tracking-wide">Created</label>
              <p className="text-lg text-slate-900 mt-2">
                {formatDate(workOrder.createdAt)}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg border-0">
            <CardContent className="p-6">
              <label className="text-sm font-medium text-slate-500 uppercase tracking-wide">Last Updated</label>
              <p className="text-lg text-slate-900 mt-2">
                {formatDate(workOrder.updatedAt)}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Scaled Recipe Items / Ingredients */}
        {((workOrder as any).recipeItems || (workOrder as any).ingredients) && 
         (((workOrder as any).recipeItems?.length || 0) + ((workOrder as any).ingredients?.length || 0)) > 0 && (
          <Card className="bg-white shadow-xl mt-8 border-0">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b">
              <CardTitle className="text-xl font-semibold text-slate-800">
                Scaled Ingredients ({((workOrder as any).recipeItems?.length || (workOrder as any).ingredients?.length || 0)})
              </CardTitle>
              <p className="text-sm text-slate-600 mt-2">
                Ingredients scaled based on planned quantity: {workOrder.plannedQuantity} units
              </p>
            </CardHeader>
            <CardContent className="p-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-slate-200">
                      <th className="text-left py-3 px-4 font-semibold text-slate-700">Item Name</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-700">SKU</th>
                      <th className="text-right py-3 px-4 font-semibold text-slate-700">Quantity</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-700">Unit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {((workOrder as any).recipeItems || (workOrder as any).ingredients)?.map((ingredient: any) => (
                      <tr key={ingredient.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-4 font-medium text-slate-900">{ingredient.item?.name || 'Unknown'}</td>
                        <td className="py-3 px-4 text-slate-700">{ingredient.item?.sku || '-'}</td>
                        <td className="text-right py-3 px-4 text-slate-900 font-semibold">{ingredient.quantity.toFixed(2)}</td>
                        <td className="py-3 px-4 text-slate-700">{ingredient.item?.unit || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}


        {/* Footer Actions */}
        <div className="flex gap-3 mt-8 justify-end">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="gap-2"
          >
            Go Back
          </Button>
          <Button
            onClick={() => router.push(`/dashboard/production/work-orders/${workOrder.id}/edit`)}
            className="gap-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
          >
            Edit Work Order
          </Button>
        </div>
      </div>
    </div>
  );
}