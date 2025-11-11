"use client"

import React from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/lib/hooks/use-toast';
import { useCreateRecipe, useUpdateRecipe } from '@/lib/hooks/use-production';
import { useItems } from '@/lib/hooks/use-items';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import { ItemUnit } from '@/lib/types';
import type { CreateRecipeDto, UpdateRecipeDto } from '@/lib/api/production.service';

// Schema for recipe ingredient
const ingredientSchema = z.object({
  itemId: z.string().min(1, 'Item is required'),
  quantity: z.number().min(0.01, 'Quantity must be greater than 0'),
  unit: z.nativeEnum(ItemUnit),
});

// Schema for the entire recipe form
const recipeSchema = z.object({
  code: z.string().optional(),
  name: z.string().min(1, 'Recipe name is required'),
  description: z.string().optional(),
  portionSize: z.number().min(0.01, 'Portion size must be greater than 0'),
  preparationTime: z.number().min(0).optional(),
  cookingTime: z.number().min(0).optional(),
  instructions: z.string().optional(),
  nutritionalInfo: z.any().optional(),
  ingredients: z.array(ingredientSchema).min(1, 'At least one ingredient is required'),
});

type RecipeFormData = z.infer<typeof recipeSchema>;

interface RecipeFormProps {
  recipe?: RecipeFormData & { id: string };
  onSubmit?: (data: CreateRecipeDto) => void;
  loading?: boolean;
}

const RecipeForm: React.FC<RecipeFormProps> = ({
  recipe,
  onSubmit: externalOnSubmit,
  loading: externalLoading,
}) => {
  const router = useRouter();
  const { toast } = useToast();
  const createMutation = useCreateRecipe();
  const updateMutation = useUpdateRecipe();
  
  const mutation = recipe?.id ? updateMutation : createMutation;

  // Fetch items for ingredients
  const { data: itemsData, isLoading: itemsLoading } = useItems({ limit: 200 });

  const form = useForm<RecipeFormData>({
    resolver: zodResolver(recipeSchema),
    defaultValues: recipe ? {
      code: recipe.code || '',
      name: recipe.name || '',
      description: recipe.description || '',
      portionSize: recipe.portionSize || 1,
      preparationTime: recipe.preparationTime || 0,
      cookingTime: recipe.cookingTime || 0,
      instructions: recipe.instructions || '',
      // Map either 'ingredients' or 'recipeItems' from the response
      ingredients: ((recipe as any).ingredients || (recipe as any).recipeItems || []).map((ing: any) => ({
        itemId: ing.itemId || ing.item?.id || '',
        quantity: ing.quantity || 0,
        unit: ing.unit || ItemUnit.KG,
      })),
    } : {
      code: '',
      name: '',
      description: '',
      portionSize: 1,
      preparationTime: 0,
      cookingTime: 0,
      instructions: '',
      ingredients: [],
    },
  });

  // Use field array for ingredients management
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'ingredients',
  });

  // Add new ingredient row
  const handleAddIngredient = () => {
    append({
      itemId: '',
      quantity: 1,
      unit: ItemUnit.KG,
    });
  };

  // Handle form submission
  const handleFormSubmit = (data: RecipeFormData) => {
    if (externalOnSubmit) {
      externalOnSubmit(data as CreateRecipeDto);
    } else {
      if (recipe?.id) {
        updateMutation.mutate({ id: recipe.id, dto: data as UpdateRecipeDto });
      } else {
        createMutation.mutate(data as CreateRecipeDto);
      }
    }
  };

  // Get item name by ID
  const getItemName = (itemId: string) => {
    const item = itemsData?.data?.find((i) => i.id === itemId);
    return item ? `${item.name} (${item.sku})` : 'Select item';
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Recipe Information</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Code */}
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Recipe Code</FormLabel>
                  <FormControl>
                    <Input placeholder="RCP-001 (optional)" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Recipe Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter recipe name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Portion Size */}
            <FormField
              control={form.control}
              name="portionSize"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Portion Size *</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="Number of portions this recipe makes"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormDescription>How many portions this recipe produces</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Preparation Time */}
            <FormField
              control={form.control}
              name="preparationTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Preparation Time (minutes)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="0"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Cooking Time */}
            <FormField
              control={form.control}
              name="cookingTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cooking Time (minutes)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="0"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Brief description of the recipe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Instructions */}
            <FormField
              control={form.control}
              name="instructions"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Cooking Instructions</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Step-by-step cooking instructions" 
                      rows={5}
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Ingredients Section */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Ingredients</CardTitle>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddIngredient}
              disabled={itemsLoading}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Ingredient
            </Button>
          </CardHeader>
          <CardContent>
            {fields.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No ingredients added yet. Click "Add Ingredient" to start.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[350px]">Item</TableHead>
                      <TableHead className="w-[150px]">Quantity</TableHead>
                      <TableHead className="w-[150px]">Unit</TableHead>
                      <TableHead className="w-[80px]">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {fields.map((field, index) => (
                      <TableRow key={field.id}>
                        {/* Item Select */}
                        <TableCell>
                          <FormField
                            control={form.control}
                            name={`ingredients.${index}.itemId`}
                            render={({ field }) => (
                              <FormItem>
                                <Select
                                  onValueChange={field.onChange}
                                  value={field.value || ''}
                                  disabled={itemsLoading}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue
                                        placeholder={itemsLoading ? 'Loading...' : 'Select item'}
                                      />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {itemsData?.data?.map((item) => (
                                      <SelectItem key={item.id} value={item.id}>
                                        {item.name} - {item.sku} ({item.unit})
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </TableCell>

                        {/* Quantity */}
                        <TableCell>
                          <FormField
                            control={form.control}
                            name={`ingredients.${index}.quantity`}
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <Input
                                    type="number"
                                    step="0.01"
                                    min="0.01"
                                    {...field}
                                    onChange={(e) =>
                                      field.onChange(parseFloat(e.target.value) || 0)
                                    }
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </TableCell>

                        {/* Unit */}
                        <TableCell>
                          <FormField
                            control={form.control}
                            name={`ingredients.${index}.unit`}
                            render={({ field }) => (
                              <FormItem>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Unit" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value={ItemUnit.KG}>KG</SelectItem>
                                    <SelectItem value={ItemUnit.GR}>GR</SelectItem>
                                    <SelectItem value={ItemUnit.LITER}>L</SelectItem>
                                    <SelectItem value={ItemUnit.ML}>ML</SelectItem>
                                    <SelectItem value={ItemUnit.PACK}>PACK</SelectItem>
                                    <SelectItem value={ItemUnit.PCS}>PCS</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </TableCell>

                        {/* Remove Button */}
                        <TableCell>
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() => remove(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Form Actions */}
        <div className="flex gap-4">
          <Button type="submit" disabled={externalLoading ?? mutation.isPending}>
            {(externalLoading ?? mutation.isPending) && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            {recipe?.id ? 'Update' : 'Create'} Recipe
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={externalLoading ?? mutation.isPending}
          >
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default RecipeForm;