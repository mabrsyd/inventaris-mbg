/**
 * Master Data Hooks
 * Custom hooks for categories, locations, and suppliers
 */

'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { categoriesApi, locationsApi, suppliersApi } from '@/lib/api/master-data.service';
import { QUERY_KEYS } from '@/lib/config/api.config';
import { Category, Location, Supplier, PaginationParams } from '@/lib/types';
import { useToast } from '@/lib/hooks/use-toast';
import { handleApiError } from '@/lib/api/client';

// ============================================
// CATEGORIES HOOKS
// ============================================

export const useCategories = (params?: PaginationParams) => {
  return useQuery({
    queryKey: [...QUERY_KEYS.CATEGORIES, params],
    queryFn: () => categoriesApi.getCategories(params),
    staleTime: 5 * 60 * 1000,
  });
};

export const useCategory = (id: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.CATEGORY(id),
    queryFn: () => categoriesApi.getCategoryById(id),
    enabled: !!id,
  });
};

export const useCreateCategory = () => {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { toast } = useToast();

  return useMutation({
    mutationKey: ['categories', 'create'],
    mutationFn: (data: Partial<Category>) => categoriesApi.createCategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CATEGORIES });
      toast({ title: 'Berhasil', description: 'Kategori berhasil ditambahkan' });
      router.push('/dashboard/master-data/categories');
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

export const useUpdateCategory = (id: string) => {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { toast } = useToast();

  return useMutation({
    mutationKey: ['categories', 'update', id],
    mutationFn: (data: Partial<Category>) => categoriesApi.updateCategory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CATEGORIES });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CATEGORY(id) });
      toast({ title: 'Berhasil', description: 'Kategori berhasil diperbarui' });
      router.push('/dashboard/master-data/categories');
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

export const useDeleteCategory = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationKey: ['categories', 'delete'],
    mutationFn: (id: string) => categoriesApi.deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CATEGORIES });
      toast({ title: 'Berhasil', description: 'Kategori berhasil dihapus' });
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

// ============================================
// LOCATIONS HOOKS
// ============================================

export const useLocations = (params?: PaginationParams) => {
  return useQuery({
    queryKey: [...QUERY_KEYS.LOCATIONS, params],
    queryFn: () => locationsApi.getLocations(params),
    staleTime: 5 * 60 * 1000,
  });
};

export const useLocation = (id: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.LOCATION(id),
    queryFn: () => locationsApi.getLocationById(id),
    enabled: !!id,
  });
};

export const useCreateLocation = () => {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { toast } = useToast();

  return useMutation({
    mutationKey: ['locations', 'create'],
    mutationFn: (data: Partial<Location>) => locationsApi.createLocation(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.LOCATIONS });
      toast({ title: 'Berhasil', description: 'Lokasi berhasil ditambahkan' });
      router.push('/dashboard/master-data/locations');
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

export const useUpdateLocation = (id: string) => {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { toast } = useToast();

  return useMutation({
    mutationKey: ['locations', 'update', id],
    mutationFn: (data: Partial<Location>) => locationsApi.updateLocation(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.LOCATIONS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.LOCATION(id) });
      toast({ title: 'Berhasil', description: 'Lokasi berhasil diperbarui' });
      router.push('/dashboard/master-data/locations');
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

export const useDeleteLocation = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationKey: ['locations', 'delete'],
    mutationFn: (id: string) => locationsApi.deleteLocation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.LOCATIONS });
      toast({ title: 'Berhasil', description: 'Lokasi berhasil dihapus' });
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

// ============================================
// SUPPLIERS HOOKS
// ============================================

export const useSuppliers = (params?: PaginationParams) => {
  return useQuery({
    queryKey: [...QUERY_KEYS.SUPPLIERS, params],
    queryFn: () => suppliersApi.getSuppliers(params),
    staleTime: 5 * 60 * 1000,
  });
};

export const useSupplier = (id: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.SUPPLIER(id),
    queryFn: () => suppliersApi.getSupplierById(id),
    enabled: !!id,
  });
};

export const useCreateSupplier = () => {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { toast } = useToast();

  return useMutation({
    mutationKey: ['suppliers', 'create'],
    mutationFn: (data: Partial<Supplier>) => suppliersApi.createSupplier(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SUPPLIERS });
      toast({ title: 'Berhasil', description: 'Supplier berhasil ditambahkan' });
      router.push('/dashboard/master-data/suppliers');
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

export const useUpdateSupplier = (id: string) => {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { toast } = useToast();

  return useMutation({
    mutationKey: ['suppliers', 'update', id],
    mutationFn: (data: Partial<Supplier>) => suppliersApi.updateSupplier(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SUPPLIERS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SUPPLIER(id) });
      toast({ title: 'Berhasil', description: 'Supplier berhasil diperbarui' });
      router.push('/dashboard/master-data/suppliers');
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

export const useDeleteSupplier = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationKey: ['suppliers', 'delete'],
    mutationFn: (id: string) => suppliersApi.deleteSupplier(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SUPPLIERS });
      toast({ title: 'Berhasil', description: 'Supplier berhasil dihapus' });
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
