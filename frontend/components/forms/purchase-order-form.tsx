"use client"

import React from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/lib/hooks/use-toast';
import { useCreatePurchaseOrder, useUpdatePurchaseOrder } from '@/lib/hooks/use-procurement';
import { useSuppliers, useLocations } from '@/lib/hooks/use-master-data';
import { useItems } from '@/lib/hooks/use-items';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import type { CreatePurchaseOrderDto } from '@/lib/api/procurement.service';

// Schema for PO item
const poItemSchema = z.object({
  itemId: z.string().min(1, 'Item is required'),
  quantity: z.number().min(1, 'Quantity must be at least 1'),
  unitPrice: z.number().min(0, 'Unit price must be at least 0').optional(),
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

interface PurchaseOrderFormProps {
  purchaseOrder?: any;
  onSubmit?: (data: CreatePurchaseOrderDto) => void;
  loading?: boolean;
  isEdit?: boolean;
}

const PurchaseOrderForm: React.FC<PurchaseOrderFormProps> = ({
  purchaseOrder,
  onSubmit: externalOnSubmit,
  loading: externalLoading,
  isEdit = false,
}) => {
  const router = useRouter();
  const { toast } = useToast();
  const createMutation = useCreatePurchaseOrder();
  const updateMutation = useUpdatePurchaseOrder();

  // Fetch master data
  const { data: suppliersData, isLoading: suppliersLoading } = useSuppliers({ limit: 100 });
  const { data: locationsData, isLoading: locationsLoading } = useLocations({ limit: 100 });
  const { data: itemsData, isLoading: itemsLoading } = useItems({ limit: 200 });

  const form = useForm<PurchaseOrderFormData>({
    resolver: zodResolver(purchaseOrderSchema),
    defaultValues: purchaseOrder || {
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

  // Handle form submission
  const handleFormSubmit = (data: PurchaseOrderFormData) => {
    console.log('📤 Form Data:', JSON.stringify(data, null, 2));
    
    if (externalOnSubmit) {
      externalOnSubmit(data as CreatePurchaseOrderDto);
    } else if (isEdit && purchaseOrder?.id) {
      updateMutation.mutate({ id: purchaseOrder.id, dto: data as any });
    } else {
      createMutation.mutate(data as CreatePurchaseOrderDto);
    }
  };

  // Get item price by ID
  const getItemPrice = (itemId: string) => {
    const item = itemsData?.data?.find((i: any) => i.id === itemId);
    return item?.price || 0;
  };

  const isLoading = suppliersLoading || locationsLoading || itemsLoading;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
        {/* Header Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Supplier */}
          <FormField
            control={form.control}
            name="supplierId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Supplier *</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
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
                  defaultValue={field.value}
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
                  <Input placeholder="Additional notes (optional)" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Items Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-800">Order Items</h3>
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
          </div>

          {fields.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground border-2 border-dashed border-slate-300 rounded-lg">
              No items added yet. Click "Add Item" to start.
            </div>
          ) : (
            <>
              <div className="overflow-x-auto border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50">
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
                                  defaultValue={field.value}
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
              <div className="flex justify-end">
                <div className="w-80 bg-gradient-to-r from-indigo-50 to-purple-50 p-4 rounded-lg border border-indigo-200">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-slate-800">Grand Total:</span>
                    <span className="text-xl font-bold text-indigo-700">
                      Rp {calculateGrandTotal().toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Form Actions */}
        <div className="flex gap-4 justify-end pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={externalLoading || createMutation.isPending || updateMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={externalLoading || createMutation.isPending || updateMutation.isPending}
          >
            {(externalLoading || createMutation.isPending || updateMutation.isPending) && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            {purchaseOrder?.id ? 'Update' : 'Create'} Purchase Order
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default PurchaseOrderForm;