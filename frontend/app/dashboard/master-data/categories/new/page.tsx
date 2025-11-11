"use client"

import { useRouter } from 'next/navigation';
import CategoryForm from '@/components/forms/category-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const NewCategoryPage = () => {
  const router = useRouter();

  const handleSuccess = () => {
    router.push('/dashboard/master-data/categories');
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Tambah Kategori</h1>
        <p className="text-muted-foreground mt-1">
          Buat kategori baru untuk item inventaris
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informasi Kategori</CardTitle>
        </CardHeader>
        <CardContent>
          <CategoryForm />
        </CardContent>
      </Card>
    </div>
  );
};

export default NewCategoryPage;