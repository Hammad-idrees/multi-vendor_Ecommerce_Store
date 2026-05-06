import express from 'express';
import {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    createProductReview,
    getFeaturedProducts,
    getTopProducts,
} from '../controllers/productController';
import { protect, admin } from '../middleware/auth';

const router = express.Router();

router.route('/featured').get(getFeaturedProducts);
router.route('/top').get(getTopProducts);
router.route('/').get(getProducts).post(protect, admin, createProduct);
router.route('/:id/reviews').post(protect, createProductReview);
router
    .route('/:id')
    .get(getProductById)
    .put(protect, admin, updateProduct)
    .delete(protect, admin, deleteProduct);

export default router;
