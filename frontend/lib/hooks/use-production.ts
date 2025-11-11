/**
 * Production Hooks
 * Custom React hooks for Recipes and Work Orders
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from './use-toast';
import {
  recipesApi,
  workOrdersApi,
  type RecipesQueryParams,
  type WorkOrdersQueryParams,
  type CreateRecipeDto,
  type UpdateRecipeDto,
  type CreateWorkOrderDto,
  type UpdateWorkOrderDto,
} from '../api/production.service';
import { QUERY_KEYS } from '../config/api.config';

// ===========================
// Recipes Hooks
// ===========================

/**
 * Fetch all recipes
 */
export function useRecipes(params?: RecipesQueryParams) {
  return useQuery({
    queryKey: [QUERY_KEYS.RECIPES, params],
    queryFn: () => recipesApi.getAll(params),
    staleTime: 1000 * 60, // 1 minute
  });
}

/**
 * Fetch single recipe by ID
 */
export function useRecipe(id: string) {
  return useQuery({
    queryKey: [QUERY_KEYS.RECIPES, id],
    queryFn: () => recipesApi.getById(id),
    enabled: !!id,
    staleTime: 1000 * 60, // 1 minute
  });
}

/**
 * Create new recipe
 */
export function useCreateRecipe() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationKey: ['recipes', 'create'],
    mutationFn: (dto: CreateRecipeDto) => recipesApi.create(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.RECIPES] });
      toast({
        title: 'Success',
        description: 'Recipe created successfully',
      });
      router.push('/dashboard/production/recipes');
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to create recipe',
        variant: 'destructive',
      });
    },
  });
}

/**
 * Update recipe
 */
export function useUpdateRecipe() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationKey: ['recipes', 'update'],
    mutationFn: ({ id, dto }: { id: string; dto: UpdateRecipeDto }) =>
      recipesApi.update(id, dto),
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.RECIPES] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.RECIPES, variables.id] });
      toast({
        title: 'Success',
        description: 'Recipe updated successfully',
      });
      router.push('/dashboard/production/recipes');
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update recipe',
        variant: 'destructive',
      });
    },
  });
}

/**
 * Delete recipe
 */
export function useDeleteRecipe() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['recipes', 'delete'],
    mutationFn: (id: string) => recipesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.RECIPES] });
      toast({
        title: 'Success',
        description: 'Recipe deleted successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to delete recipe',
        variant: 'destructive',
      });
    },
  });
}

/**
 * Add ingredient to recipe
 */
export function useAddIngredient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['recipes', 'add-ingredient'],
    mutationFn: ({ id, ingredient }: { id: string; ingredient: { itemId: string; quantity: number } }) =>
      recipesApi.addIngredient(id, ingredient),
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.RECIPES] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.RECIPES, variables.id] });
      toast({
        title: 'Success',
        description: 'Ingredient added successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to add ingredient',
        variant: 'destructive',
      });
    },
  });
}

/**
 * Remove ingredient from recipe
 */
export function useRemoveIngredient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['recipes', 'remove-ingredient'],
    mutationFn: ({ id, ingredientId }: { id: string; ingredientId: string }) =>
      recipesApi.removeIngredient(id, ingredientId),
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.RECIPES] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.RECIPES, variables.id] });
      toast({
        title: 'Success',
        description: 'Ingredient removed successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to remove ingredient',
        variant: 'destructive',
      });
    },
  });
}

// ===========================
// Work Orders Hooks
// ===========================

/**
 * Fetch all work orders
 */
export function useWorkOrders(params?: WorkOrdersQueryParams) {
  return useQuery({
    queryKey: [QUERY_KEYS.WORK_ORDERS, params],
    queryFn: () => workOrdersApi.getAll(params),
    staleTime: 1000 * 60, // 1 minute
  });
}

/**
 * Fetch single work order by ID
 */
export function useWorkOrder(id: string) {
  return useQuery({
    queryKey: [QUERY_KEYS.WORK_ORDERS, id],
    queryFn: () => workOrdersApi.getById(id),
    enabled: !!id,
    staleTime: 1000 * 60, // 1 minute
  });
}

/**
 * Fetch work order statistics
 */
export function useWorkOrderStats() {
  return useQuery({
    queryKey: [QUERY_KEYS.WORK_ORDERS, 'stats'],
    queryFn: () => workOrdersApi.getStats(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Create new work order
 */
export function useCreateWorkOrder() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationKey: ['work-orders', 'create'],
    mutationFn: (dto: CreateWorkOrderDto) => workOrdersApi.create(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.WORK_ORDERS] });
      toast({
        title: 'Success',
        description: 'Work order created successfully',
      });
      router.push('/dashboard/production/work-orders');
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to create work order',
        variant: 'destructive',
      });
    },
  });
}

/**
 * Update work order
 */
export function useUpdateWorkOrder() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationKey: ['work-orders', 'update'],
    mutationFn: ({ id, dto }: { id: string; dto: UpdateWorkOrderDto }) =>
      workOrdersApi.update(id, dto),
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.WORK_ORDERS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.WORK_ORDERS, variables.id] });
      toast({
        title: 'Success',
        description: 'Work order updated successfully',
      });
      router.push('/dashboard/production/work-orders');
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update work order',
        variant: 'destructive',
      });
    },
  });
}

/**
 * Delete work order
 */
export function useDeleteWorkOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['work-orders', 'delete'],
    mutationFn: (id: string) => workOrdersApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.WORK_ORDERS] });
      toast({
        title: 'Success',
        description: 'Work order deleted successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to delete work order',
        variant: 'destructive',
      });
    },
  });
}

/**
 * Start work order production
 */
export function useStartWorkOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['work-orders', 'start'],
    mutationFn: (id: string) => workOrdersApi.start(id),
    onSuccess: (response, id) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.WORK_ORDERS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.WORK_ORDERS, id] });
      toast({
        title: 'Success',
        description: 'Work order started successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to start work order',
        variant: 'destructive',
      });
    },
  });
}

/**
 * Complete work order
 */
export function useCompleteWorkOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['work-orders', 'complete'],
    mutationFn: ({ id, actualQuantity }: { id: string; actualQuantity: number }) =>
      workOrdersApi.complete(id, actualQuantity),
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.WORK_ORDERS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.WORK_ORDERS, variables.id] });
      toast({
        title: 'Success',
        description: 'Work order completed successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to complete work order',
        variant: 'destructive',
      });
    },
  });
}

/**
 * Cancel work order
 */
export function useCancelWorkOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['work-orders', 'cancel'],
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      workOrdersApi.cancel(id, reason),
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.WORK_ORDERS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.WORK_ORDERS, variables.id] });
      toast({
        title: 'Success',
        description: 'Work order cancelled',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to cancel work order',
        variant: 'destructive',
      });
    },
  });
}
