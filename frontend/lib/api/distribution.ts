/**
 * Distribution API functions
 * Re-exports from distribution.service.ts for direct imports
 */

import { beneficiariesApi, deliveryOrdersApi } from './distribution.service';

export {
  beneficiariesApi,
  deliveryOrdersApi,
  type BeneficiariesQueryParams,
  type CreateBeneficiaryDto,
  type UpdateBeneficiaryDto,
  type DeliveryOrdersQueryParams,
  type CreateDeliveryOrderDto,
  type UpdateDeliveryOrderDto,
} from './distribution.service';

// Direct exports for component imports
export const createBeneficiary = beneficiariesApi.create;
export const getBeneficiaryById = beneficiariesApi.getById;

export const createDeliveryOrder = deliveryOrdersApi.create;
export const getDeliveryOrderById = deliveryOrdersApi.getById;