import { Router } from 'express';
import * as itemController from './item.controller';
import { authenticate, authorize } from '../../../app/http/middlewares/auth.middleware';

const router = Router();

router.use(authenticate);

router.post('/', authorize('ADMIN', 'WAREHOUSE_STAFF'), itemController.createItem);
router.get('/', itemController.getItems);
router.get('/:id', itemController.getItemById);
router.get('/:id/stock-summary', itemController.getItemStockSummary);
router.patch('/:id', authorize('ADMIN', 'WAREHOUSE_STAFF'), itemController.updateItem);
router.delete('/:id', authorize('ADMIN'), itemController.deleteItem);

export default router;
