'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Search, BookOpen, Package, MoreVertical } from 'lucide-react';
import {
  useRecipes,
  useDeleteRecipe,
} from '@/lib/hooks/use-production';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';

export default function RecipesPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data, isLoading } = useRecipes({ page, search });
  const deleteMutation = useDeleteRecipe();

  const handleDelete = () => {
    if (deleteId) {
      deleteMutation.mutate(deleteId);
      setDeleteId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50 to-amber-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-900 to-amber-700 bg-clip-text text-transparent">
              Production Recipes
            </h1>
            <p className="text-slate-600 mt-1">Manage production recipes and ingredients</p>
          </div>
          <Button
            onClick={() => router.push('/dashboard/production/recipes/new')}
            className="bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white shadow-lg"
          >
            <Plus className="mr-2 h-4 w-4" />
            New Recipe
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4 bg-white shadow-md hover:shadow-lg transition-shadow border-l-4 border-orange-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Total Recipes</p>
                <p className="text-2xl font-bold text-slate-900">{data?.pagination?.total || 0}</p>
              </div>
              <BookOpen className="h-8 w-8 text-orange-500" />
            </div>
          </Card>

          <Card className="p-4 bg-white shadow-md hover:shadow-lg transition-shadow border-l-4 border-amber-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Active Recipes</p>
                <p className="text-2xl font-bold text-amber-600">{data?.data.length || 0}</p>
              </div>
              <Package className="h-8 w-8 text-amber-500" />
            </div>
          </Card>

          <Card className="p-4 bg-white shadow-md hover:shadow-lg transition-shadow border-l-4 border-slate-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Avg Ingredients</p>
                <p className="text-2xl font-bold text-slate-900">
                  {data?.data && data.data.length ? Math.round(data.data.reduce((acc: number, r: any) => acc + (r.items?.length || r.recipeItems?.length || r.ingredients?.length || 0), 0) / data.data.length) : 0}
                </p>
              </div>
              <Package className="h-8 w-8 text-slate-500" />
            </div>
          </Card>
        </div>

        <Card className="p-4 bg-white shadow-md">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
              <Input
                placeholder="Search recipes..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </Card>

        <Card className="bg-white shadow-lg overflow-hidden">
          <Table>
            <TableHeader className="bg-gradient-to-r from-orange-50 to-amber-50">
              <TableRow>
                <TableHead className="font-semibold">Recipe Name</TableHead>
                <TableHead className="font-semibold">Output Item</TableHead>
                <TableHead className="font-semibold">Output Quantity</TableHead>
                <TableHead className="font-semibold">Ingredients</TableHead>
                <TableHead className="font-semibold">Description</TableHead>
                <TableHead className="text-right font-semibold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : data?.data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                    No recipes found
                  </TableCell>
                </TableRow>
              ) : (
                data?.data.map((recipe: any) => (
                  <TableRow key={recipe.id} className="hover:bg-slate-50 transition-colors">
                    <TableCell className="font-medium text-slate-900">{recipe.name}</TableCell>
                    <TableCell className="text-slate-700">{recipe.name || '-'}</TableCell>
                    <TableCell className="text-slate-700">
                      <Badge variant="outline" className="bg-orange-50 border-orange-300 text-orange-700">
                        {recipe.portionSize || '-'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-slate-50 border-slate-300 text-slate-700">
                        {(recipe.items?.length || 0)} items
                      </Badge>
                    </TableCell>
                    <TableCell className="text-slate-600 max-w-md truncate">
                      {recipe.description || '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem onClick={() => router.push(`/dashboard/production/recipes/${recipe.id}`)}>
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => router.push(`/dashboard/production/recipes/${recipe.id}/edit`)}>
                            Edit Recipe
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => setDeleteId(recipe.id)}
                            className="text-red-600 focus:text-red-600"
                          >
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>

        {data && data.pagination && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-600">
              Showing {((data.pagination.page - 1) * data.pagination.limit) + 1} to{' '}
              {Math.min(data.pagination.page * data.pagination.limit, data.pagination.total)} of{' '}
              {data.pagination.total} results
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setPage(page - 1)} disabled={page === 1}>
                Previous
              </Button>
              <Button variant="outline" size="sm" onClick={() => setPage(page + 1)} disabled={page >= data.pagination.totalPages}>
                Next
              </Button>
            </div>
          </div>
        )}

      </div>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Recipe</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this recipe? This action cannot be undone and will affect any work orders using this recipe.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
