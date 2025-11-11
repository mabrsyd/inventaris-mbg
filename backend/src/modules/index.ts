import { Router } from 'express';
import { authRoutes } from './auth';
import { userRoutes } from './users';
import { categoryRoutes, locationRoutes } from './master-data';
import { itemRoutes, stockRoutes } from './inventory';
import { supplierRoutes, purchaseOrderRoutes, goodsReceiptRoutes } from './procurement';
import { recipeRoutes, workOrderRoutes } from './production';
import { beneficiaryRoutes, deliveryOrderRoutes } from './distribution';
import { reportRoutes } from './reporting';

const router = Router();

// Health check
router.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Auth routes
router.use('/auth', authRoutes);

// User management
router.use('/users', userRoutes);

// Master data
router.use('/categories', categoryRoutes);
router.use('/locations', locationRoutes);

// Inventory
router.use('/items', itemRoutes);
router.use('/stock', stockRoutes);

// Procurement
router.use('/suppliers', supplierRoutes);
router.use('/purchase-orders', purchaseOrderRoutes);
router.use('/goods-receipts', goodsReceiptRoutes);

// Production
router.use('/recipes', recipeRoutes);
router.use('/work-orders', workOrderRoutes);

// Distribution
router.use('/beneficiaries', beneficiaryRoutes);
router.use('/delivery-orders', deliveryOrderRoutes);

// Reporting
router.use('/reporting', reportRoutes);

export default router;

