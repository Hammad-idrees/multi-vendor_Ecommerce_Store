import express from 'express';
import { createPaymentIntent, getPaymentConfig } from '../controllers/paymentController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.get('/config', getPaymentConfig);
router.post('/create-intent', protect, createPaymentIntent);

export default router;
