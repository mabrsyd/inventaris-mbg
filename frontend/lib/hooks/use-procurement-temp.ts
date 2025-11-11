/**
 * Procurement Hooks
 * Custom React hooks for Purchase Orders and Goods Receipts
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from './use-toast';
import {
  purchaseOrdersApi,
  goodsReceiptsApi,
  type PurchaseOrdersQueryParams,
  type GoodsReceiptsQueryParams,
  type CreatePurchaseOrderDto,
  type UpdatePurchaseOrderDto,
  type CreateGoodsReceiptDto,
  type UpdateGoodsReceiptDto,
} from '../api/procurement.service';
import { QUERY_KEYS } from '../config/api.config';

// ===========================
// Purchase Orders Hooks
// ===========================

/**
 * Fetch all purchase orders
 */
export function usePurchaseOrders(params?: PurchaseOrdersQueryParams) {
  return useQuery({
    queryKey: [QUERY_KEYS.PURCHASE_ORDERS, params],
    queryFn: () => purchaseOrdersApi.getAll(params),
    staleTime: 1000 * 60, // 1 minute
  });
}

/**
 * Fetch single purchase order by ID
 */
export function usePurchaseOrder(id: string) {
  return useQuery({
    queryKey: [QUERY_KEYS.PURCHASE_ORDERS, id],
    queryFn: () => purchaseOrdersApi.getById(id),
    enabled: !!id,
    staleTime: 1000 * 60, // 1 minute
  });
}

/**
 * Fetch purchase order statistics
 */
export function usePurchaseOrderStats() {
  return useQuery({
    queryKey: [QUERY_KEYS.PURCHASE_ORDERS, 'stats'],
    queryFn: () => purchaseOrdersApi.getStats(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Create new purchase order
 */
export function useCreatePurchaseOrder() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (dto: CreatePurchaseOrderDto) => purchaseOrdersApi.create(dto),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PURCHASE_ORDERS] });
      toast({
        title: 'Success',
        description: 'Purchase order created successfully',
      });
      router.push('/procurement/purchase-orders');
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to create purchase order',
        variant: 'destructive',
      });
    },
  });
}

/**
 * Update purchase order
 */
export function useUpdatePurchaseOrder() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdatePurchaseOrderDto }) =>
      purchaseOrdersApi.update(id, dto),
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PURCHASE_ORDERS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PURCHASE_ORDERS, variables.id] });
      toast({
        title: 'Success',
        description: 'Purchase order updated successfully',
      });
      router.push('/procurement/purchase-orders');
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update purchase order',
        variant: 'destructive',
      });
    },
  });
}

/**
 * Delete purchase order
 */
export function useDeletePurchaseOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => purchaseOrdersApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PURCHASE_ORDERS] });
      toast({
        title: 'Success',
        description: 'Purchase order deleted successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to delete purchase order',
        variant: 'destructive',
      });
    },
  });
}

/**
 * Approve purchase order
 */
export function useApprovePurchaseOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => purchaseOrdersApi.approve(id),
    onSuccess: (response, id) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PURCHASE_ORDERS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PURCHASE_ORDERS, id] });
      toast({
        title: 'Success',
        description: 'Purchase order approved successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to approve purchase order',
        variant: 'destructive',
      });
    },
  });
}

/**
 * Reject purchase order
 */
export function useRejectPurchaseOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      purchaseOrdersApi.reject(id, reason),
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PURCHASE_ORDERS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PURCHASE_ORDERS, variables.id] });
      toast({
        title: 'Success',
        description: 'Purchase order rejected',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to reject purchase order',
        variant: 'destructive',
      });
    },
  });
}

// ===========================
// Goods Receipts Hooks
// ===========================

/**
 * Fetch all goods receipts
 */
export function useGoodsReceipts(params?: GoodsReceiptsQueryParams) {
  return useQuery({
    queryKey: [QUERY_KEYS.GOODS_RECEIPTS, params],
    queryFn: () => goodsReceiptsApi.getAll(params),
    staleTime: 1000 * 60, // 1 minute
  });
}

/**
 * Fetch single goods receipt by ID
 */
export function useGoodsReceipt(id: string) {
  return useQuery({
    queryKey: [QUERY_KEYS.GOODS_RECEIPTS, id],
    queryFn: () => goodsReceiptsApi.getById(id),
    enabled: !!id,
    staleTime: 1000 * 60, // 1 minute
  });
}

/**
 * Create new goods receipt
 */
export function useCreateGoodsReceipt() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (dto: CreateGoodsReceiptDto) => goodsReceiptsApi.create(dto),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GOODS_RECEIPTS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PURCHASE_ORDERS] });
      toast({
        title: 'Success',
        description: 'Goods receipt created successfully',
      });
      router.push('/procurement/goods-receipts');
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to create goods receipt',
        variant: 'destructive',
      });
    },
  });
}

/**
 * Update goods receipt
 */
export function useUpdateGoodsReceipt() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateGoodsReceiptDto }) =>
      goodsReceiptsApi.update(id, dto),
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GOODS_RECEIPTS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GOODS_RECEIPTS, variables.id] });
      toast({
        title: 'Success',
        description: 'Goods receipt updated successfully',
      });
      router.push('/procurement/goods-receipts');
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update goods receipt',
        variant: 'destructive',
      });
    },
  });
}

/**
 * Delete goods receipt
 */
export function useDeleteGoodsReceipt() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => goodsReceiptsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GOODS_RECEIPTS] });
      toast({
        title: 'Success',
        description: 'Goods receipt deleted successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to delete goods receipt',
        variant: 'destructive',
      });
    },
  });
}

/**
 * Update QC status for goods receipt item
 */
export function useUpdateQcStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      itemId,
      qcStatus,
      qcNotes,
    }: {
      id: string;
      itemId: string;
      qcStatus: 'PASSED' | 'FAILED' | 'PENDING';
      qcNotes?: string;
    }) => goodsReceiptsApi.updateQcStatus(id, itemId, qcStatus, qcNotes),
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GOODS_RECEIPTS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GOODS_RECEIPTS, variables.id] });
      toast({
        title: 'Success',
        description: 'QC status updated successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update QC status',
        variant: 'destructive',
      });
    },
  });
}
