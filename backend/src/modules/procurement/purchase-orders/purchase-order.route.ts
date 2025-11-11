import { Router } from 'express';
import * as poController from './purchase-order.controller';
import { authenticate, authorize } from '../../../app/http/middlewares/auth.middleware';

const router = Router();

router.use(authenticate);

router.post('/', authorize('ADMIN', 'WAREHOUSE_STAFF'), poController.createPO);
router.get('/', poController.getPOs);
router.get('/:id', poController.getPOById);
router.patch('/:id', authorize('ADMIN', 'WAREHOUSE_STAFF'), poController.updatePO);
router.post('/:id/submit', authorize('ADMIN', 'WAREHOUSE_STAFF'), poController.submitForApproval);
router.post('/:id/approve', authorize('ADMIN'), poController.approvePO);
router.post('/:id/confirm', authorize('ADMIN', 'WAREHOUSE_STAFF'), poController.confirmPO);
router.post('/:id/ship', authorize('ADMIN', 'WAREHOUSE_STAFF'), poController.markAsShipped);
router.post('/:id/cancel', authorize('ADMIN'), poController.cancelPO);

export default router;
