import { Request, Response, NextFunction } from 'express';
import Order from '../models/Order';
import Product from '../models/Product';
import Coupon from '../models/Coupon';
import { createNotification } from './notificationController';
import { emitToUser } from '../services/socketService';
import { isSellerRole } from '../utils/roles';

const generateDisplayId = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const random = Math.floor(10000 + Math.random() * 90000); // 5 random digits
    return `ORD-${year}${month}${day}-${random}`;
};

const generateUniqueDisplayId = async (): Promise<string> => {
    for (let i = 0; i < 10; i++) {
        const candidate = generateDisplayId();
        const exists = await Order.exists({ displayId: candidate });
        if (!exists) return candidate;
    }
    throw new Error('Could not generate unique order id');
};

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
export const addOrderItems = async (req: Request, res: Response) => {
    const {
        orderItems,
        shippingAddress,
        paymentMethod,
        totalPrice,
        couponCode,
        discountAmount,
    } = req.body;

    if (orderItems && orderItems.length === 0) {
        res.status(400).json({ message: 'No order items' });
        return;
    }

    if (isSellerRole((req as any).user?.role)) {
        res.status(403).json({ message: 'Vendors cannot place orders' });
        return;
    }

    // Mock Payment — auto-approve (no Stripe needed for now)
    const paymentResult = {
        id: `payment_${Date.now()}`,
        status: 'completed',
        update_time: new Date().toISOString(),
        email_address: (req as any).user.email,
    };

    try {
        // 1️⃣ Validate stock and decrement for each item
        for (const item of orderItems) {
            const product = await Product.findById(item.product);
            if (!product) {
                res.status(400).json({ message: `Product no longer exists` });
                return;
            }

            if (item.variant) {
                const variantIndex = product.variants.findIndex(
                    (v) => v.size === item.variant.size && v.color === item.variant.color
                );
                if (variantIndex === -1) {
                    res.status(400).json({ message: `Variant not found for ${product.name}` });
                    return;
                }
                if (product.variants[variantIndex].stock < item.quantity) {
                    res.status(400).json({ message: `Insufficient stock for ${product.name}` });
                    return;
                }
                product.variants[variantIndex].stock -= item.quantity;
            } else {
                if (typeof product.stock !== 'number' || product.stock < item.quantity) {
                    res.status(400).json({ message: `Insufficient stock for ${product.name}` });
                    return;
                }
                product.stock -= item.quantity;
            }

            item.seller = product.seller;
            product.salesCount = (product.salesCount || 0) + item.quantity;
            product.totalRevenue = (product.totalRevenue || 0) + (item.price ?? 0) * item.quantity;
            await product.save();
        }

        // 2️⃣ Increment coupon usage if applicable
        if (couponCode) {
            await Coupon.findOneAndUpdate(
                { code: couponCode.toUpperCase() },
                { $inc: { usedCount: 1 } }
            );
        }

        // 3️⃣ Clear checked-out items from cart
        const Cart = (await import('../models/Cart')).default;
        await Cart.updateOne(
            { user: (req as any).user._id },
            { $set: { items: [] } }
        );

        // 4️⃣ Create the order (immediately marked as paid)
        const order = new Order({
            user: (req as any).user._id,
            items: orderItems,
            shippingAddress,
            paymentMethod,
            paymentResult,
            totalPrice,
            couponCode,
            discountAmount: discountAmount || 0,
            isPaid: true,
            paidAt: new Date(),
            status: 'Processing',
            displayId: await generateUniqueDisplayId(),
        });
        const createdOrder = await order.save();

        // 5️⃣ Send notifications (non-blocking)
        try {
            const notification = await createNotification(
                (req as any).user._id.toString(),
                'Order Placed Successfully! 🎉',
                `Your order ${createdOrder.displayId} has been placed and payment confirmed.`,
                'order',
                `/order/${createdOrder._id}`
            );
            emitToUser((req as any).user._id.toString(), 'notification', notification);

            const sellerIds = [...new Set(orderItems.map((i: any) => i.seller?.toString()).filter(Boolean))] as string[];
            for (const sellerId of sellerIds) {
                const sellerNotif = await createNotification(
                    sellerId,
                    'New Order Received! 📦',
                    `You have a new order ${createdOrder.displayId}!`,
                    'order'
                );
                emitToUser(sellerId, 'notification', sellerNotif);
            }
        } catch (e) {
            console.error('Notification error (non-fatal):', e);
        }

        res.status(201).json(createdOrder);
    } catch (error: any) {
        console.error('Order creation error:', error);
        res.status(500).json({ message: error.message || 'Unable to place order. Please try again.' });
    }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
export const getOrderById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const order = await Order.findById(req.params.id).populate('user', 'name email');

        if (order) {
            if (
                (req as any).user.role === 'admin' ||
                (req as any).user.role === 'seller' ||
                order.user._id.toString() === (req as any).user._id.toString()
            ) {
                res.json(order);
            } else {
                res.status(403).json({ message: 'Not authorized to view this order' });
            }
        } else {
            res.status(404).json({ message: 'Order not found' });
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/my
// @access  Private
export const getMyOrders = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const orders = await Order.find({ user: (req as any).user._id }).sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        next(error);
    }
};

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
export const getOrders = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const orders = await Order.find({}).populate('user', 'id name').sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        next(error);
    }
};

// @desc    Update order to delivered
// @route   PUT /api/orders/:id/deliver
// @access  Private/Admin
export const updateOrderToDelivered = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const order = await Order.findById(req.params.id);

        if (order) {
            order.isDelivered = true;
            order.deliveredAt = new Date();
            order.status = 'Delivered';

            const updatedOrder = await order.save();

            // Notify buyer
            try {
                const notification = await createNotification(
                    order.user.toString(),
                    'Order Delivered',
                    `Your order #${order._id.toString().slice(-8).toUpperCase()} has been delivered!`,
                    'order',
                    `/order/${order._id}`
                );
                emitToUser(order.user.toString(), 'notification', notification);
            } catch (e) {
                console.error('Notification error:', e);
            }

            res.json(updatedOrder);
        } else {
            res.status(404).json({ message: 'Order not found' });
        }
    } catch (error) {
        next(error);
    }
};
