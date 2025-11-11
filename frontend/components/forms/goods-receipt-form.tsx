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
import { useCreateGoodsReceipt } from '@/lib/hooks/use-procurement';
import { useLocations } from '@/lib/hooks/use-master-data';
import { usePurchaseOrders } from '@/lib/hooks/use-procurement';
import { useItems } from '@/lib/hooks/use-items';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import type { CreateGoodsReceiptDto } from '@/lib/api/procurement.service';

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

interface GoodsReceiptFormProps {
  goodsReceipt?: any;
  onSubmit?: (data: CreateGoodsReceiptDto) => void;
  loading?: boolean;
}

const GoodsReceiptForm: React.FC<GoodsReceiptFormProps> = ({
  goodsReceipt,
  onSubmit: externalOnSubmit,
  loading: externalLoading,
}) => {
  const router = useRouter();
  const { toast } = useToast();
  const createMutation = useCreateGoodsReceipt();

  // Fetch master data
  const { data: locationsData, isLoading: locationsLoading } = useLocations({ limit: 100 });
  const { data: purchaseOrdersData, isLoading: purchaseOrdersLoading } = usePurchaseOrders({ 
    limit: 100,
    status: 'APPROVED' // Only show approved POs
  });
  const { data: itemsData, isLoading: itemsLoading } = useItems({ limit: 200 });

  const form = useForm<GoodsReceiptFormData>({
    resolver: zodResolver(goodsReceiptSchema),
    defaultValues: goodsReceipt || {
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
    if (externalOnSubmit) {
      externalOnSubmit(data as CreateGoodsReceiptDto);
    } else {
      createMutation.mutate(data as CreateGoodsReceiptDto);
    }
  };

  const isLoading = locationsLoading || purchaseOrdersLoading || itemsLoading;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
        {/* Header Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Purchase Order (Optional) */}
          <FormField
            control={form.control}
            name="purchaseOrderId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Purchase Order</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={purchaseOrdersLoading}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select PO (optional)" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
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
                  defaultValue={field.value}
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
        </div>

        {/* Items Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-800">Received Items</h3>
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
            <div className="overflow-x-auto border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50">
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
                                defaultValue={field.value}
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
        </div>

        {/* Form Actions */}
        <div className="flex gap-4 justify-end pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={externalLoading ?? createMutation.isPending}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={externalLoading ?? createMutation.isPending}>
            {(externalLoading ?? createMutation.isPending) && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            {goodsReceipt?.id ? 'Update' : 'Create'} Goods Receipt
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default GoodsReceiptForm;