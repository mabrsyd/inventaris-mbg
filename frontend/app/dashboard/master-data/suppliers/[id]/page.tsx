"use client"

import { useParams } from 'next/navigation';
import { useSupplier } from '@/lib/hooks/use-master-data';
import LoadingSpinner from '@/components/ui/loading-spinner';
import ErrorMessage from '@/components/ui/error-message';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import SupplierForm from '@/components/forms/supplier-form';

const SupplierEditPage = () => {
  const params = useParams();
  const id = params?.id as string;
  
  const { data: supplier, isLoading, error } = useSupplier(id);

  if (isLoading) return <LoadingSpinner size="lg" className="my-8" />;
  if (error) return <ErrorMessage message="Failed to fetch supplier details" />;
  if (!supplier) return <ErrorMessage message="Supplier not found" />;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Edit Supplier</h1>
        <p className="text-muted-foreground mt-1">
          Perbarui informasi supplier
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informasi Supplier</CardTitle>
        </CardHeader>
        <CardContent>
          <SupplierForm
            initialData={{
              id: supplier.id,
              code: supplier.code,
              name: supplier.name,
              email: supplier.email || '',
              phone: supplier.phone || '',
              address: supplier.address || '',
              city: supplier.city || '',
              country: supplier.country || '',
              isActive: supplier.isActive,
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default SupplierEditPage;