import { Router } from 'express';
import * as beneficiaryController from './beneficiary.controller';
import { authenticate, authorize } from '../../../app/http/middlewares/auth.middleware';

const router = Router();

router.use(authenticate);

router.post('/', authorize('ADMIN'), beneficiaryController.createBeneficiary);
router.get('/', beneficiaryController.getBeneficiaries);
router.get('/:id', beneficiaryController.getBeneficiaryById);
router.patch('/:id', authorize('ADMIN'), beneficiaryController.updateBeneficiary);
router.delete('/:id', authorize('ADMIN'), beneficiaryController.deleteBeneficiary);

export default router;
