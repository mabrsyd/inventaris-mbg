"use client"

import React, { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Loader2, Plus, Trash2, Save } from 'lucide-react';
import { usePurchaseOrder, useUpdatePurchaseOrder } from '@/lib/hooks/use-procurement';
import { useSuppliers, useLocations } from '@/lib/hooks/use-master-data';
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
import { Textarea } from '@/components/ui/textarea';

// Schema for PO item
const poItemSchema = z.object({
  itemId: z.string().min(1, 'Item is required'),
  quantity: z.number().min(1, 'Quantity must be at least 1'),
  unitPrice: z.number().min(0, 'Unit price must be at least 0'),
});

// Schema for the entire PO form
const purchaseOrderSchema = z.object({
  supplierId: z.string().min(1, 'Supplier is required'),
  destinationLocationId: z.string().min(1, 'Destination location is required'),
  expectedDeliveryDate: z.string().min(1, 'Expected delivery date is required'),
  notes: z.string().optional(),
  items: z.array(poItemSchema).min(1, 'At least one item is required'),
});

type PurchaseOrderFormData = z.infer<typeof purchaseOrderSchema>;

export default function EditPurchaseOrderPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const { data: purchaseOrderData, isLoading: isLoadingPO } = usePurchaseOrder(id);
  const updateMutation = useUpdatePurchaseOrder();

  // Fetch master data
  const { data: suppliersData, isLoading: suppliersLoading } = useSuppliers({ limit: 100 });
  const { data: locationsData, isLoading: locationsLoading } = useLocations({ limit: 100 });
  const { data: itemsData, isLoading: itemsLoading } = useItems({ limit: 200 });

  const form = useForm<PurchaseOrderFormData>({
    resolver: zodResolver(purchaseOrderSchema),
    defaultValues: {
      supplierId: '',
      destinationLocationId: '',
      expectedDeliveryDate: '',
      notes: '',
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
    if (purchaseOrderData?.data) {
      const po = purchaseOrderData.data;
      form.reset({
        supplierId: po.supplierId || '',
        destinationLocationId: po.destinationLocationId || '',
        expectedDeliveryDate: po.expectedDeliveryDate 
          ? new Date(po.expectedDeliveryDate).toISOString().split('T')[0] 
          : '',
        notes: po.notes || '',
        items: po.items?.map((item: any) => ({
          itemId: item.itemId,
          quantity: item.quantity,
          unitPrice: item.unitPrice || 0,
        })) || [],
      });
    }
  }, [purchaseOrderData, form]);

  // Calculate totals
  const calculateItemTotal = (quantity: number, unitPrice: number) => {
    return quantity * unitPrice;
  };

  const calculateGrandTotal = () => {
    const items = form.watch('items');
    return items.reduce((total, item) => {
      return total + calculateItemTotal(item.quantity || 0, item.unitPrice || 0);
    }, 0);
  };

  // Add new item row
  const handleAddItem = () => {
    append({
      itemId: '',
      quantity: 1,
      unitPrice: 0,
    });
  };

  // Get item price by ID
  const getItemPrice = (itemId: string) => {
    const item = itemsData?.data?.find((i: any) => i.id === itemId);
    return item?.price || 0;
  };

  // Handle form submission
  const handleFormSubmit = (data: PurchaseOrderFormData) => {
    updateMutation.mutate({
      id,
      dto: data as any,
    });
  };

  if (isLoadingPO) {
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

  if (!purchaseOrderData?.data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50 p-6">
        <div className="max-w-5xl mx-auto">
          <Card>
            <CardContent className="p-6">
              <div className="text-center py-8">
                <p className="text-slate-500 mb-4">Purchase Order not found</p>
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

  // Only allow editing if status is DRAFT
  if (purchaseOrderData.data.status !== 'DRAFT') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50 p-6">
        <div className="max-w-5xl mx-auto">
          <Card className="border-yellow-200 bg-yellow-50">
            <CardContent className="p-6">
              <div className="text-center py-8">
                <h2 className="text-xl font-semibold text-yellow-800 mb-2">Cannot Edit</h2>
                <p className="text-yellow-700 mb-4">
                  Purchase Order can only be edited when in DRAFT status. Current status: {purchaseOrderData.data.status}
                </p>
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

  const isLoading = suppliersLoading || locationsLoading || itemsLoading;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-900 to-purple-700 bg-clip-text text-transparent">
              Edit Purchase Order
            </h1>
            <p className="text-slate-600 mt-1">
              Update purchase order {purchaseOrderData.data.poNumber}
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
                  Purchase Order Information
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Supplier */}
                <FormField
                  control={form.control}
                  name="supplierId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Supplier *</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled={suppliersLoading || isLoading}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue
                              placeholder={suppliersLoading ? 'Loading suppliers...' : 'Select supplier'}
                            />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {suppliersData?.data?.map((supplier: any) => (
                            <SelectItem key={supplier.id} value={supplier.id}>
                              {supplier.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Destination Location */}
                <FormField
                  control={form.control}
                  name="destinationLocationId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Destination Location *</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled={locationsLoading || isLoading}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue
                              placeholder={locationsLoading ? 'Loading locations...' : 'Select location'}
                            />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {locationsData?.data?.map((location: any) => (
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

                {/* Expected Delivery Date */}
                <FormField
                  control={form.control}
                  name="expectedDeliveryDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Expected Delivery Date *</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormDescription>When you expect to receive the goods</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Notes */}
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Additional notes (optional)" 
                          className="resize-none"
                          rows={3}
                          {...field} 
                        />
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
                  Order Items
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
                  <>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-[300px]">Item</TableHead>
                            <TableHead className="w-[120px]">Quantity</TableHead>
                            <TableHead className="w-[150px]">Unit Price</TableHead>
                            <TableHead className="w-[150px]">Total</TableHead>
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
                                        onValueChange={(value) => {
                                          field.onChange(value);
                                          // Auto-fill price when item selected
                                          const price = getItemPrice(value);
                                          form.setValue(`items.${index}.unitPrice`, price);
                                        }}
                                        value={field.value}
                                        disabled={itemsLoading}
                                      >
                                        <FormControl>
                                          <SelectTrigger>
                                            <SelectValue
                                              placeholder={itemsLoading ? 'Loading...' : 'Select item'}
                                            />
                                          </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                          {itemsData?.data?.map((item: any) => (
                                            <SelectItem key={item.id} value={item.id}>
                                              {item.name} - {item.sku} (Rp {(item.price || 0).toLocaleString('id-ID')})
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
                                          min="1"
                                          {...field}
                                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </TableCell>

                              {/* Unit Price */}
                              <TableCell>
                                <FormField
                                  control={form.control}
                                  name={`items.${index}.unitPrice`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormControl>
                                        <Input
                                          type="number"
                                          step="0.01"
                                          min="0"
                                          {...field}
                                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </TableCell>

                              {/* Total */}
                              <TableCell>
                                <div className="font-semibold text-slate-900">
                                  Rp{' '}
                                  {calculateItemTotal(
                                    form.watch(`items.${index}.quantity`) || 0,
                                    form.watch(`items.${index}.unitPrice`) || 0
                                  ).toLocaleString('id-ID')}
                                </div>
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

                    {/* Grand Total */}
                    <div className="mt-6 flex justify-end">
                      <div className="w-80 space-y-2 bg-gradient-to-r from-indigo-50 to-purple-50 p-4 rounded-lg">
                        <div className="flex justify-between text-lg font-semibold text-slate-800">
                          <span>Grand Total:</span>
                          <span className="text-indigo-700">
                            Rp {calculateGrandTotal().toLocaleString('id-ID')}
                          </span>
                        </div>
                      </div>
                    </div>
                  </>
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
                Update Purchase Order
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
