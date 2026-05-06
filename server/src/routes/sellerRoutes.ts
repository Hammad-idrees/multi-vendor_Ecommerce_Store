import express from 'express';
import {
    getSellerStats,
    getSellerProducts,
    createSellerProduct,
    updateSellerProduct,
    deleteSellerProduct,
    getSellerOrders,
    updateSellerOrderStatus,
} from '../controllers/sellerController';
import { protect, seller } from '../middleware/auth';

const router = express.Router();

router.use(protect);
router.use(seller);

router.get('/stats', getSellerStats);
router.route('/products').get(getSellerProducts).post(createSellerProduct);
router.route('/products/:id').put(updateSellerProduct).delete(deleteSellerProduct);
router.get('/orders', getSellerOrders);
router.put('/orders/:id/status', updateSellerOrderStatus);

export default router;
