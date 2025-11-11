import { Router } from 'express';
import * as supplierController from './supplier.controller';
import { 
  createSupplierValidator, 
  updateSupplierValidator, 
  verifySupplierValidator,
  updateRatingValidator,
  listSuppliersValidator 
} from './supplier.validator';
import { validate } from '../../../app/http/middlewares/validate.middleware';
import { authenticate, authorize } from '../../../app/http/middlewares/auth.middleware';

const router = Router();

router.use(authenticate);

router.post('/', authorize('ADMIN', 'WAREHOUSE_STAFF'), createSupplierValidator, validate, supplierController.createSupplier);
router.get('/', listSuppliersValidator, validate, supplierController.getSuppliers);
router.get('/:id', supplierController.getSupplierById);
router.patch('/:id', authorize('ADMIN', 'WAREHOUSE_STAFF'), updateSupplierValidator, validate, supplierController.updateSupplier);
router.patch('/:id/verify', authorize('ADMIN'), verifySupplierValidator, validate, supplierController.verifySupplier);
router.patch('/:id/rating', authorize('ADMIN', 'WAREHOUSE_STAFF'), updateRatingValidator, validate, supplierController.updateSupplierRating);
router.delete('/:id', authorize('ADMIN'), supplierController.deleteSupplier);

export default router;
