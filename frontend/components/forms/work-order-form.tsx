"use client";

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/lib/hooks/use-toast';
import { useCreateWorkOrder } from '@/lib/hooks/use-production';
import { useRecipes } from '@/lib/hooks/use-production';
import { useLocations } from '@/lib/hooks/use-master-data';
import { Loader2 } from 'lucide-react';

const workOrderSchema = z.object({
  recipeId: z.string().min(1, 'Recipe is required'),
  kitchenLocationId: z.string().min(1, 'Kitchen location is required'),
  plannedQuantity: z.number().min(1, 'Planned quantity must be at least 1'),
  scheduledDate: z.string().optional(),
  notes: z.string().optional(),
});

type WorkOrderFormData = z.infer<typeof workOrderSchema>;

interface WorkOrderFormProps {
  workOrder?: any;
  onSubmit?: any;
  loading?: boolean;
}

const WorkOrderForm: React.FC<WorkOrderFormProps> = ({ workOrder, onSubmit, loading }) => {
  const router = useRouter();
  const { toast } = useToast();
  const createMutation = useCreateWorkOrder();
  const { data: recipesData, isLoading: recipesLoading } = useRecipes({ limit: 100 });
  const { data: locationsData, isLoading: locationsLoading } = useLocations({ limit: 100 });

  const form = useForm({
    resolver: zodResolver(workOrderSchema),
    defaultValues: workOrder || {
      recipeId: '',
      kitchenLocationId: '',
      plannedQuantity: 1,
      scheduledDate: '',
      notes: '',
    },
  });

  const handleFormSubmit = (data: WorkOrderFormData) => {
    if (onSubmit) {
      onSubmit(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const selectedRecipeId = form.watch('recipeId');
  const selectedRecipe = recipesData?.data?.find((r) => r.id === selectedRecipeId);
  const plannedQuantity = form.watch('plannedQuantity') || 0;
  const estimatedPortions = selectedRecipe ? plannedQuantity / (selectedRecipe.portionSize || 1) : 0;
  const kitchenLocations = locationsData?.data?.filter(loc => loc.type === 'KITCHEN') || [];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
        <Card>
          <CardHeader><CardTitle>Work Order Details</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField control={form.control} name="recipeId" render={({ field }) => (
              <FormItem>
                <FormLabel>Recipe *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value} disabled={recipesLoading}>
                  <FormControl><SelectTrigger><SelectValue placeholder="Select recipe" /></SelectTrigger></FormControl>
                  <SelectContent>
                    {recipesData?.data?.map((recipe) => (
                      <SelectItem key={recipe.id} value={recipe.id}>{recipe.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedRecipe && <FormDescription>Portion size: {selectedRecipe.portionSize}</FormDescription>}
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="kitchenLocationId" render={({ field }) => (
              <FormItem>
                <FormLabel>Kitchen Location *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value} disabled={locationsLoading}>
                  <FormControl><SelectTrigger><SelectValue placeholder="Select kitchen" /></SelectTrigger></FormControl>
                  <SelectContent>
                    {kitchenLocations.map((location) => (
                      <SelectItem key={location.id} value={location.id}>{location.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="plannedQuantity" render={({ field }) => (
              <FormItem>
                <FormLabel>Planned Quantity *</FormLabel>
                <FormControl><Input type="number" step="0.01" min="0.01" {...field} onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)} /></FormControl>
                {estimatedPortions > 0 && <FormDescription>Estimated portions: {estimatedPortions.toFixed(2)}</FormDescription>}
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="scheduledDate" render={({ field }) => (
              <FormItem>
                <FormLabel>Scheduled Date</FormLabel>
                <FormControl><Input type="date" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="notes" render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Notes</FormLabel>
                <FormControl><Input placeholder="Additional notes" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </CardContent>
        </Card>
        <div className="flex gap-4">
          <Button type="submit" disabled={loading ?? createMutation.isPending}>
            {(loading ?? createMutation.isPending) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {workOrder?.id ? 'Update' : 'Create'} Work Order
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
        </div>
      </form>
    </Form>
  );
};

export default WorkOrderForm;
