"use client"

import { useRouter } from 'next/navigation';
import ItemForm from '@/components/forms/item-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const NewItemPage = () => {
  const router = useRouter();

  const handleSuccess = () => {
    router.push('/dashboard/inventory/items');
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Tambah Item</h1>
        <p className="text-muted-foreground mt-1">
          Buat item baru untuk inventaris
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informasi Item</CardTitle>
        </CardHeader>
        <CardContent>
          <ItemForm />
        </CardContent>
      </Card>
    </div>
  );
};

export default NewItemPage;