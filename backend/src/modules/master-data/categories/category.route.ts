import { Router } from 'express';
import * as categoryController from './category.controller';
import { createCategoryValidator, updateCategoryValidator, listCategoriesValidator } from './category.validator';
import { validate } from '../../../app/http/middlewares/validate.middleware';
import { authenticate, authorize } from '../../../app/http/middlewares/auth.middleware';

const router = Router();

router.use(authenticate);

router.post('/', authorize('ADMIN', 'WAREHOUSE_STAFF'), createCategoryValidator, validate, categoryController.createCategory);
router.get('/', listCategoriesValidator, validate, categoryController.getCategories);
router.get('/:id', categoryController.getCategoryById);
router.patch('/:id', authorize('ADMIN', 'WAREHOUSE_STAFF'), updateCategoryValidator, validate, categoryController.updateCategory);
router.delete('/:id', authorize('ADMIN'), categoryController.deleteCategory);

export default router;
