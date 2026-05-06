import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import Product from '../models/Product';
import Order from '../models/Order';
import User from '../models/User';

// @desc    Get seller dashboard stats
// @route   GET /api/seller/stats
// @access  Private/Seller
export const getSellerStats = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const sellerId = req.user!._id;

        const productsCount = await Product.countDocuments({ seller: sellerId });

        // Get orders containing this seller's products
        const orders = await Order.find({ 'items.seller': sellerId, isPaid: true });

        let totalRevenue = 0;
        let totalOrders = 0;
        const monthlyData: Record<string, number> = {};

        orders.forEach((order) => {
            const sellerItems = order.items.filter(
                (item) => item.seller && item.seller.toString() === sellerId.toString()
            );
            if (sellerItems.length > 0) {
                totalOrders++;
                const orderRevenue = sellerItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
                totalRevenue += orderRevenue;

                const monthKey = new Date(order.createdAt as any).toLocaleString('default', {
                    month: 'short',
                    year: 'numeric',
                });
                monthlyData[monthKey] = (monthlyData[monthKey] || 0) + orderRevenue;
            }
        });

        // Top products by review count
        const topProducts = await Product.find({ seller: sellerId })
            .sort({ numReviews: -1 })
            .limit(5)
            .select('name price averageRating numReviews images');

        const salesData = Object.entries(monthlyData)
            .slice(-6)
            .map(([month, sales]) => ({ month, sales }));

        // Low stock alerts
        const lowStockProducts = await Product.find({
            seller: sellerId,
            stock: { $lt: 10 },
        }).select('name stock images');

        // Recent orders for this seller
        const recentOrders = await Order.find({ 'items.seller': sellerId })
            .populate('user', 'name email')
            .sort({ createdAt: -1 })
            .limit(5);

        res.json({
            productsCount,
            totalOrders,
            totalRevenue,
            topProducts,
            salesData,
            lowStockProducts,
            recentOrders,
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get seller products
// @route   GET /api/seller/products
// @access  Private/Seller
export const getSellerProducts = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const products = await Product.find({ seller: req.user!._id })
            .populate('category', 'name')
            .sort({ createdAt: -1 });
        res.json(products);
    } catch (error) {
        next(error);
    }
};

// @desc    Create seller product
// @route   POST /api/seller/products
// @access  Private/Seller
export const createSellerProduct = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { name, price, description, category, subcategory, images, variants, stock, tags, comparePrice } = req.body;
        const trimmedName = typeof name === 'string' ? name.trim() : '';

        if (!trimmedName || !category) {
            res.status(400).json({ message: 'Category and product title are required' });
            return;
        }

        if (!Array.isArray(images)) {
            res.status(400).json({ message: 'Images must be an array' });
            return;
        }

        if (images.length > 5) {
            res.status(400).json({ message: 'You can upload up to 5 images only' });
            return;
        }

        if (price === undefined || Number(price) < 0) {
            res.status(400).json({ message: 'Price is required and must be 0 or greater' });
            return;
        }

        if (stock === undefined || Number(stock) < 0) {
            res.status(400).json({ message: 'Stock quantity is required and must be 0 or greater' });
            return;
        }

        const product = new Product({
            name: trimmedName,
            price: Number(price),
            comparePrice,
            seller: req.user!._id,
            images,
            category,
            subcategory,
            variants: variants || [],
            description: description && description.trim() !== '' ? description : 'No description provided',
            stock: Number(stock),
            tags: tags || [],
            isApproved: true,
        });

        const createdProduct = await product.save();
        res.status(201).json(createdProduct);
    } catch (error) {
        next(error);
    }
};

