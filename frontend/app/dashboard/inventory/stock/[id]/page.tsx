"use client"

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getStockById } from '@/lib/api/inventory';
import { Stock } from '@/lib/types/inventory';
import LoadingSpinner from '@/components/ui/loading-spinner';
import ErrorMessage from '@/components/ui/error-message';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/utils/date';

const StockDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const [stock, setStock] = useState<Stock | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      const fetchStock = async () => {
        try {
          const data = await getStockById(id);
          setStock(data);
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Failed to fetch stock details');
        } finally {
          setLoading(false);
        }
      };

      fetchStock();
    }
  }, [id]);

  if (loading) return <LoadingSpinner size="lg" className="my-8" />;
  if (error) return <ErrorMessage message={error} />;
  if (!stock) return <ErrorMessage message="No stock found" />;

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Stock Details</h1>
        <Button variant="outline" onClick={() => router.back()}>
          Back
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Stock Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Item</p>
              <p className="font-medium">{stock.item?.name || stock.itemId}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Location</p>
              <p className="font-medium">{stock.location?.name || stock.locationId}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Quantity</p>
              <p className="font-medium">{stock.quantity}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Reserved Quantity</p>
              <p className="font-medium">{stock.reservedQuantity || 0}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Available Quantity</p>
              <p className="font-medium">{stock.quantity - (stock.reservedQuantity || 0)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Batch Number</p>
              <p className="font-medium">{stock.batchNumber || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Expiry Date</p>
              <p className="font-medium">
                {stock.expiryDate ? formatDate(stock.expiryDate) : 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Storage Location</p>
              <p className="font-medium">{stock.storageLocation || '-'}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StockDetailPage;