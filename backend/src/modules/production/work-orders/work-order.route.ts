import { Router } from 'express';
import * as woController from './work-order.controller';
import { authenticate, authorize } from '../../../app/http/middlewares/auth.middleware';

const router = Router();

router.use(authenticate);

router.post('/', authorize('ADMIN', 'KITCHEN_STAFF'), woController.createWorkOrder);
router.get('/', woController.getWorkOrders);
router.get('/:id', woController.getWOById);
router.post('/:id/start', authorize('ADMIN', 'KITCHEN_STAFF'), woController.startProduction);
router.post('/:id/output', authorize('ADMIN', 'KITCHEN_STAFF'), woController.recordOutput);
router.post('/:id/complete', authorize('ADMIN', 'KITCHEN_STAFF'), woController.completeProduction);
router.post('/:id/cancel', authorize('ADMIN'), woController.cancelWorkOrder);

export default router;
