/**
 * Inventory type re-exports
 */

import type { Stock as StockType } from './index';

export * from './index';

export type {
  Item,
  ItemType,
  ItemUnit
} from './index';

// Stock type re-export
export type Stock = StockType;

// StockItem alias untuk backward compatibility
export type StockItem = StockType;
