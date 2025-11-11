"use client"

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useRecipe } from '@/lib/hooks/use-production';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Edit, Trash2, Loader2 } from 'lucide-react';
import { formatDate } from '@/lib/utils/date';
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
import { useDeleteRecipe } from '@/lib/hooks/use-production';

export default function RecipeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const { data: recipeData, isLoading } = useRecipe(id);
  const deleteMutation = useDeleteRecipe();

  const handleDelete = () => {
    deleteMutation.mutate(id, {
      onSuccess: () => {
        router.push('/dashboard/production/recipes');
      }
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50 to-amber-50 p-6">
        <div className="max-w-5xl mx-auto space-y-6">
          <Skeleton className="h-12 w-64" />
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-4 w-full" />
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!recipeData?.data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50 to-amber-50 p-6">
        <div className="max-w-5xl mx-auto">
          <Card>
            <CardContent className="p-6">
              <div className="text-center py-8">
                <p className="text-slate-500 mb-4">Recipe not found</p>
                <Button variant="outline" onClick={() => router.back()}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Go Back
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const recipe = recipeData.data;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50 to-amber-50 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-900 to-amber-700 bg-clip-text text-transparent">
              {recipe.name}
            </h1>
            <p className="text-slate-600 mt-1">Created on {formatDate(recipe.createdAt)}</p>
          </div>

          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              onClick={() => router.push(`/dashboard/production/recipes/${recipe.id}/edit`)}
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <Button 
              variant="destructive"
              onClick={() => setShowDeleteDialog(true)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
            <Button 
              variant="outline" 
              onClick={() => router.push('/dashboard/production/recipes')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </div>
        </div>

        {/* Recipe Details */}
        <Card className="bg-white shadow-lg">
          <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50 border-b">
            <CardTitle className="text-xl font-semibold text-slate-800">Recipe Information</CardTitle>
          </CardHeader>
          <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium text-slate-500 uppercase tracking-wide">Recipe Name</label>
              <p className="text-lg font-semibold text-slate-900 mt-1">{recipe.name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-500 uppercase tracking-wide">Portion Size</label>
              <p className="text-lg text-slate-900 mt-1">{recipe.portionSize || '-'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-500 uppercase tracking-wide">Preparation Time</label>
              <p className="text-lg text-slate-900 mt-1">{recipe.preparationTime ? `${recipe.preparationTime} min` : '-'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-500 uppercase tracking-wide">Cooking Time</label>
              <p className="text-lg text-slate-900 mt-1">{recipe.cookingTime ? `${recipe.cookingTime} min` : '-'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-500 uppercase tracking-wide">Status</label>
              <Badge className="mt-1" variant={recipe.isActive ? 'default' : 'secondary'}>
                {recipe.isActive ? 'Active' : 'Inactive'}
              </Badge>
            </div>
            {recipe.totalCost && (
              <div>
                <label className="text-sm font-medium text-slate-500 uppercase tracking-wide">Total Cost</label>
                <p className="text-lg text-slate-900 mt-1">Rp {recipe.totalCost.toLocaleString('id-ID')}</p>
              </div>
            )}
            {recipe.description && (
              <div className="md:col-span-2">
                <label className="text-sm font-medium text-slate-500 uppercase tracking-wide">Description</label>
                <p className="text-slate-700 mt-1">{recipe.description}</p>
              </div>
            )}
            {recipe.instructions && (
              <div className="md:col-span-2">
                <label className="text-sm font-medium text-slate-500 uppercase tracking-wide">Instructions</label>
                <p className="text-slate-700 mt-1 whitespace-pre-wrap">{recipe.instructions}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Ingredients */}
        {recipe.items && recipe.items.length > 0 && (
          <Card className="bg-white shadow-lg">
            <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50 border-b">
              <CardTitle className="text-xl font-semibold text-slate-800">
                Ingredients ({recipe.items.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-slate-200">
                      <th className="text-left py-3 px-4 font-semibold text-slate-700">Item Name</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-700">SKU</th>
                      <th className="text-right py-3 px-4 font-semibold text-slate-700">Quantity</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-700">Unit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recipe.items.map((ingredient: any) => (
                      <tr key={ingredient.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-4 font-medium text-slate-900">{ingredient.item?.name || 'Unknown'}</td>
                        <td className="py-3 px-4 text-slate-700">{ingredient.item?.sku || '-'}</td>
                        <td className="text-right py-3 px-4 text-slate-900 font-semibold">{ingredient.quantity}</td>
                        <td className="py-3 px-4 text-slate-700">{ingredient.unit || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Delete Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Recipe</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this recipe? This action cannot be undone and will affect any work orders using this recipe.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete} 
              className="bg-red-600 hover:bg-red-700"
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}