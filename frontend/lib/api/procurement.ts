/**
 * Procurement API functions
 * Re-exports from procurement.service.ts for direct imports
 */

import { purchaseOrdersApi, goodsReceiptsApi } from './procurement.service';

export {
  purchaseOrdersApi,
  goodsReceiptsApi,
  type PurchaseOrdersQueryParams,
  type CreatePurchaseOrderDto,
  type UpdatePurchaseOrderDto,
  type GoodsReceiptsQueryParams,
  type CreateGoodsReceiptDto,
  type UpdateGoodsReceiptDto,
} from './procurement.service';

// Direct exports for component imports
export const createPurchaseOrder = purchaseOrdersApi.create;
export const getPurchaseOrders = purchaseOrdersApi.getAll;
export const getPurchaseOrderById = purchaseOrdersApi.getById;
export const updatePurchaseOrder = purchaseOrdersApi.update;
export const deletePurchaseOrder = purchaseOrdersApi.delete;

export const createGoodsReceipt = goodsReceiptsApi.create;
export const getGoodsReceiptById = goodsReceiptsApi.getById;