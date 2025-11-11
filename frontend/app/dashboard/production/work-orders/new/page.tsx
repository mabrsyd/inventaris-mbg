'use client';

import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';
import WorkOrderForm from '@/components/forms/work-order-form';
import { useCreateWorkOrder } from '@/lib/hooks/use-production';

export default function NewWorkOrderPage() {
  const router = useRouter();
  const { mutate: createWorkOrder, isPending: isCreating } = useCreateWorkOrder();

  const handleSubmit = (data: any) => {
    createWorkOrder(data, {
      onSuccess: (response) => {
        const newWorkOrder = response.data;
        router.push(`/dashboard/production/work-orders/${newWorkOrder.id}`);
      },
    });
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
            <h1 className="text-3xl font-bold text-slate-900">Create New Work Order</h1>
            <p className="text-slate-600 mt-1">Fill in the details to create a new work order</p>
          </div>
        </div>

        {/* Form Card */}
        <Card className="bg-white shadow-xl border-0">
          <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-b-0">
            <CardTitle className="text-xl">Work Order Information</CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <WorkOrderForm
              onSubmit={handleSubmit}
              loading={isCreating}
            />
          </CardContent>
        </Card>

        {/* Footer Actions */}
        <div className="flex gap-3 mt-6 justify-end">
          <Button
            variant="outline"
            onClick={() => router.back()}
            disabled={isCreating}
            className="gap-2"
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}