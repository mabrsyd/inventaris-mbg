"use client"

import { useRouter } from 'next/navigation';
import DeliveryOrderForm from '@/components/forms/delivery-order-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const NewDeliveryOrderPage = () => {
  const router = useRouter();

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Buat Delivery Order</h1>
        <p className="text-muted-foreground mt-1">
          Buat delivery order baru untuk distribusi
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Detail Delivery Order</CardTitle>
        </CardHeader>
        <CardContent>
          <DeliveryOrderForm />
        </CardContent>
      </Card>
    </div>
  );
};

export default NewDeliveryOrderPage;