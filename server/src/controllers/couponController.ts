import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import Coupon from '../models/Coupon';

// @desc    Create coupon
// @route   POST /api/coupons
// @access  Private/Seller/Admin
export const createCoupon = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { code, discountType, discountValue, minOrderAmount, maxUses, expiresAt } = req.body;

        const existing = await Coupon.findOne({ code: code.toUpperCase() });
        if (existing) {
            res.status(400).json({ message: 'Coupon code already exists' });
            return;
        }

        const coupon = await Coupon.create({
            code: code.toUpperCase(),
            discountType,
            discountValue,
            minOrderAmount: minOrderAmount || 0,
            maxUses: maxUses || 100,
            expiresAt,
            createdBy: req.user!._id,
        });

        res.status(201).json(coupon);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Validate coupon
// @route   POST /api/coupons/validate
// @access  Private
export const validateCoupon = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { code, orderAmount } = req.body;

        const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });

        if (!coupon) {
            res.status(404).json({ message: 'Invalid coupon code' });
            return;
        }

        if (new Date() > coupon.expiresAt) {
            res.status(400).json({ message: 'Coupon has expired' });
            return;
        }

        if (coupon.usedCount >= coupon.maxUses) {
            res.status(400).json({ message: 'Coupon usage limit reached' });
            return;
        }

        if (orderAmount < coupon.minOrderAmount) {
            res.status(400).json({ message: `Minimum order amount is $${coupon.minOrderAmount}` });
            return;
        }

        let discount = 0;
        if (coupon.discountType === 'percentage') {
            discount = (orderAmount * coupon.discountValue) / 100;
        } else {
            discount = coupon.discountValue;
        }

        res.json({
            valid: true,
            discount,
            coupon: {
                code: coupon.code,
                discountType: coupon.discountType,
                discountValue: coupon.discountValue,
            },
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get all coupons (seller sees own, admin sees all)
// @route   GET /api/coupons
// @access  Private/Seller/Admin
export const getCoupons = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        let filter = {};
        if (req.user!.role === 'seller') {
            filter = { createdBy: req.user!._id };
        }

        const coupons = await Coupon.find(filter).sort({ createdAt: -1 });
        res.json(coupons);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Update coupon
// @route   PUT /api/coupons/:id
// @access  Private/Seller/Admin
export const updateCoupon = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const coupon = await Coupon.findById(req.params.id);

        if (!coupon) {
            res.status(404).json({ message: 'Coupon not found' });
            return;
        }

        if (req.user!.role === 'seller' && coupon.createdBy.toString() !== req.user!._id.toString()) {
            res.status(403).json({ message: 'Not authorized' });
            return;
        }

        const updated = await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updated);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Delete coupon
// @route   DELETE /api/coupons/:id
// @access  Private/Seller/Admin
export const deleteCoupon = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const coupon = await Coupon.findById(req.params.id);

        if (!coupon) {
            res.status(404).json({ message: 'Coupon not found' });
            return;
        }

        if (req.user!.role === 'seller' && coupon.createdBy.toString() !== req.user!._id.toString()) {
            res.status(403).json({ message: 'Not authorized' });
            return;
        }

        await coupon.deleteOne();
        res.json({ message: 'Coupon removed' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};
