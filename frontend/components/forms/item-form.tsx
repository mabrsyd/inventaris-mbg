"use client"

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
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
import { useToast } from '@/lib/hooks/use-toast';
import { useCategories } from '@/lib/hooks/use-master-data';
import { useCreateItem, useUpdateItem } from '@/lib/hooks/use-items';
import { ItemType, ItemUnit } from '@/lib/types';
import { Loader2 } from 'lucide-react';

const itemSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  sku: z.string().min(1, 'SKU is required'),
  code: z.string().optional(),
  description: z.string().optional(),
  itemType: z.nativeEnum(ItemType),
  unit: z.nativeEnum(ItemUnit),
  categoryId: z.string().optional(),
  price: z.number().min(0, 'Price must be at least 0'),
  reorderPoint: z.number().min(0, 'Reorder point must be at least 0'),
  shelfLifeDays: z.number().min(0, 'Shelf life must be at least 0').optional().nullable(),
  requiresColdStorage: z.boolean(),
  isConsumable: z.boolean(),
  nutritionalInfo: z.any().optional(),
  isActive: z.boolean().optional(),
});

type ItemFormData = z.infer<typeof itemSchema>;

interface ItemFormProps {
  item?: ItemFormData & { id: string };
  onSubmit?: (data: ItemFormData) => Promise<void>;
  loading?: boolean;
}

const ItemForm: React.FC<ItemFormProps> = ({ item, onSubmit: externalOnSubmit, loading: externalLoading }) => {
  const router = useRouter();
  const { toast } = useToast();
  
  // Fetch categories for dropdown
  const { data: categoriesData, isLoading: categoriesLoading } = useCategories({ limit: 100 });

  const form = useForm<ItemFormData>({
    resolver: zodResolver(itemSchema),
    defaultValues: item || {
      name: '',
      sku: '',
      code: '',
      description: '',
      itemType: ItemType.RAW_MATERIAL,
      unit: ItemUnit.KG,
      categoryId: '',
      price: 0,
      reorderPoint: 0,
      shelfLifeDays: null,
      requiresColdStorage: false,
      isConsumable: false,
      nutritionalInfo: null,
      isActive: true,
    },
  });

  const createMutation = useCreateItem();
  const updateMutation = useUpdateItem(item?.id || '');
  
  const mutation = item?.id ? updateMutation : createMutation;

  const handleFormSubmit = (data: ItemFormData) => {
    if (externalOnSubmit) {
      externalOnSubmit(data);
    } else {
      // Remove null values before sending
      const cleanData: Partial<ItemFormData> = {
        ...data,
        shelfLifeDays: data.shelfLifeDays ?? undefined,
      };
      mutation.mutate(cleanData as any);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Name */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name *</FormLabel>
                <FormControl>
                  <Input placeholder="Enter item name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* SKU */}
          <FormField
            control={form.control}
            name="sku"
            render={({ field }) => (
              <FormItem>
                <FormLabel>SKU *</FormLabel>
                <FormControl>
                  <Input placeholder="Enter SKU" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Code */}
          <FormField
            control={form.control}
            name="code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Code</FormLabel>
                <FormControl>
                  <Input placeholder="Enter code (optional)" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Item Type */}
          <FormField
            control={form.control}
            name="itemType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Item Type *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select item type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value={ItemType.RAW_MATERIAL}>Raw Material</SelectItem>
                    <SelectItem value={ItemType.SEMI_FINISHED}>Semi-Finished</SelectItem>
                    <SelectItem value={ItemType.FINISHED_GOOD}>Finished Good</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Unit */}
          <FormField
            control={form.control}
            name="unit"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Unit *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select unit" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value={ItemUnit.KG}>Kilogram (KG)</SelectItem>
                    <SelectItem value={ItemUnit.GR}>Gram (GR)</SelectItem>
                    <SelectItem value={ItemUnit.LITER}>Liter (L)</SelectItem>
                    <SelectItem value={ItemUnit.ML}>Milliliter (ML)</SelectItem>
                    <SelectItem value={ItemUnit.PACK}>Pack</SelectItem>
                    <SelectItem value={ItemUnit.PCS}>Pieces (PCS)</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Category */}
          <FormField
            control={form.control}
            name="categoryId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                  disabled={categoriesLoading}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={categoriesLoading ? "Loading..." : "Select category (optional)"} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {categoriesData?.data?.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Price */}
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Price *</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    step="0.01"
                    placeholder="0.00" 
                    {...field} 
                    onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Reorder Point */}
          <FormField
            control={form.control}
            name="reorderPoint"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Reorder Point *</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="0" 
                    {...field} 
                    onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                  />
                </FormControl>
                <FormDescription>
                  Minimum stock level before reordering
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Shelf Life Days */}
          <FormField
            control={form.control}
            name="shelfLifeDays"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Shelf Life (Days)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="Leave empty if not applicable" 
                    {...field}
                    value={field.value ?? ''}
                    onChange={e => {
                      const val = e.target.value;
                      field.onChange(val === '' ? null : parseInt(val));
                    }}
                  />
                </FormControl>
                <FormDescription>
                  How many days before item expires
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Requires Cold Storage */}
          <FormField
            control={form.control}
            name="requiresColdStorage"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>
                    Requires Cold Storage
                  </FormLabel>
                  <FormDescription>
                    Check if this item needs to be stored in cold temperature
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />

          {/* Is Consumable */}
          <FormField
            control={form.control}
            name="isConsumable"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>
                    Is Consumable
                  </FormLabel>
                  <FormDescription>
                    Check if this item is directly consumable (e.g., food items)
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />

          {/* Description */}
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Input placeholder="Enter description (optional)" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Nutritional Info - JSON Field */}
          <FormField
            control={form.control}
            name="nutritionalInfo"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Nutritional Information (JSON)</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder='{"calories": 100, "protein": 5, "carbs": 20, "fat": 2}'
                    className="font-mono text-sm min-h-[100px]"
                    value={field.value ? (typeof field.value === 'string' ? field.value : JSON.stringify(field.value, null, 2)) : ''}
                    onChange={(e) => {
                      const val = e.target.value.trim();
                      if (!val) {
                        field.onChange(null);
                        return;
                      }
                      try {
                        const json = JSON.parse(val);
                        field.onChange(json);
                      } catch {
                        // Keep as string for now, let validation handle it
                        field.onChange(val);
                      }
                    }}
                  />
                </FormControl>
                <FormDescription>
                  Enter nutritional information as valid JSON format (optional). Example: {`{"calories": 100, "protein": 5}`}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Active Status - Only show for edit mode */}
        {item?.id && (
          <FormField
            control={form.control}
            name="isActive"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>
                    Status Aktif
                  </FormLabel>
                  <FormDescription>
                    Item yang tidak aktif tidak akan muncul dalam pilihan
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />
        )}

        <div className="flex gap-4">
          <Button type="submit" disabled={externalLoading ?? mutation.isPending}>
            {(externalLoading ?? mutation.isPending) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {item?.id ? 'Update' : 'Create'} Item
          </Button>
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => router.back()}
            disabled={externalLoading ?? mutation.isPending}
          >
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default ItemForm;