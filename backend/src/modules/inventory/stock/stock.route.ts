import { Router } from 'express';
import * as stockController from './stock.controller';
import { authenticate, authorize } from '../../../app/http/middlewares/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', stockController.getStock);
router.get('/low-stock', stockController.getLowStockItems);
router.get('/expiring', stockController.getExpiringStock);
router.get('/:id', stockController.getStockById);
router.get('/history/:itemId', stockController.getStockHistory);
router.post('/adjust', authorize('ADMIN', 'WAREHOUSE_STAFF'), stockController.adjustStock);

export default router;
