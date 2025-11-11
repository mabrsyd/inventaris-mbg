import { Request, Response, NextFunction } from 'express';
import { ReportService } from './report.service';
import { sendSuccessResponse } from '../../app/utils/response';

export class ReportController {
  private reportService: ReportService;

  constructor() {
    this.reportService = new ReportService();
  }

  /**
   * Get comprehensive dashboard statistics
   */
  getDashboardStats = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const stats = await this.reportService.getDashboardStats();
      return sendSuccessResponse(res, stats, 'Dashboard statistics retrieved successfully');
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get low stock alerts
   */
  getLowStockAlerts = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const alerts = await this.reportService.getLowStockAlerts();
      return sendSuccessResponse(res, alerts, 'Low stock alerts retrieved successfully');
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get stock report with filters
   */
  getStockReport = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { locationId, categoryId, lowStockOnly } = req.query;
      const report = await this.reportService.getStockReport({
        locationId: locationId as string,
        categoryId: categoryId as string,
        lowStockOnly: lowStockOnly === 'true',
      });
      return sendSuccessResponse(res, report, 'Stock report retrieved successfully');
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get transaction history report
   */
  getTransactionReport = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { startDate, endDate, type, itemId, locationId } = req.query;
      
      if (!startDate || !endDate) {
        return res.status(400).json({
          success: false,
          message: 'startDate and endDate are required',
        });
      }

      const report = await this.reportService.getTransactionReport({
        startDate: new Date(startDate as string),
        endDate: new Date(endDate as string),
        type: type as string,
        itemId: itemId as string,
        locationId: locationId as string,
      });
      return sendSuccessResponse(res, report, 'Transaction report retrieved successfully');
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get procurement report
   */
  getProcurementReport = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { startDate, endDate, supplierId } = req.query;
      
      if (!startDate || !endDate) {
        return res.status(400).json({
          success: false,
          message: 'startDate and endDate are required',
        });
      }

      const report = await this.reportService.getProcurementReport({
        startDate: new Date(startDate as string),
        endDate: new Date(endDate as string),
        supplierId: supplierId as string,
      });
      return sendSuccessResponse(res, report, 'Procurement report retrieved successfully');
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get production report
   */
  getProductionReport = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { startDate, endDate, recipeId } = req.query;
      
      if (!startDate || !endDate) {
        return res.status(400).json({
          success: false,
          message: 'startDate and endDate are required',
        });
      }

      const report = await this.reportService.getProductionReport({
        startDate: new Date(startDate as string),
        endDate: new Date(endDate as string),
        recipeId: recipeId as string,
      });
      return sendSuccessResponse(res, report, 'Production report retrieved successfully');
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get distribution report
   */
  getDistributionReport = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { startDate, endDate, beneficiaryId } = req.query;
      
      if (!startDate || !endDate) {
        return res.status(400).json({
          success: false,
          message: 'startDate and endDate are required',
        });
      }

      const report = await this.reportService.getDistributionReport({
        startDate: new Date(startDate as string),
        endDate: new Date(endDate as string),
        beneficiaryId: beneficiaryId as string,
      });
      return sendSuccessResponse(res, report, 'Distribution report retrieved successfully');
    } catch (error) {
      next(error);
    }
  };

  /**
   * Export report to CSV
   */
  exportReport = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { reportType } = req.params;
      const queryParams = req.query;

      const csvData = await this.reportService.exportReportToCSV(reportType, queryParams);
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${reportType}-report-${new Date().toISOString()}.csv"`);
      
      return res.send(csvData);
    } catch (error) {
      next(error);
    }
  };
}

export const reportController = new ReportController();
