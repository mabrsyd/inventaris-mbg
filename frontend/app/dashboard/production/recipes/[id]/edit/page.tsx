'use client';

import { useRouter, useParams } from 'next/navigation';
import { useRecipe, useUpdateRecipe } from '@/lib/hooks/use-production';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';
import RecipeForm from '@/components/forms/recipe-form';

export default function EditRecipePage() {
  const router = useRouter();
  const params = useParams();
  const recipeId = params.id as string;

  const { data: recipeResponse, isLoading: isLoadingRecipe } = useRecipe(recipeId);
  const { mutate: updateRecipe, isPending: isUpdating } = useUpdateRecipe();

  if (isLoadingRecipe) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    );
  }

  const recipe = recipeResponse?.data;

  if (!recipe) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <p className="text-slate-600">Recipe not found</p>
        <Button onClick={() => router.back()} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Go Back
        </Button>
      </div>
    );
  }

  const handleSubmit = (data: any) => {
    updateRecipe(
      {
        id: recipeId,
        dto: data,
      },
      {
        onSuccess: () => {
          router.push(`/dashboard/production/recipes/${recipeId}`);
        },
      }
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50 to-amber-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.back()}
            className="rounded-full"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Edit Recipe</h1>
            <p className="text-slate-600 mt-1">{recipe.name}</p>
          </div>
        </div>

        {/* Form Card */}
        <Card className="bg-white shadow-xl border-0">
          <CardHeader className="bg-gradient-to-r from-orange-500 to-amber-500 text-white border-b-0">
            <CardTitle className="text-xl">Recipe Information</CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <RecipeForm
              recipe={recipe as any}
              onSubmit={handleSubmit}
              loading={isUpdating}
            />
          </CardContent>
        </Card>

        {/* Footer Actions */}
        <div className="flex gap-3 mt-6 justify-end">
          <Button
            variant="outline"
            onClick={() => router.back()}
            disabled={isUpdating}
            className="gap-2"
          >
            Cancel
          </Button>
          <Button
            onClick={() => {
              const form = document.querySelector('form');
              if (form) form.dispatchEvent(new Event('submit', { bubbles: true }));
            }}
            disabled={isUpdating}
            className="gap-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600"
          >
            {isUpdating && <Loader2 className="h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
}
