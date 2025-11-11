/**
 * Distribution Hooks
 * Custom React hooks for Beneficiaries and Delivery Orders
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from './use-toast';
import {
  beneficiariesApi,
  deliveryOrdersApi,
  type BeneficiariesQueryParams,
  type DeliveryOrdersQueryParams,
  type CreateBeneficiaryDto,
  type UpdateBeneficiaryDto,
  type CreateDeliveryOrderDto,
  type UpdateDeliveryOrderDto,
} from '../api/distribution.service';
import { QUERY_KEYS } from '../config/api.config';

// ===========================
// Beneficiaries Hooks
// ===========================

/**
 * Fetch all beneficiaries
 */
export function useBeneficiaries(params?: BeneficiariesQueryParams) {
  return useQuery({
    queryKey: [QUERY_KEYS.BENEFICIARIES, params],
    queryFn: () => beneficiariesApi.getAll(params),
    staleTime: 1000 * 60, // 1 minute
  });
}

/**
 * Fetch single beneficiary by ID
 */
export function useBeneficiary(id: string) {
  return useQuery({
    queryKey: [QUERY_KEYS.BENEFICIARIES, id],
    queryFn: () => beneficiariesApi.getById(id),
    enabled: !!id,
    staleTime: 1000 * 60, // 1 minute
  });
}

/**
 * Create new beneficiary
 */
export function useCreateBeneficiary() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationKey: ['beneficiaries', 'create'],
    mutationFn: (dto: CreateBeneficiaryDto) => beneficiariesApi.create(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.BENEFICIARIES] });
      toast({
        title: 'Success',
        description: 'Beneficiary created successfully',
      });
      router.push('/dashboard/distribution/beneficiaries');
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to create beneficiary',
        variant: 'destructive',
      });
    },
  });
}

/**
 * Update beneficiary
 */
export function useUpdateBeneficiary() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationKey: ['beneficiaries', 'update'],
    mutationFn: ({ id, dto }: { id: string; dto: UpdateBeneficiaryDto }) =>
      beneficiariesApi.update(id, dto),
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.BENEFICIARIES] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.BENEFICIARIES, variables.id] });
      toast({
        title: 'Success',
        description: 'Beneficiary updated successfully',
      });
      router.push('/dashboard/distribution/beneficiaries');
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update beneficiary',
        variant: 'destructive',
      });
    },
  });
}

/**
 * Delete beneficiary
 */
export function useDeleteBeneficiary() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['beneficiaries', 'delete'],
    mutationFn: (id: string) => beneficiariesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.BENEFICIARIES] });
      toast({
        title: 'Success',
        description: 'Beneficiary deleted successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to delete beneficiary',
        variant: 'destructive',
      });
    },
  });
}

// ===========================
// Delivery Orders Hooks
// ===========================

/**
 * Fetch all delivery orders
 */
export function useDeliveryOrders(params?: DeliveryOrdersQueryParams) {
  return useQuery({
    queryKey: [QUERY_KEYS.DELIVERY_ORDERS, params],
    queryFn: () => deliveryOrdersApi.getAll(params),
    staleTime: 1000 * 60, // 1 minute
  });
}

/**
 * Fetch single delivery order by ID
 */
export function useDeliveryOrder(id: string) {
  return useQuery({
    queryKey: [QUERY_KEYS.DELIVERY_ORDERS, id],
    queryFn: () => deliveryOrdersApi.getById(id),
    enabled: !!id,
    staleTime: 1000 * 60, // 1 minute
  });
}

/**
 * Fetch delivery order statistics
 */
export function useDeliveryOrderStats() {
  return useQuery({
    queryKey: [QUERY_KEYS.DELIVERY_ORDERS, 'stats'],
    queryFn: () => deliveryOrdersApi.getStats(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Create new delivery order
 */
export function useCreateDeliveryOrder() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationKey: ['delivery-orders', 'create'],
    mutationFn: (dto: CreateDeliveryOrderDto) => deliveryOrdersApi.create(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.DELIVERY_ORDERS] });
      toast({
        title: 'Success',
        description: 'Delivery order created successfully',
      });
      router.push('/dashboard/distribution/delivery-orders');
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to create delivery order',
        variant: 'destructive',
      });
    },
  });
}

/**
 * Update delivery order
 */
export function useUpdateDeliveryOrder() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationKey: ['delivery-orders', 'update'],
    mutationFn: ({ id, dto }: { id: string; dto: UpdateDeliveryOrderDto }) =>
      deliveryOrdersApi.update(id, dto),
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.DELIVERY_ORDERS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.DELIVERY_ORDERS, variables.id] });
      toast({
        title: 'Success',
        description: 'Delivery order updated successfully',
      });
      router.push('/dashboard/distribution/delivery-orders');
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update delivery order',
        variant: 'destructive',
      });
    },
  });
}

/**
 * Delete delivery order
 */
export function useDeleteDeliveryOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['delivery-orders', 'delete'],
    mutationFn: (id: string) => deliveryOrdersApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.DELIVERY_ORDERS] });
      toast({
        title: 'Success',
        description: 'Delivery order deleted successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to delete delivery order',
        variant: 'destructive',
      });
    },
  });
}

/**
 * Dispatch delivery order
 */
export function useDispatchDeliveryOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['delivery-orders', 'dispatch'],
    mutationFn: (id: string) => deliveryOrdersApi.dispatch(id),
    onSuccess: (response, id) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.DELIVERY_ORDERS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.DELIVERY_ORDERS, id] });
      toast({
        title: 'Success',
        description: 'Delivery order dispatched successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to dispatch delivery order',
        variant: 'destructive',
      });
    },
  });
}

/**
 * Complete delivery
 */
export function useCompleteDeliveryOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['delivery-orders', 'complete'],
    mutationFn: (id: string) => deliveryOrdersApi.complete(id),
    onSuccess: (response, id) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.DELIVERY_ORDERS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.DELIVERY_ORDERS, id] });
      toast({
        title: 'Success',
        description: 'Delivery completed successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to complete delivery',
        variant: 'destructive',
      });
    },
  });
}

/**
 * Cancel delivery order
 */
export function useCancelDeliveryOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['delivery-orders', 'cancel'],
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      deliveryOrdersApi.cancel(id, reason),
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.DELIVERY_ORDERS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.DELIVERY_ORDERS, variables.id] });
      toast({
        title: 'Success',
        description: 'Delivery order cancelled',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to cancel delivery order',
        variant: 'destructive',
      });
    },
  });
}
