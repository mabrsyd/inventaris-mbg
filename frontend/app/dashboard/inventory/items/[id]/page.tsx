"use client"

import { useParams, useRouter } from 'next/navigation';
import { useItem } from '@/lib/hooks/use-items';
import LoadingSpinner from '@/components/ui/loading-spinner';
import ErrorMessage from '@/components/ui/error-message';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Pencil, Package, MapPin } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { Item, Stock } from '@/lib/types';

const ItemDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  
  const { data: item, isLoading, error } = useItem(id);

  if (isLoading) return <LoadingSpinner size="lg" className="my-8" />;
  if (error) return <ErrorMessage message="Failed to fetch item details" />;
  if (!item) return <ErrorMessage message="No item found" />;

  const totalStock = (item as any).stock?.reduce((sum: number, s: Stock) => sum + (s.quantity || 0), 0) || 0;
  const totalReserved = (item as any).stock?.reduce((sum: number, s: Stock) => sum + (s.reservedQuantity || 0), 0) || 0;
  const available = totalStock - totalReserved;
  const stockRecords = (item as any).stock as Stock[] | undefined;

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">{item.name}</h1>
          <p className="text-muted-foreground mt-1">Detail informasi item</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => router.push(`/dashboard/inventory/items`)}>
            Kembali
          </Button>
          <Button onClick={() => router.push(`/dashboard/inventory/items/${id}`)}>
            <Pencil className="mr-2 h-4 w-4" />
            Edit
          </Button>
        </div>
      </div>

      {/* Item Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Item Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-500">SKU</p>
              <p className="font-medium font-mono">{item.sku}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Code</p>
              <p className="font-medium font-mono">{item.code || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Type</p>
              <Badge>{item.itemType}</Badge>
            </div>
            <div>
              <p className="text-sm text-gray-500">Category</p>
              <p className="font-medium">{item.category?.name || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Unit</p>
              <Badge variant="outline">{item.unit}</Badge>
            </div>
            <div>
              <p className="text-sm text-gray-500">Price</p>
              <p className="font-medium text-green-600">${item.price?.toFixed(2) || '0.00'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Reorder Point</p>
              <p className="font-medium">{item.reorderPoint || 0}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Shelf Life (Days)</p>
              <p className="font-medium">{item.shelfLifeDays || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Cold Storage</p>
              <Badge variant={item.requiresColdStorage ? "default" : "secondary"}>
                {item.requiresColdStorage ? 'Yes' : 'No'}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-gray-500">Consumable</p>
              <Badge variant={item.isConsumable ? "default" : "secondary"}>
                {item.isConsumable ? 'Yes' : 'No'}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-gray-500">Status</p>
              <Badge variant={item.isActive ? "default" : "destructive"}>
                {item.isActive ? 'Active' : 'Inactive'}
              </Badge>
            </div>
          </div>
          
          {item.description && (
            <div className="pt-4 border-t">
              <p className="text-sm text-gray-500">Description</p>
              <p className="font-medium mt-1">{item.description}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stock Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Stock Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 mb-6">
            <Card className="p-4 border-l-4 border-blue-500">
              <p className="text-sm text-gray-500">Total Stock</p>
              <p className="text-2xl font-bold text-blue-600">{totalStock}</p>
            </Card>
            <Card className="p-4 border-l-4 border-yellow-500">
              <p className="text-sm text-gray-500">Reserved</p>
              <p className="text-2xl font-bold text-yellow-600">{totalReserved}</p>
            </Card>
            <Card className="p-4 border-l-4 border-green-500">
              <p className="text-sm text-gray-500">Available</p>
              <p className="text-2xl font-bold text-green-600">{available}</p>
            </Card>
          </div>

          {/* Stock by Location */}
          {stockRecords && stockRecords.length > 0 ? (
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Stock by Location
              </h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Location</TableHead>
                    <TableHead>Batch Number</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Reserved</TableHead>
                    <TableHead>Available</TableHead>
                    <TableHead>Expiry Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stockRecords.map((stock: Stock) => (
                    <TableRow key={stock.id}>
                      <TableCell className="font-medium">{stock.location?.name || 'N/A'}</TableCell>
                      <TableCell className="font-mono text-xs">{stock.batchNumber || '-'}</TableCell>
                      <TableCell className="font-semibold">{stock.quantity || 0}</TableCell>
                      <TableCell className="text-yellow-600">{stock.reservedQuantity || 0}</TableCell>
                      <TableCell className="font-semibold text-green-600">
                        {(stock.quantity || 0) - (stock.reservedQuantity || 0)}
                      </TableCell>
                      <TableCell>
                        {stock.expiryDate ? new Date(stock.expiryDate).toLocaleDateString('id-ID') : '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Package className="mx-auto h-12 w-12 opacity-20 mb-2" />
              <p>No stock records found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ItemDetailPage;