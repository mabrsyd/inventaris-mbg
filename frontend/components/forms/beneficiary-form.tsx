"use client"

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useToast } from '@/lib/hooks/use-toast';
import { useCreateBeneficiary, useUpdateBeneficiary } from '@/lib/hooks/use-distribution';
import { Loader2 } from 'lucide-react';

const beneficiarySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  type: z.string().min(1, 'Type is required'),
  contactPerson: z.string().min(1, 'Contact person is required'),
  phone: z.string().min(1, 'Phone is required'),
  address: z.string().min(1, 'Address is required'),
});

type BeneficiaryFormData = z.infer<typeof beneficiarySchema>;

export interface BeneficiaryFormProps {
  initialData?: Partial<BeneficiaryFormData> & { id?: string };
}

const BeneficiaryForm: React.FC<BeneficiaryFormProps> = ({ initialData }) => {
  const router = useRouter();
  const { toast } = useToast();
  const isEditing = !!initialData?.id;

  const form = useForm<BeneficiaryFormData>({
    resolver: zodResolver(beneficiarySchema),
    defaultValues: {
      name: initialData?.name || '',
      type: initialData?.type || '',
      contactPerson: initialData?.contactPerson || '',
      phone: initialData?.phone || '',
      address: initialData?.address || '',
    },
  });

  const createMutation = useCreateBeneficiary();
  const updateMutation = useUpdateBeneficiary();

  useEffect(() => {
    if (createMutation.isSuccess || updateMutation.isSuccess) {
      toast({
        title: isEditing ? 'Beneficiary updated' : 'Beneficiary created',
        description: isEditing
          ? 'Beneficiary has been updated successfully.'
          : 'New beneficiary has been created successfully.',
      });
      router.push('/dashboard/distribution/beneficiaries');
      router.refresh();
    }
  }, [createMutation.isSuccess, updateMutation.isSuccess, isEditing, router, toast]);

  useEffect(() => {
    if (createMutation.isError || updateMutation.isError) {
      const error = createMutation.error || updateMutation.error;
      toast({
        title: 'Error',
        description: error?.message || 'An error occurred',
        variant: 'destructive',
      });
    }
  }, [createMutation.isError, updateMutation.isError, createMutation.error, updateMutation.error, toast]);

  const handleFormSubmit = (data: BeneficiaryFormData) => {
    if (isEditing && initialData?.id) {
      updateMutation.mutate({ id: initialData.id, dto: data });
    } else {
      createMutation.mutate(data);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nama Beneficiary *</FormLabel>
                <FormControl>
                  <Input placeholder="PT. Yayasan Contoh" {...field} />
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
                <FormLabel>Tipe *</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Sekolah, Panti Asuhan" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="contactPerson"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contact Person *</FormLabel>
                <FormControl>
                  <Input placeholder="John Doe" {...field} />
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
                <FormLabel>Telepon *</FormLabel>
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
                <FormLabel>Alamat *</FormLabel>
                <FormControl>
                  <Input placeholder="Jl. Contoh No. 123" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex gap-4">
          <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
            {(createMutation.isPending || updateMutation.isPending) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {createMutation.isPending || updateMutation.isPending
              ? isEditing
                ? 'Mengupdate...'
                : 'Membuat...'
              : isEditing
              ? 'Update Beneficiary'
              : 'Buat Beneficiary'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={createMutation.isPending || updateMutation.isPending}
          >
            Batal
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default BeneficiaryForm;