// @desc    Update seller product
// @route   PUT /api/seller/products/:id
// @access  Private/Seller
export const updateSellerProduct = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            res.status(404).json({ message: 'Product not found' });
            return;
        }

        if (product.seller.toString() !== req.user!._id.toString()) {
            res.status(403).json({ message: 'Not authorized to edit this product' });
            return;
        }

        const { name, price, description, category, subcategory, images, variants, stock, tags, comparePrice } = req.body;

        product.name = name || product.name;
        product.price = price ?? product.price;
        product.comparePrice = comparePrice ?? product.comparePrice;
        product.description = description || product.description;
        product.category = category || product.category;
        (product as any).subcategory = subcategory ?? (product as any).subcategory;
        product.images = images || product.images;
        product.variants = variants || product.variants;
        product.stock = stock ?? product.stock;
        product.tags = tags || product.tags;

        const updatedProduct = await product.save();
        res.json(updatedProduct);
    } catch (error) {
        next(error);
    }
};

// @desc    Delete seller product
// @route   DELETE /api/seller/products/:id
// @access  Private/Seller
export const deleteSellerProduct = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            res.status(404).json({ message: 'Product not found' });
            return;
        }

        if (product.seller.toString() !== req.user!._id.toString()) {
            res.status(403).json({ message: 'Not authorized' });
            return;
        }

        await product.deleteOne();
        res.json({ message: 'Product removed' });
    } catch (error) {
        next(error);
    }
};

// @desc    Get seller orders
// @route   GET /api/seller/orders
// @access  Private/Seller
export const getSellerOrders = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { status, page = 1, limit = 20 } = req.query;
        const filter: any = { 'items.seller': req.user!._id };
        if (status && status !== 'all') filter.status = status;

        const orders = await Order.find(filter)
            .populate('user', 'name email phone')
            .sort({ createdAt: -1 })
            .skip((Number(page) - 1) * Number(limit))
            .limit(Number(limit));

        const total = await Order.countDocuments(filter);
        res.json({ orders, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
    } catch (error) {
        next(error);
    }
};

// @desc    Update order status (seller)
// @route   PUT /api/seller/orders/:id/status
// @access  Private/Seller
export const updateSellerOrderStatus = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { status } = req.body;

        const VALID_STATUSES = ['Processing', 'Shipped', 'Delivered', 'Cancelled'];
        if (!VALID_STATUSES.includes(status)) {
            res.status(400).json({ message: `Invalid status. Valid values: ${VALID_STATUSES.join(', ')}` });
            return;
        }

        const order = await Order.findById(req.params.id).populate('user', 'name email');

        if (!order) {
            res.status(404).json({ message: 'Order not found' });
            return;
        }

        // Verify this order has items from this seller
        const hasSellerItems = order.items.some(
            (item) => item.seller && item.seller.toString() === req.user!._id.toString()
        );

        if (!hasSellerItems) {
            res.status(403).json({ message: 'Not authorized for this order' });
            return;
        }

        const previousStatus = order.status;
        order.status = status;

        if (status === 'Delivered') {
            order.isDelivered = true;
            order.deliveredAt = new Date();
        }

        const updatedOrder = await order.save();

        // ✅ Save notification to DB — buyer sees it on their next load (no socket needed)
        if (status !== previousStatus) {
            try {
                const { createNotification } = await import('./notificationController');
                const buyerId = (order.user as any)?._id?.toString() || order.user.toString();
                const orderId = order.displayId || `#${order._id.toString().slice(-8).toUpperCase()}`;

                const messages: Record<string, string> = {
                    Processing: `Your order ${orderId} is being processed.`,
                    Shipped:    `Great news! Your order ${orderId} has been shipped and is on its way. 🚚`,
                    Delivered:  `Your order ${orderId} has been delivered. Enjoy your purchase! 🎉`,
                    Cancelled:  `Your order ${orderId} has been cancelled.`,
                };

                await createNotification(
                    buyerId,
                    `Order ${status}`,
                    messages[status] || `Your order ${orderId} status has been updated to ${status}.`,
                    'order',
                    `/order/${order._id}`
                );
            } catch (notifErr) {
                console.error('Notification error (non-fatal):', notifErr);
            }
        }

        res.json(updatedOrder);
    } catch (error) {
        next(error);
    }
};

