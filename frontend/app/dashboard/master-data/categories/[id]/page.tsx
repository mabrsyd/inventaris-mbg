"use client"

import { useParams } from 'next/navigation';
import { useCategory } from '@/lib/hooks/use-master-data';
import LoadingSpinner from '@/components/ui/loading-spinner';
import ErrorMessage from '@/components/ui/error-message';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import CategoryForm from '@/components/forms/category-form';

const CategoryEditPage = () => {
  const params = useParams();
  const id = params?.id as string;
  
  const { data, isLoading, error } = useCategory(id);

  if (isLoading) return <LoadingSpinner size="lg" className="my-8" />;
  if (error) return <ErrorMessage message="Failed to fetch category details" />;
  if (!data) return <ErrorMessage message="Category not found" />;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Edit Kategori</h1>
        <p className="text-muted-foreground mt-1">
          Perbarui informasi kategori
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informasi Kategori</CardTitle>
        </CardHeader>
        <CardContent>
          <CategoryForm
            initialData={{
              id: data.id,
              code: data.code,
              name: data.name,
              description: data.description || '',
              isActive: data.isActive,
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default CategoryEditPage;