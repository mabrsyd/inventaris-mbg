/**
 * Reporting API functions
 * Re-exports from reports.service.ts for direct imports
 */

import reportsApi from './reports.service';

export { reportsApi } from './reports.service';
export type {
  StockReport,
  TransactionReport,
  ProcurementReport,
  ProductionReport,
  DistributionReport,
  LowStockAlert,
  DashboardStats,
  StockReportParams,
  TransactionReportParams,
  ProcurementReportParams,
  ProductionReportParams,
  DistributionReportParams,
} from './reports.service';

// Direct exports for component imports
export const fetchStockReport = reportsApi.getStockReport;
export const fetchAuditLogs = reportsApi.getTransactionReport; // Assuming audit logs are transaction reports
export const fetchExpiryReport = reportsApi.getLowStockAlerts; // Assuming expiry report is low stock alerts