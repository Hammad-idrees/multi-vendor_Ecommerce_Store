import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import Wishlist from '../models/Wishlist';

// @desc    Get user wishlist
// @route   GET /api/wishlist
// @access  Private
export const getWishlist = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        let wishlist = await Wishlist.findOne({ user: req.user!._id }).populate(
            'products',
            'name price images averageRating numReviews stock seller'
        );

        if (!wishlist) {
            wishlist = await Wishlist.create({ user: req.user!._id, products: [] });
        }

        res.json(wishlist);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Add product to wishlist
// @route   POST /api/wishlist
// @access  Private
export const addToWishlist = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { productId } = req.body;

        let wishlist = await Wishlist.findOne({ user: req.user!._id });

        if (!wishlist) {
            wishlist = await Wishlist.create({ user: req.user!._id, products: [productId] });
        } else {
            if (wishlist.products.some((p) => p.toString() === productId)) {
                res.status(400).json({ message: 'Product already in wishlist' });
                return;
            }
            wishlist.products.push(productId);
            await wishlist.save();
        }

        await wishlist.populate('products', 'name price images averageRating numReviews stock seller');
        res.json(wishlist);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Remove product from wishlist
// @route   DELETE /api/wishlist/:productId
// @access  Private
export const removeFromWishlist = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const wishlist = await Wishlist.findOne({ user: req.user!._id });

        if (!wishlist) {
            res.status(404).json({ message: 'Wishlist not found' });
            return;
        }

        wishlist.products = wishlist.products.filter(
            (p) => p.toString() !== req.params.productId
        );
        await wishlist.save();

        await wishlist.populate('products', 'name price images averageRating numReviews stock seller');
        res.json(wishlist);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};
