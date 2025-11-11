/**
 * Items Hooks
 * Custom hooks for items data fetching and mutations
 */

'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { itemsApi } from '@/lib/api/items.service';
import { QUERY_KEYS } from '@/lib/config/api.config';
import { Item, ItemsQueryParams } from '@/lib/types';
import { useToast } from '@/lib/hooks/use-toast';
import { handleApiError } from '@/lib/api/client';

/**
 * Hook to fetch paginated items list
 */
export const useItems = (params?: ItemsQueryParams) => {
  return useQuery({
    queryKey: [...QUERY_KEYS.ITEMS, params],
    queryFn: () => itemsApi.getItems(params),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

/**
 * Hook to fetch single item by ID
 */
export const useItem = (id: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.ITEM(id),
    queryFn: () => itemsApi.getItemById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Hook to fetch item stock summary
 */
export const useItemStockSummary = (id: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.ITEM_STOCK(id),
    queryFn: () => itemsApi.getItemStockSummary(id),
    enabled: !!id,
    staleTime: 1 * 60 * 1000, // 1 minute
  });
};

/**
 * Hook to create new item
 */
export const useCreateItem = () => {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { toast } = useToast();

  return useMutation({
    mutationKey: ['items', 'create'],
    mutationFn: (data: Partial<Item>) => itemsApi.createItem(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ITEMS });
      toast({
        title: 'Berhasil',
        description: 'Item berhasil ditambahkan',
      });
      router.push('/dashboard/inventory/items');
    },
    onError: (error) => {
      toast({
        title: 'Gagal',
        description: handleApiError(error),
        variant: 'destructive',
      });
    },
  });
};

/**
 * Hook to update existing item
 */
export const useUpdateItem = (id: string) => {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { toast } = useToast();

  return useMutation({
    mutationKey: ['items', 'update', id],
    mutationFn: (data: Partial<Item>) => itemsApi.updateItem(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ITEMS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ITEM(id) });
      toast({
        title: 'Berhasil',
        description: 'Item berhasil diperbarui',
      });
      router.push('/dashboard/inventory/items');
    },
    onError: (error) => {
      toast({
        title: 'Gagal',
        description: handleApiError(error),
        variant: 'destructive',
      });
    },
  });
};

/**
 * Hook to delete item
 */
export const useDeleteItem = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationKey: ['items', 'delete'],
    mutationFn: (id: string) => itemsApi.deleteItem(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ITEMS });
      toast({
        title: 'Berhasil',
        description: 'Item berhasil dihapus',
      });
    },
    onError: (error) => {
      toast({
        title: 'Gagal',
        description: handleApiError(error),
        variant: 'destructive',
      });
    },
  });
};
