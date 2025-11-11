# Mutation Keys yang Perlu Ditambahkan

## use-procurement.ts

- useCreatePurchaseOrder: `['purchase-orders', 'create']`
- useUpdatePurchaseOrder: `['purchase-orders', 'update']`
- useDeletePurchaseOrder: `['purchase-orders', 'delete']`
- useApprovePurchaseOrder: `['purchase-orders', 'approve']`
- useReceivePurchaseOrder: `['purchase-orders', 'receive']`
- useCreateGoodsReceipt: `['goods-receipts', 'create']`
- useUpdateGoodsReceipt: `['goods-receipts', 'update']`
- useDeleteGoodsReceipt: `['goods-receipts', 'delete']`
- useApproveGoodsReceipt: `['goods-receipts', 'approve']`

## use-production.ts

- useCreateRecipe: `['recipes', 'create']`
- useUpdateRecipe: `['recipes', 'update']`
- useDeleteRecipe: `['recipes', 'delete']`
- useCreateWorkOrder: `['work-orders', 'create']`
- useUpdateWorkOrder: `['work-orders', 'update']`
- useDeleteWorkOrder: `['work-orders', 'delete']`
- useStartWorkOrder: `['work-orders', 'start']`
- useCompleteWorkOrder: `['work-orders', 'complete']`
- useCancelWorkOrder: `['work-orders', 'cancel']`
- useRecordProduction: `['work-orders', 'record-production']`

## use-distribution.ts

- useCreateBeneficiary: `['beneficiaries', 'create']`
- useUpdateBeneficiary: `['beneficiaries', 'update']`
- useDeleteBeneficiary: `['beneficiaries', 'delete']`
- useCreateDeliveryOrder: `['delivery-orders', 'create']`
- useUpdateDeliveryOrder: `['delivery-orders', 'update']`
- useDeleteDeliveryOrder: `['delivery-orders', 'delete']`
- useStartDelivery: `['delivery-orders', 'start']`
- useCompleteDelivery: `['delivery-orders', 'complete']`
- useCancelDelivery: `['delivery-orders', 'cancel']`

## use-reports.ts

- useGenerateReport: `['reports', 'generate']`
