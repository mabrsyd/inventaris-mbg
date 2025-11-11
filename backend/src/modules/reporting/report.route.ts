import { Router } from 'express';
import { authenticate } from '../../app/http/middlewares/auth.middleware';
import { ReportController } from './report.controller';

const router = Router();
const reportController = new ReportController();

// All routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/reporting/dashboard
 * @desc    Get dashboard statistics
 * @access  Private
 */
router.get('/dashboard', reportController.getDashboardStats);

/**
 * @route   GET /api/reporting/alerts/low-stock
 * @desc    Get low stock alerts
 * @access  Private
 */
router.get('/alerts/low-stock', reportController.getLowStockAlerts);

/**
 * @route   GET /api/reporting/stock
 * @desc    Get stock report
 * @access  Private
 * @query   startDate, endDate, categoryId, locationId
 */
router.get('/stock', reportController.getStockReport);

/**
 * @route   GET /api/reporting/transactions
 * @desc    Get transaction report
 * @access  Private
 * @query   startDate, endDate, type, itemId, locationId
 */
router.get('/transactions', reportController.getTransactionReport);

/**
 * @route   GET /api/reporting/procurement
 * @desc    Get procurement report
 * @access  Private
 * @query   startDate, endDate, supplierId
 */
router.get('/procurement', reportController.getProcurementReport);

/**
 * @route   GET /api/reporting/production
 * @desc    Get production report
 * @access  Private
 * @query   startDate, endDate, recipeId
 */
router.get('/production', reportController.getProductionReport);

/**
 * @route   GET /api/reporting/distribution
 * @desc    Get distribution report
 * @access  Private
 * @query   startDate, endDate, beneficiaryId
 */
router.get('/distribution', reportController.getDistributionReport);

export default router;
