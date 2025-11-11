"use client"

import React, { useEffect } from 'react';
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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useToast } from '@/lib/hooks/use-toast';
import { useCreateSupplier, useUpdateSupplier } from '@/lib/hooks/use-master-data';
import { Loader2 } from 'lucide-react';

const supplierSchema = z.object({
  code: z.string().min(1, 'Code is required'),
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  isActive: z.boolean(),
});

type SupplierFormData = z.infer<typeof supplierSchema>;

export interface SupplierFormProps {
  initialData?: Partial<SupplierFormData> & { id?: string };
}

const SupplierForm: React.FC<SupplierFormProps> = ({ initialData }) => {
  const router = useRouter();
  const { toast } = useToast();
  const isEditing = !!initialData?.id;

  const form = useForm<SupplierFormData>({
    resolver: zodResolver(supplierSchema),
    defaultValues: {
      code: initialData?.code || '',
      name: initialData?.name || '',
      email: initialData?.email || '',
      phone: initialData?.phone || '',
      address: initialData?.address || '',
      city: initialData?.city || '',
      country: initialData?.country || '',
      isActive: initialData?.isActive ?? true,
    },
  });

  const createMutation = useCreateSupplier();
  const updateMutation = useUpdateSupplier(initialData?.id || '');
  const mutation = isEditing ? updateMutation : createMutation;

  useEffect(() => {
    if (mutation.isSuccess) {
      toast({
        title: isEditing ? 'Supplier updated' : 'Supplier created',
        description: isEditing
          ? 'Supplier has been updated successfully.'
          : 'New supplier has been created successfully.',
      });
      router.push('/dashboard/master-data/suppliers');
      router.refresh();
    }
  }, [mutation.isSuccess, isEditing, router, toast]);

  useEffect(() => {
    if (mutation.isError) {
      toast({
        title: 'Error',
        description: mutation.error?.message || 'An error occurred',
        variant: 'destructive',
      });
    }
  }, [mutation.isError, mutation.error, toast]);

  const handleFormSubmit = (data: SupplierFormData) => {
    mutation.mutate(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Kode Supplier *</FormLabel>
                <FormControl>
                  <Input {...field} disabled={isEditing} placeholder="SUP001" />
                </FormControl>
                {isEditing && (
                  <FormDescription>
                    Kode tidak dapat diubah setelah dibuat
                  </FormDescription>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nama Supplier *</FormLabel>
                <FormControl>
                  <Input placeholder="PT. Supplier Contoh" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="supplier@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Telepon</FormLabel>
                <FormControl>
                  <Input placeholder="021-12345678" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Alamat</FormLabel>
                <FormControl>
                  <Input placeholder="Jl. Contoh No. 123" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="city"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Kota</FormLabel>
                <FormControl>
                  <Input placeholder="Jakarta" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="country"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Negara</FormLabel>
                <FormControl>
                  <Input placeholder="Indonesia" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {isEditing && (
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
                  <FormLabel>Status Aktif</FormLabel>
                  <FormDescription>
                    Supplier yang tidak aktif tidak akan muncul dalam pilihan
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />
        )}

        <div className="flex gap-4">
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {mutation.isPending
              ? isEditing
                ? 'Mengupdate...'
                : 'Membuat...'
              : isEditing
              ? 'Update Supplier'
              : 'Buat Supplier'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={mutation.isPending}
          >
            Batal
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default SupplierForm;