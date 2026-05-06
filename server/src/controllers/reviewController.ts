import { Request, Response } from 'express';
import Review from '../models/Review';
import Product from '../models/Product';
import { AuthRequest } from '../middleware/auth';

// @desc    Create new review
// @route   POST /api/reviews/:productId
// @access  Private
export const createReview = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { rating, comment } = req.body;
        const productId = req.params.productId;
        const userId = req.user?._id;

        const product = await Product.findById(productId);

        if (!product) {
            res.status(404).json({ message: 'Product not found' });
            return;
        }

        const alreadyReviewed = await Review.findOne({
            user: userId,
            product: productId,
        });

        if (alreadyReviewed) {
            res.status(400).json({ message: 'Product already reviewed' });
            return;
        }

        const review = await Review.create({
            user: userId,
            product: productId,
            rating: Number(rating),
            comment,
        });

        // Update product rating and numReviews
        const reviews = await Review.find({ product: productId });
        product.numReviews = reviews.length;
        product.averageRating =
            reviews.reduce((acc, item) => item.rating + acc, 0) / reviews.length;

        await product.save();

        res.status(201).json(review);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get reviews for a product
// @route   GET /api/reviews/:productId
// @access  Public
export const getProductReviews = async (req: Request, res: Response): Promise<void> => {
    try {
        const reviews = await Review.find({ product: req.params.productId })
            .populate('user', 'name')
            .sort({ createdAt: -1 });

        res.json(reviews);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Update a review
// @route   PUT /api/reviews/:reviewId
// @access  Private
export const updateReview = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { rating, comment } = req.body;
        const review = await Review.findById(req.params.reviewId);

        if (!review) {
            res.status(404).json({ message: 'Review not found' });
            return;
        }

        // Verify user owns the review
        if (review.user.toString() !== req.user?._id.toString()) {
            res.status(401).json({ message: 'Not authorized' });
            return;
        }

        review.rating = Number(rating) || review.rating;
        review.comment = comment || review.comment;
        await review.save();

        // Recalculate product rating
        const productId = review.product;
        const product = await Product.findById(productId);
        if (product) {
            const reviews = await Review.find({ product: productId });
            product.averageRating =
                reviews.reduce((acc, item) => item.rating + acc, 0) / reviews.length;
            await product.save();
        }

        res.json(review);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Delete a review
// @route   DELETE /api/reviews/:reviewId
// @access  Private/Admin or Owner
export const deleteReview = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const review = await Review.findById(req.params.reviewId);

        if (!review) {
            res.status(404).json({ message: 'Review not found' });
            return;
        }

        // Check ownership or admin status
        if (
            review.user.toString() !== req.user?._id.toString() &&
            req.user?.role !== 'admin'
        ) {
            res.status(401).json({ message: 'Not authorized' });
            return;
        }

        await review.deleteOne();

        // Recalculate product rating
        const productId = review.product;
        const product = await Product.findById(productId);

        if (product) {
            const reviews = await Review.find({ product: productId });
            product.numReviews = reviews.length;
            product.averageRating = reviews.length > 0
                ? reviews.reduce((acc, item) => item.rating + acc, 0) / reviews.length
                : 0;
            await product.save();
        }

        res.json({ message: 'Review removed' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};
