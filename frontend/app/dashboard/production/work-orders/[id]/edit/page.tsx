'use client';

import { useRouter, useParams } from 'next/navigation';
import { useWorkOrder, useUpdateWorkOrder } from '@/lib/hooks/use-production';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';
import WorkOrderForm from '@/components/forms/work-order-form';

export default function EditWorkOrderPage() {
  const router = useRouter();
  const params = useParams();
  const workOrderId = params.id as string;

  const { data: workOrderResponse, isLoading: isLoadingWorkOrder } = useWorkOrder(workOrderId);
  const { mutate: updateWorkOrder, isPending: isUpdating } = useUpdateWorkOrder();

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

  const handleSubmit = (data: any) => {
    updateWorkOrder(
      {
        id: workOrderId,
        dto: data,
      },
      {
        onSuccess: () => {
          router.push(`/dashboard/production/work-orders/${workOrderId}`);
        },
      }
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.back()}
            className="rounded-full"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Edit Work Order</h1>
            <p className="text-slate-600 mt-1">#{workOrder.id}</p>
          </div>
        </div>

        {/* Form Card */}
        <Card className="bg-white shadow-xl border-0">
          <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-b-0">
            <CardTitle className="text-xl">Work Order Information</CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <WorkOrderForm
              workOrder={workOrder}
              onSubmit={handleSubmit}
              loading={isUpdating}
            />
          </CardContent>
        </Card>

        {/* Footer Actions */}
        <div className="flex gap-3 mt-6 justify-end">
          <Button
            variant="outline"
            onClick={() => router.back()}
            disabled={isUpdating}
            className="gap-2"
          >
            Cancel
          </Button>
          <Button
            onClick={() => {
              const form = document.querySelector('form');
              if (form) form.dispatchEvent(new Event('submit', { bubbles: true }));
            }}
            disabled={isUpdating}
            className="gap-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
          >
            {isUpdating && <Loader2 className="h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
}
