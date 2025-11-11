import { Router } from 'express';
import * as locationController from './location.controller';
import { authenticate, authorize } from '../../../app/http/middlewares/auth.middleware';

const router = Router();

router.use(authenticate);

router.post('/', authorize('ADMIN', 'WAREHOUSE_STAFF'), locationController.createLocation);
router.get('/', locationController.getLocations);
router.get('/:id', locationController.getLocationById);
router.patch('/:id', authorize('ADMIN', 'WAREHOUSE_STAFF'), locationController.updateLocation);
router.delete('/:id', authorize('ADMIN'), locationController.deleteLocation);

export default router;
