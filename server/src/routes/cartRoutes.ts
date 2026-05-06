import express from 'express';
import { getCart, addToCart, removeFromCart, clearCart, updateCartItem, updateAllCartItems } from '../controllers/cartController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.route('/').get(protect, getCart).post(protect, addToCart).delete(protect, clearCart).put(protect, updateAllCartItems);
router.route('/:itemId').delete(protect, removeFromCart).put(protect, updateCartItem);

export default router;
