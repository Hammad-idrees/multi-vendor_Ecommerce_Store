import express from 'express';
import {
    createReview,
    getProductReviews,
    updateReview,
    deleteReview,
} from '../controllers/reviewController';
import { protect, admin } from '../middleware/auth';

const router = express.Router();

router.route('/:productId')
    .post(protect, createReview)
    .get(getProductReviews);

router.route('/:reviewId')
    .put(protect, updateReview)
    .delete(protect, deleteReview); // Owner or Admin check handled in controller

export default router;
