"use client"

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useCreateLocation, useUpdateLocation } from '@/lib/hooks/use-master-data';
import { useToast } from '@/lib/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { LocationType } from '@/lib/types';

const locationFormSchema = z.object({
  code: z.string().min(1, 'Code is required'),
  name: z.string().min(1, 'Name is required'),
  type: z.nativeEnum(LocationType),
  address: z.string().optional(),
  phone: z.string().optional(),
  managerName: z.string().optional(),
  capacityKg: z.number().min(0).optional(),
  isActive: z.boolean(),
});

type LocationFormValues = z.infer<typeof locationFormSchema>;

export interface LocationFormProps {
  initialData?: Partial<LocationFormValues> & { id?: string };
}

const LocationForm: React.FC<LocationFormProps> = ({ initialData }) => {
  const router = useRouter();
  const { toast } = useToast();
  const isEditing = !!initialData?.id;

  const createMutation = useCreateLocation();
  const updateMutation = useUpdateLocation(initialData?.id || '');
  const mutation = isEditing ? updateMutation : createMutation;

  const form = useForm<LocationFormValues>({
    resolver: zodResolver(locationFormSchema),
    defaultValues: {
      code: initialData?.code || '',
      name: initialData?.name || '',
      type: initialData?.type || LocationType.CENTRAL_WAREHOUSE,
      address: initialData?.address || '',
      phone: initialData?.phone || '',
      managerName: initialData?.managerName || '',
      capacityKg: initialData?.capacityKg || 0,
      isActive: initialData?.isActive ?? true,
    },
  });

  useEffect(() => {
    if (mutation.isSuccess) {
      toast({
        title: isEditing ? 'Location updated' : 'Location created',
        description: isEditing
          ? 'Location has been updated successfully.'
          : 'New location has been created successfully.',
      });
      router.push('/dashboard/master-data/locations');
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

  const onSubmit = (data: LocationFormValues) => {
    mutation.mutate(data as any);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="code"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Kode Lokasi *</FormLabel>
              <FormControl>
                <Input {...field} disabled={isEditing} placeholder="LOC001" />
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
              <FormLabel>Nama Lokasi *</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Gudang Utama" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipe Lokasi *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih tipe lokasi" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value={LocationType.CENTRAL_WAREHOUSE}>
                    Gudang Pusat
                  </SelectItem>
                  <SelectItem value={LocationType.REGIONAL_WAREHOUSE}>
                    Gudang Regional
                  </SelectItem>
                  <SelectItem value={LocationType.KITCHEN}>Dapur</SelectItem>
                  <SelectItem value={LocationType.DISTRIBUTION_POINT}>
                    Titik Distribusi
                  </SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Alamat</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Jl. Contoh No. 123" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Telepon</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="021-12345678" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="managerName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nama Manajer</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="John Doe" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="capacityKg"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Kapasitas (kg)</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  {...field} 
                  placeholder="0"
                  onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : 0)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

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
                    Lokasi yang tidak aktif tidak akan muncul dalam pilihan
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />
        )}

        <div className="flex gap-4">
          <Button
            type="submit"
            disabled={mutation.isPending}
          >
            {mutation.isPending
              ? isEditing
                ? 'Mengupdate...'
                : 'Membuat...'
              : isEditing
              ? 'Update Lokasi'
              : 'Buat Lokasi'}
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

export default LocationForm;