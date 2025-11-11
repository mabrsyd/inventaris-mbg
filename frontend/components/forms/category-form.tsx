"use client"

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
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
import { useCreateCategory, useUpdateCategory } from '@/lib/hooks/use-master-data';
import { Loader2 } from 'lucide-react';

const categorySchema = z.object({
  code: z.string().min(1, 'Code is required'),
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  isActive: z.boolean().optional(),
});

type CategoryFormData = z.infer<typeof categorySchema>;

interface CategoryFormProps {
  initialData?: CategoryFormData & { id: string; isActive?: boolean };
  onSubmit?: (data: CategoryFormData) => Promise<void>;
  loading?: boolean;
}

const CategoryForm: React.FC<CategoryFormProps> = ({ initialData, onSubmit: externalOnSubmit, loading: externalLoading }) => {
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: initialData || {
      code: '',
      name: '',
      description: '',
      isActive: true,
    },
  });

  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory(initialData?.id || '');
  
  const mutation = initialData?.id ? updateMutation : createMutation;

  const handleFormSubmit = (data: CategoryFormData) => {
    if (externalOnSubmit) {
      externalOnSubmit(data);
    } else {
      mutation.mutate(data);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="code"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Code</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Enter category code (e.g., CAT-001)" 
                  {...field}
                  disabled={!!initialData?.id}
                />
              </FormControl>
              <FormMessage />
              {initialData?.id && (
                <p className="text-xs text-muted-foreground">
                  Code cannot be changed after creation
                </p>
              )}
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter category name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Input placeholder="Enter description" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {initialData?.id && (
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
                    Centang untuk mengaktifkan kategori ini
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />
        )}
        
        <div className="flex gap-4">
          <Button type="submit" disabled={externalLoading ?? mutation.isPending}>
            {(externalLoading ?? mutation.isPending) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {initialData?.id ? 'Update' : 'Create'} Category
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

export default CategoryForm;