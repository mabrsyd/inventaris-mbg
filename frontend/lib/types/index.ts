/**
 * Type Definitions
 * Mirrors backend Prisma schema and API responses
 */

// ============================================
// ENUMS (from backend)
// ============================================

export enum UserRole {
  ADMIN = 'ADMIN',
  WAREHOUSE_STAFF = 'WAREHOUSE_STAFF',
  KITCHEN_STAFF = 'KITCHEN_STAFF',
  DISTRIBUTION_STAFF = 'DISTRIBUTION_STAFF',
  BENEFICIARY_POINT = 'BENEFICIARY_POINT',
}

export enum ItemType {
  RAW_MATERIAL = 'RAW_MATERIAL',
  SEMI_FINISHED = 'SEMI_FINISHED',
  FINISHED_GOOD = 'FINISHED_GOOD',
}

export enum ItemUnit {
  KG = 'KG',
  GR = 'GR',
  LITER = 'LITER',
  ML = 'ML',
  PACK = 'PACK',
  PCS = 'PCS',
}

export enum LocationType {
  CENTRAL_WAREHOUSE = 'CENTRAL_WAREHOUSE',
  REGIONAL_WAREHOUSE = 'REGIONAL_WAREHOUSE',
  KITCHEN = 'KITCHEN',
  DISTRIBUTION_POINT = 'DISTRIBUTION_POINT',
}

export enum POStatus {
  DRAFT = 'DRAFT',
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  APPROVED = 'APPROVED',
  CONFIRMED = 'CONFIRMED',
  SHIPPED = 'SHIPPED',
  RECEIVED = 'RECEIVED',
  CANCELLED = 'CANCELLED',
}

export enum WorkOrderStatus {
  PLANNED = 'PLANNED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum DeliveryOrderStatus {
  PENDING = 'PENDING',
  IN_TRANSIT = 'IN_TRANSIT',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
}

// ============================================
// API RESPONSE TYPES
// ============================================

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
}

export interface PaginatedResponse<T = any> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiError {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
}

// ============================================
// AUTH TYPES
// ============================================

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  locationId?: string;
  location?: Location;
  isActive: boolean;
  isApproved: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  fullName: string;
  role?: UserRole;
  locationId?: string;
}

export interface LoginResponse extends AuthTokens {
  user: User;
}

// ============================================
// MASTER DATA TYPES
// ============================================

export interface Category {
  id: string;
  code: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Location {
  id: string;
  code: string;
  name: string;
  type: LocationType;
  address?: string;
  latitude?: number;
  longitude?: number;
  capacityKg?: number;
  currentLoadKg?: number;
  phone?: string;
  managerName?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Supplier {
  id: string;
  code?: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  verified: boolean;
  rating: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// INVENTORY TYPES
// ============================================

export interface Item {
  id: string;
  sku: string;
  code?: string;
  name: string;
  description?: string;
  itemType: ItemType;
  unit: ItemUnit;
  categoryId?: string;
  category?: Category;
  price: number;
  reorderPoint: number;
  shelfLifeDays?: number;
  requiresColdStorage: boolean;
  isConsumable: boolean;
  nutritionalInfo?: any;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  // Relations
  stock?: Stock[];
  _count?: {
    stock?: number;
    poItems?: number;
    grItems?: number;
    doItems?: number;
  };
}

export interface Stock {
  id: string;
  itemId: string;
  item?: Item;
  locationId: string;
  location?: Location;
  quantity: number;
  reservedQuantity: number;
  availableQuantity: number;
  batchNumber?: string;
  expiryDate?: string;
  storageLocation?: string;
  isLocked?: boolean;
  lastRestockedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// PROCUREMENT TYPES
// ============================================

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  supplierId: string;
  supplier?: Supplier;
  destinationLocationId: string;
  destinationLocation?: Location;
  documentDate: string;
  expectedDeliveryDate?: string;
  status: POStatus;
  totalAmount?: number;
  notes?: string;
  createdById: string;
  approvedById?: string;
  approvedAt?: string;
  items?: POItem[];
  createdAt: string;
  updatedAt: string;
}

export interface POItem {
  id: string;
  purchaseOrderId: string;
  itemId: string;
  item?: Item;
  quantity: number;
  unitPrice?: number;
  totalPrice?: number;
  receivedQuantity: number;
}

export interface GoodsReceipt {
  id: string;
  receiptNumber: string;
  purchaseOrderId?: string;
  purchaseOrder?: PurchaseOrder;
  locationId: string;
  location?: Location;
  receivedDate: string;
  receivedById: string;
  qcStatus: 'PENDING' | 'PASSED' | 'FAILED';
  qcNotes?: string;
  qcById?: string;
  qcDate?: string;
  referenceDocument?: string;
  items?: GRItem[];
  createdAt: string;
  updatedAt: string;
}

export interface GRItem {
  id: string;
  goodsReceiptId: string;
  itemId: string;
  item?: Item;
  quantity: number;
  batchNumber?: string;
  expiryDate?: string;
}

// ============================================
// PRODUCTION TYPES
// ============================================

export interface Recipe {
  id: string;
  code?: string;
  name: string;
  description?: string;
  portionSize: number;
  totalCost?: number;
  costPerPortion?: number;
  nutritionalInfo?: any;
  preparationTime?: number;
  cookingTime?: number;
  instructions?: string;
  isActive: boolean;
  items?: RecipeItem[];
  createdAt: string;
  updatedAt: string;
}

export interface RecipeItem {
  id: string;
  recipeId: string;
  itemId: string;
  item?: Item;
  quantity: number;
  unit: ItemUnit;
  cost?: number;
}

export interface WorkOrder {
  id: string;
  woNumber: string;
  recipeId: string;
  recipe?: Recipe;
  kitchenLocationId: string;
  kitchenLocation?: Location;
  plannedQuantity: number;
  actualQuantity?: number;
  plannedPortions?: number;
  actualPortions?: number;
  totalCost?: number;
  status: WorkOrderStatus;
  scheduledDate?: string;
  startDate?: string;
  completionDate?: string;
  notes?: string;
  createdById: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// DISTRIBUTION TYPES
// ============================================

export interface Beneficiary {
  id: string;
  code?: string;
  name: string;
  type: string;
  contactPerson?: string;
  phone?: string;
  address?: string;
  targetQuota?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DeliveryOrder {
  id: string;
  doNumber: string;
  sourceLocationId: string;
  sourceLocation?: Location;
  destinationLocationId: string;
  destinationLocation?: Location;
  beneficiaryId?: string;
  beneficiary?: Beneficiary;
  workOrderId?: string;
  workOrder?: WorkOrder;
  scheduledDeliveryDate?: string;
  actualDeliveryDate?: string;
  status: DeliveryOrderStatus;
  confirmationBy?: string;
  confirmationDate?: string;
  transportInfo?: any;
  referenceDocument?: string;
  createdById: string;
  notes?: string;
  items?: DOItem[];
  createdAt: string;
  updatedAt: string;
}

export interface DOItem {
  id: string;
  deliveryOrderId: string;
  itemId: string;
  item?: Item;
  quantity: number;
  batchNumber?: string;
}

// ============================================
// QUERY PARAMS
// ============================================

export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ItemsQueryParams extends PaginationParams {
  itemType?: ItemType;
  categoryId?: string;
  isActive?: boolean;
}

export interface StockQueryParams extends PaginationParams {
  locationId?: string;
  itemId?: string;
  belowReorder?: boolean;
}
