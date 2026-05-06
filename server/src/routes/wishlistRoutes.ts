import express from 'express';
import {
    getWishlist,
    addToWishlist,
    removeFromWishlist,
} from '../controllers/wishlistController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.use(protect);

router.route('/').get(getWishlist).post(addToWishlist);
router.delete('/:productId', removeFromWishlist);

export default router;
