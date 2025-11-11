"use client"

import React, { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Loader2, Plus, Trash2, Save } from 'lucide-react';
import { useGoodsReceipt, useUpdateGoodsReceipt } from '@/lib/hooks/use-procurement';
import { useLocations } from '@/lib/hooks/use-master-data';
import { usePurchaseOrders } from '@/lib/hooks/use-procurement';
import { useItems } from '@/lib/hooks/use-items';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

// Schema for GR item
const grItemSchema = z.object({
  itemId: z.string().min(1, 'Item is required'),
  quantity: z.number().min(0.01, 'Quantity must be greater than 0'),
  batchNumber: z.string().optional(),
  expiryDate: z.string().optional(),
});

// Schema for the entire Goods Receipt form
const goodsReceiptSchema = z.object({
  purchaseOrderId: z.string().optional(),
  locationId: z.string().min(1, 'Location is required'),
  referenceDocument: z.string().optional(),
  items: z.array(grItemSchema).min(1, 'At least one item is required'),
});

type GoodsReceiptFormData = z.infer<typeof goodsReceiptSchema>;

export default function EditGoodsReceiptPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const { data: goodsReceiptData, isLoading: isLoadingReceipt } = useGoodsReceipt(id);
  const updateMutation = useUpdateGoodsReceipt();

  // Fetch master data
  const { data: locationsData, isLoading: locationsLoading } = useLocations({ limit: 100 });
  const { data: purchaseOrdersData, isLoading: purchaseOrdersLoading } = usePurchaseOrders({ 
    limit: 100,
    status: 'APPROVED'
  });
  const { data: itemsData, isLoading: itemsLoading } = useItems({ limit: 200 });

  const form = useForm<GoodsReceiptFormData>({
    resolver: zodResolver(goodsReceiptSchema),
    defaultValues: {
      purchaseOrderId: '',
      locationId: '',
      referenceDocument: '',
      items: [],
    },
  });

  // Use field array for items management
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'items',
  });

  // Populate form with existing data
  useEffect(() => {
    if (goodsReceiptData?.data) {
      const receipt = goodsReceiptData.data;
      form.reset({
        purchaseOrderId: receipt.purchaseOrderId || '',
        locationId: receipt.locationId || '',
        referenceDocument: receipt.referenceDocument || '',
        items: receipt.items?.map((item: any) => ({
          itemId: item.itemId,
          quantity: item.quantity,
          batchNumber: item.batchNumber || '',
          expiryDate: item.expiryDate ? new Date(item.expiryDate).toISOString().split('T')[0] : '',
        })) || [],
      });
    }
  }, [goodsReceiptData, form]);

  // Add new item row
  const handleAddItem = () => {
    append({
      itemId: '',
      quantity: 1,
      batchNumber: '',
      expiryDate: '',
    });
  };

  // Handle form submission
  const handleFormSubmit = (data: GoodsReceiptFormData) => {
    updateMutation.mutate({
      id,
      dto: data as any,
    });
  };

  if (isLoadingReceipt) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50 p-6">
        <div className="max-w-5xl mx-auto space-y-6">
          <Skeleton className="h-12 w-64" />
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!goodsReceiptData?.data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50 p-6">
        <div className="max-w-5xl mx-auto">
          <Card>
            <CardContent className="p-6">
              <div className="text-center py-8">
                <p className="text-slate-500 mb-4">Goods Receipt not found</p>
                <Button variant="outline" onClick={() => router.back()}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Go Back
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const isLoading = locationsLoading || purchaseOrdersLoading || itemsLoading;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-900 to-purple-700 bg-clip-text text-transparent">
              Edit Goods Receipt
            </h1>
            <p className="text-slate-600 mt-1">
              Update goods receipt #{goodsReceiptData.data.receiptNumber}
            </p>
          </div>
          <Button 
            variant="outline" 
            onClick={() => router.back()}
            disabled={updateMutation.isPending}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Cancel
          </Button>
        </div>

        {/* Form */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
            {/* Header Information */}
            <Card className="bg-white shadow-lg">
              <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b">
                <CardTitle className="text-xl font-semibold text-slate-800">
                  Goods Receipt Information
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Purchase Order (Optional) */}
                <FormField
                  control={form.control}
                  name="purchaseOrderId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Purchase Order</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled={purchaseOrdersLoading}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select PO (optional)" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="">None</SelectItem>
                          {purchaseOrdersData?.data?.map((po) => (
                            <SelectItem key={po.id} value={po.id}>
                              {po.poNumber} - {po.supplier?.name || 'Unknown Supplier'}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>Link to a purchase order (optional)</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Location */}
                <FormField
                  control={form.control}
                  name="locationId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Receiving Location *</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled={locationsLoading}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={locationsLoading ? 'Loading...' : 'Select location'} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {locationsData?.data?.map((location) => (
                            <SelectItem key={location.id} value={location.id}>
                              {location.name} ({location.type})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Reference Document */}
                <FormField
                  control={form.control}
                  name="referenceDocument"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Reference Document</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Delivery Note #123 (optional)" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Items Section */}
            <Card className="bg-white shadow-lg">
              <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b flex flex-row items-center justify-between">
                <CardTitle className="text-xl font-semibold text-slate-800">
                  Received Items
                </CardTitle>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddItem}
                  disabled={itemsLoading || isLoading}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Item
                </Button>
              </CardHeader>
              <CardContent className="p-6">
                {fields.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No items added yet. Click "Add Item" to start.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[300px]">Item</TableHead>
                          <TableHead className="w-[120px]">Quantity</TableHead>
                          <TableHead className="w-[180px]">Batch Number</TableHead>
                          <TableHead className="w-[150px]">Expiry Date</TableHead>
                          <TableHead className="w-[80px]">Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {fields.map((field, index) => (
                          <TableRow key={field.id}>
                            {/* Item Select */}
                            <TableCell>
                              <FormField
                                control={form.control}
                                name={`items.${index}.itemId`}
                                render={({ field }) => (
                                  <FormItem>
                                    <Select
                                      onValueChange={field.onChange}
                                      value={field.value}
                                      disabled={itemsLoading}
                                    >
                                      <FormControl>
                                        <SelectTrigger>
                                          <SelectValue placeholder={itemsLoading ? 'Loading...' : 'Select item'} />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent>
                                        {itemsData?.data?.map((item) => (
                                          <SelectItem key={item.id} value={item.id}>
                                            {item.name} - {item.sku}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </TableCell>

                            {/* Quantity */}
                            <TableCell>
                              <FormField
                                control={form.control}
                                name={`items.${index}.quantity`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormControl>
                                      <Input
                                        type="number"
                                        step="0.01"
                                        min="0.01"
                                        {...field}
                                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </TableCell>

                            {/* Batch Number */}
                            <TableCell>
                              <FormField
                                control={form.control}
                                name={`items.${index}.batchNumber`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormControl>
                                      <Input placeholder="Batch# (optional)" {...field} />
                                    </FormControl>
                                  </FormItem>
                                )}
                              />
                            </TableCell>

                            {/* Expiry Date */}
                            <TableCell>
                              <FormField
                                control={form.control}
                                name={`items.${index}.expiryDate`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormControl>
                                      <Input type="date" {...field} />
                                    </FormControl>
                                  </FormItem>
                                )}
                              />
                            </TableCell>

                            {/* Remove Button */}
                            <TableCell>
                              <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                onClick={() => remove(index)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Form Actions */}
            <div className="flex gap-4 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={updateMutation.isPending}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={updateMutation.isPending}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
              >
                {updateMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                <Save className="mr-2 h-4 w-4" />
                Update Goods Receipt
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
