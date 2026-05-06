import express from 'express';
import {
    createCoupon,
    validateCoupon,
    getCoupons,
    updateCoupon,
    deleteCoupon,
} from '../controllers/couponController';
import { protect, seller } from '../middleware/auth';

const router = express.Router();

router.post('/validate', protect, validateCoupon);
router.route('/').get(protect, seller, getCoupons).post(protect, seller, createCoupon);
router.route('/:id').put(protect, seller, updateCoupon).delete(protect, seller, deleteCoupon);

export default router;
