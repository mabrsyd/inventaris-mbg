/**
 * API Configuration
 * Centralized configuration for API endpoints and settings
 */

export const API_CONFIG = {
  // HARDCODED for debugging - change back to env var after testing
  BASE_URL: 'http://localhost:3030',
  // BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3030',
  TIMEOUT: 30000,
  
  ENDPOINTS: {
    // Auth
    AUTH: {
      LOGIN: '/api/auth/login',
      REGISTER: '/api/auth/register',
      LOGOUT: '/api/auth/logout',
      REFRESH: '/api/auth/refresh',
      PROFILE: '/api/auth/profile',
    },
    
    // Master Data - FIXED PATHS
    CATEGORIES: '/api/categories',
    LOCATIONS: '/api/locations',
    SUPPLIERS: '/api/suppliers',
    
    // Inventory - FIXED PATHS
    ITEMS: '/api/items',
    STOCK: '/api/stock',
    
    // Procurement - FIXED PATHS
    PURCHASE_ORDERS: '/api/purchase-orders',
    GOODS_RECEIPTS: '/api/goods-receipts',
    
    // Production - FIXED PATHS
    RECIPES: '/api/recipes',
    WORK_ORDERS: '/api/work-orders',
    
    // Distribution - FIXED PATHS
    BENEFICIARIES: '/api/beneficiaries',
    DELIVERY_ORDERS: '/api/delivery-orders',
    
    // Users
    USERS: '/api/users',
    
    // Reporting
    REPORTS: {
      STOCK: '/api/reports/stock',
      EXPIRY: '/api/reports/expiry',
      AUDIT: '/api/reports/audit',
    },
  },
} as const;

export const QUERY_KEYS = {
  // Auth
  PROFILE: ['profile'],
  
  // Master Data
  CATEGORIES: ['categories'],
  CATEGORY: (id: string) => ['categories', id],
  LOCATIONS: ['locations'],
  LOCATION: (id: string) => ['locations', id],
  SUPPLIERS: ['suppliers'],
  SUPPLIER: (id: string) => ['suppliers', id],
  
  // Inventory
  ITEMS: ['items'],
  ITEM: (id: string) => ['items', id],
  ITEM_STOCK: (id: string) => ['items', id, 'stock'],
  STOCK: ['stock'],
  STOCK_BY_LOCATION: (locationId: string) => ['stock', 'location', locationId],
  
  // Procurement
  PURCHASE_ORDERS: ['purchase-orders'],
  PURCHASE_ORDER: (id: string) => ['purchase-orders', id],
  GOODS_RECEIPTS: ['goods-receipts'],
  GOODS_RECEIPT: (id: string) => ['goods-receipts', id],
  
  // Production
  RECIPES: ['recipes'],
  RECIPE: (id: string) => ['recipes', id],
  WORK_ORDERS: ['work-orders'],
  WORK_ORDER: (id: string) => ['work-orders', id],
  
  // Distribution
  BENEFICIARIES: ['beneficiaries'],
  BENEFICIARY: (id: string) => ['beneficiaries', id],
  DELIVERY_ORDERS: ['delivery-orders'],
  DELIVERY_ORDER: (id: string) => ['delivery-orders', id],
  
  // Users
  USERS: ['users'],
  USER: (id: string) => ['users', id],
  
  // Reports
  REPORTS: ['reports'],
  STOCK_REPORT: ['reports', 'stock'],
  EXPIRY_REPORT: ['reports', 'expiry'],
  AUDIT_LOGS: ['reports', 'audit'],
} as const;
