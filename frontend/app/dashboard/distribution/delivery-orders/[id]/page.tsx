"use client"

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getDeliveryOrderById } from '@/lib/api/distribution';
import { DeliveryOrder } from '@/lib/types/distribution';
import LoadingSpinner from '@/components/ui/loading-spinner';
import ErrorMessage from '@/components/ui/error-message';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils/date';

const DeliveryOrderDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const [deliveryOrder, setDeliveryOrder] = useState<DeliveryOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      const fetchDeliveryOrder = async () => {
        try {
          const response = await getDeliveryOrderById(id);
          setDeliveryOrder(response.data);
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Failed to fetch delivery order details');
        } finally {
          setLoading(false);
        }
      };

      fetchDeliveryOrder();
    }
  }, [id]);

  if (loading) return <LoadingSpinner size="lg" className="my-8" />;
  if (error) return <ErrorMessage message={error} />;
  if (!deliveryOrder) return <ErrorMessage message="No delivery order found" />;

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Delivery Order #{deliveryOrder.doNumber}</h1>
        <Button variant="outline" onClick={() => router.back()}>
          Back
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Order Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">DO Number</p>
              <p className="font-medium">{deliveryOrder.doNumber}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Status</p>
              <Badge>{deliveryOrder.status}</Badge>
            </div>
            <div>
              <p className="text-sm text-gray-500">Source Location</p>
              <p className="font-medium">{deliveryOrder.sourceLocation?.name || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Destination Location</p>
              <p className="font-medium">{deliveryOrder.destinationLocation?.name || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Scheduled Delivery Date</p>
              <p className="font-medium">
                {deliveryOrder.scheduledDeliveryDate 
                  ? formatDate(deliveryOrder.scheduledDeliveryDate) 
                  : '-'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Actual Delivery Date</p>
              <p className="font-medium">
                {deliveryOrder.actualDeliveryDate 
                  ? formatDate(deliveryOrder.actualDeliveryDate) 
                  : '-'}
              </p>
            </div>
            <div className="col-span-2">
              <p className="text-sm text-gray-500">Notes</p>
              <p className="font-medium">{deliveryOrder.notes || '-'}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DeliveryOrderDetailPage;