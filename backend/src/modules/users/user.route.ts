import { Router } from 'express';
import * as userController from './user.controller';
import { createUserValidator, updateUserValidator, approveUserValidator, listUsersValidator } from './user.validator';
import { validate } from '../../app/http/middlewares/validate.middleware';
import { authenticate, authorize } from '../../app/http/middlewares/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Admin only routes
router.post('/', authorize('ADMIN'), createUserValidator, validate, userController.createUser);
router.patch('/:id/approve', authorize('ADMIN'), approveUserValidator, validate, userController.approveUser);
router.delete('/:id', authorize('ADMIN'), userController.deleteUser);

// Admin and self can view
router.get('/', listUsersValidator, validate, userController.getUsers);
router.get('/:id', userController.getUserById);
router.patch('/:id', updateUserValidator, validate, userController.updateUser);

export default router;
