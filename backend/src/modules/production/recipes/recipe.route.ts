import { Router } from 'express';
import * as recipeController from './recipe.controller';
import { authenticate, authorize } from '../../../app/http/middlewares/auth.middleware';

const router = Router();

router.use(authenticate);

router.post('/', authorize('ADMIN', 'KITCHEN_STAFF'), recipeController.createRecipe);
router.get('/', recipeController.getRecipes);
router.get('/:id', recipeController.getRecipeById);
router.patch('/:id', authorize('ADMIN', 'KITCHEN_STAFF'), recipeController.updateRecipe);
router.delete('/:id', authorize('ADMIN'), recipeController.deleteRecipe);

export default router;
