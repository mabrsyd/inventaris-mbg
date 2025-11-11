// Contoh penggunaan DataTable dengan TanStack Query
'use client'

import { useRouter } from 'next/navigation';
import axios from 'axios';
import { DataTable } from '@/components/tables/data-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal, Pencil, Trash } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Category {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
}

export default function CategoriesPage() {
  const router = useRouter();

  // Fungsi untuk fetch data
  const fetchCategories = async ({ page, pageSize, search }: { page: number; pageSize: number; search?: string }) => {
    const response = await axios.get('/api/categories', {
      params: { page, pageSize, search }
    });
    return {
      data: response.data.data,
      total: response.data.total
    };
  };

  // Definisi kolom
  const columns = [
    {
      key: 'name' as keyof Category,
      label: 'Name',
    },
    {
      key: 'description' as keyof Category,
      label: 'Description',
      render: (item: Category) => item.description || '-'
    },
    {
      key: 'createdAt' as keyof Category,
      label: 'Created At',
      render: (item: Category) => new Date(item.createdAt).toLocaleDateString()
    },
    {
      key: 'actions' as keyof Category,
      label: 'Actions',
      render: (item: Category) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => router.push(`/dashboard/master-data/categories/${item.id}`)}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem className="text-red-600">
              <Trash className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }
  ];

  return (
    <div className="container mx-auto py-10">
      <DataTable
        queryKey={['categories']}
        fetchData={fetchCategories}
        columns={columns}
        title="Categories"
        searchPlaceholder="Search categories..."
        onAdd={() => router.push('/dashboard/master-data/categories/new')}
        addLabel="Add Category"
      />
    </div>
  );
}
