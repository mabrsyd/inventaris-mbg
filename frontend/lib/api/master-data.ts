/**
 * Master Data API functions
 * Re-exports from master-data.service.ts for direct imports
 */

import { categoriesApi, locationsApi, suppliersApi } from './master-data.service';

export { categoriesApi, locationsApi, suppliersApi } from './master-data.service';

// Direct exports for component imports
export const createCategory = categoriesApi.createCategory;
export const getCategoryById = categoriesApi.getCategoryById;

export const createLocation = locationsApi.createLocation;
export const getLocationById = locationsApi.getLocationById;

export const createSupplier = suppliersApi.createSupplier;
export const getSupplierById = suppliersApi.getSupplierById;