import { Router } from 'express';
import * as doController from './delivery-order.controller';
import { authenticate, authorize } from '../../../app/http/middlewares/auth.middleware';

const router = Router();

router.use(authenticate);

router.post('/', authorize('ADMIN', 'DISTRIBUTION_STAFF'), doController.createDeliveryOrder);
router.get('/', doController.getDeliveryOrders);
router.get('/:id', doController.getDOById);
router.post('/:id/dispatch', authorize('ADMIN', 'DISTRIBUTION_STAFF'), doController.startDelivery);
router.post('/:id/confirm', authorize('ADMIN', 'DISTRIBUTION_STAFF'), doController.confirmDelivery);
router.post('/:id/cancel', authorize('ADMIN'), doController.cancelDeliveryOrder);

export default router;
