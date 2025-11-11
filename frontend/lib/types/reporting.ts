/**
 * Reporting type re-exports
 */

export * from './index';

// Tambahan types untuk reporting yang mungkin dibutuhkan
export interface StockReport {
  itemId: string;
  itemName: string;
  itemCode: string;
  totalQuantity: number;
  locationBreakdown: {
    locationId: string;
    locationName: string;
    quantity: number;
  }[];
  reorderPoint?: number;
  needsReorder: boolean;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  action: string;
  entity: string;
  entityId: string;
  changes: any;
}
