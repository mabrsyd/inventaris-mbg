import { Router } from 'express';
import * as grController from './goods-receipt.controller';
import { authenticate, authorize } from '../../../app/http/middlewares/auth.middleware';

const router = Router();

router.use(authenticate);

router.post('/', authorize('ADMIN', 'WAREHOUSE_STAFF'), grController.createGoodsReceipt);
router.get('/', grController.getGoodsReceipts);
router.get('/:id', grController.getGRById);
router.post('/:id/qc', authorize('ADMIN', 'WAREHOUSE_STAFF'), grController.performQC);
router.patch('/:id/qc', authorize('ADMIN', 'WAREHOUSE_STAFF'), grController.updateQCStatus);

export default router;
