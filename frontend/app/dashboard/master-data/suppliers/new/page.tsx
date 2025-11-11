"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import SupplierForm from '@/components/forms/supplier-form';

const NewSupplierPage = () => {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Tambah Supplier Baru</h1>
        <p className="text-muted-foreground mt-1">
          Buat supplier baru
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informasi Supplier</CardTitle>
        </CardHeader>
        <CardContent>
          <SupplierForm />
        </CardContent>
      </Card>
    </div>
  );
};

export default NewSupplierPage;