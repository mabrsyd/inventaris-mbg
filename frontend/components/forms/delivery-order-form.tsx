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
import { useCreateDeliveryOrder } from '@/lib/hooks/use-distribution';
import { useLocations } from '@/lib/hooks/use-master-data';
import { useBeneficiaries } from '@/lib/hooks/use-distribution';
import { useItems } from '@/lib/hooks/use-items';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import type { CreateDeliveryOrderDto } from '@/lib/api/distribution.service';

// Schema for DO item
const doItemSchema = z.object({
  itemId: z.string().min(1, 'Item is required'),
  quantity: z.number().min(0.01, 'Quantity must be greater than 0'),
  batchNumber: z.string().optional(),
});

// Schema for the entire Delivery Order form
const deliveryOrderSchema = z.object({
  sourceLocationId: z.string().min(1, 'Source location is required'),
  destinationLocationId: z.string().min(1, 'Destination location is required'),
  beneficiaryId: z.string().optional(),
  workOrderId: z.string().optional(),
  scheduledDeliveryDate: z.string().optional(),
  transportInfo: z.any().optional(),
  referenceDocument: z.string().optional(),
  notes: z.string().optional(),
  items: z.array(doItemSchema).min(1, 'At least one item is required'),
});

type DeliveryOrderFormData = z.infer<typeof deliveryOrderSchema>;

interface DeliveryOrderFormProps {
  deliveryOrder?: any;
  onSubmit?: (data: CreateDeliveryOrderDto) => void;
  loading?: boolean;
}

const DeliveryOrderForm: React.FC<DeliveryOrderFormProps> = ({
  deliveryOrder,
  onSubmit: externalOnSubmit,
  loading: externalLoading,
}) => {
  const router = useRouter();
  const { toast } = useToast();
  const createMutation = useCreateDeliveryOrder();

  // Fetch master data
  const { data: locationsData, isLoading: locationsLoading } = useLocations({ limit: 100 });
  const { data: beneficiariesData, isLoading: beneficiariesLoading } = useBeneficiaries({ limit: 100 });
  const { data: itemsData, isLoading: itemsLoading } = useItems({ limit: 200 });

  const form = useForm<DeliveryOrderFormData>({
    resolver: zodResolver(deliveryOrderSchema),
    defaultValues: deliveryOrder || {
      sourceLocationId: '',
      destinationLocationId: '',
      beneficiaryId: '',
      workOrderId: '',
      scheduledDeliveryDate: '',
      transportInfo: null,
      referenceDocument: '',
      notes: '',
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
    });
  };

  // Handle form submission
  const handleFormSubmit = (data: DeliveryOrderFormData) => {
    if (externalOnSubmit) {
      externalOnSubmit(data as CreateDeliveryOrderDto);
    } else {
      createMutation.mutate(data as CreateDeliveryOrderDto);
    }
  };

  const isLoading = locationsLoading || beneficiariesLoading || itemsLoading;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
        {/* Header Information */}
        <Card>
          <CardHeader>
            <CardTitle>Delivery Order Information</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Source Location */}
            <FormField
              control={form.control}
              name="sourceLocationId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Source Location *</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={locationsLoading}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={locationsLoading ? 'Loading...' : 'Select source'} />
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
                    disabled={locationsLoading}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={locationsLoading ? 'Loading...' : 'Select destination'} />
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

            {/* Beneficiary */}
            <FormField
              control={form.control}
              name="beneficiaryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Beneficiary</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={beneficiariesLoading}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select beneficiary (optional)" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {beneficiariesData?.data?.map((beneficiary) => (
                        <SelectItem key={beneficiary.id} value={beneficiary.id}>
                          {beneficiary.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Scheduled Delivery Date */}
            <FormField
              control={form.control}
              name="scheduledDeliveryDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Scheduled Delivery Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormDescription>When to deliver the goods (optional)</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Reference Document */}
            <FormField
              control={form.control}
              name="referenceDocument"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reference Document</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., WO-001 (optional)" {...field} />
                  </FormControl>
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
          </CardContent>
        </Card>

        {/* Items Section */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Delivery Items</CardTitle>
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
          <CardContent>
            {fields.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No items added yet. Click "Add Item" to start.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[350px]">Item</TableHead>
                      <TableHead className="w-[150px]">Quantity</TableHead>
                      <TableHead className="w-[200px]">Batch Number</TableHead>
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
        <div className="flex gap-4">
          <Button type="submit" disabled={externalLoading ?? createMutation.isPending}>
            {(externalLoading ?? createMutation.isPending) && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            {deliveryOrder?.id ? 'Update' : 'Create'} Delivery Order
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={externalLoading ?? createMutation.isPending}
          >
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default DeliveryOrderForm;