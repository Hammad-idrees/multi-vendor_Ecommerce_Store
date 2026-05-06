import { Request, Response, NextFunction } from 'express';
import User from '../models/User';
import Order from '../models/Order';
import Product from '../models/Product';
import Category from '../models/Category';
import Cart from '../models/Cart';
import { AuthRequest } from '../middleware/auth';
import { normalizeRole, isSellerRole } from '../utils/roles';

// @desc    Get dashboard stats
// @route   GET /api/admin/stats
// @access  Private/Admin
export const getDashboardStats = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const usersCount = await User.countDocuments();
        const buyersCount = await User.countDocuments({ role: 'buyer' });
        const sellersCount = await User.countDocuments({ role: 'seller' });
        const adminsCount = await User.countDocuments({ role: 'admin' });
        const ordersCount = await Order.countDocuments();
        const productsCount = await Product.countDocuments();
        const pendingApprovals = await Product.countDocuments({ isApproved: false });

        const orders = await Order.find({ isPaid: true });
        const totalRevenue = orders.reduce((acc, order) => acc + order.totalPrice, 0);

        // Monthly sales aggregation (last 6 months)
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const monthlyOrders = await Order.find({
            isPaid: true,
            createdAt: { $gte: sixMonthsAgo },
        });

        const monthlyData: Record<string, number> = {};
        monthlyOrders.forEach((order) => {
            const monthKey = new Date(order.createdAt as any).toLocaleString('default', { month: 'short' });
            monthlyData[monthKey] = (monthlyData[monthKey] || 0) + order.totalPrice;
        });

        const salesData = Object.entries(monthlyData).map(([month, sales]) => ({ month, sales }));

        // Order status breakdown
        const statusGroups = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
        const orderStatusData = await Promise.all(
            statusGroups.map(async (status) => ({
                status,
                count: await Order.countDocuments({ status }),
            }))
        );

        // Category distribution (only top-level categories for clarity in chart)
        const categories = await Category.find({});
        const categoryData = await Promise.all(
            categories.map(async (cat) => ({
                name: cat.name,
                count: await Product.countDocuments({ category: cat._id }),
            }))
        );

        // Top products
        const topProducts = await Product.find({ isApproved: true })
            .sort({ numReviews: -1 })
            .limit(5)
            .select('name price averageRating numReviews');

        // Recent orders
        const recentOrders = await Order.find({})
            .populate('user', 'name email')
            .sort({ createdAt: -1 })
            .limit(10);

        res.json({
            usersCount,
            buyersCount,
            sellersCount,
            customersCount: buyersCount,
            vendorsCount: sellersCount,
            adminsCount,
            ordersCount,
            productsCount,
            totalRevenue,
            pendingApprovals,
            salesData,
            categoryData,
            orderStatusData,
            topProducts,
            recentOrders,
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
export const getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const role = req.query.role ? normalizeRole(String(req.query.role)) : undefined;
        const filter = role ? { role } : {};
        const users = await User.find(filter).select('-password').sort({ createdAt: -1 });
        res.json(users);
    } catch (error) {
        next(error);
    }
};

// @desc    Admin manually creates a user
// @route   POST /api/admin/users
// @access  Private/Admin
export const createUserByAdmin = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { name, email, role, password, shopName, shopDescription } = req.body;
        if (!name || !email || !password) {
            res.status(400).json({ message: 'Name, email and password are required' });
            return;
        }

        const existing = await User.findOne({ email });
        if (existing) {
            res.status(400).json({ message: 'User already exists with this email' });
            return;
        }

        const normalizedRole = normalizeRole(role);
        const userData: any = {
            name,
            email,
            password,
            role: normalizedRole,
        };
        if (normalizedRole === 'seller') {
            userData.shopName = shopName || `${name}'s Shop`;
            userData.shopDescription = shopDescription || '';
        }

        const user = await User.create(userData);
        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            shopName: (user as any).shopName,
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update user role
// @route   PUT /api/admin/users/:id/role
// @access  Private/Admin
export const updateUserRole = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { role } = req.body;
        const user = await User.findById(req.params.id);

        if (user) {
            user.role = normalizeRole(role);
            const updatedUser = await user.save();
            res.json({
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                role: updatedUser.role,
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Admin monitor a vendor's activity
// @route   GET /api/admin/vendors/:id/activity
// @access  Private/Admin
export const getVendorActivity = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const vendor = await User.findById(req.params.id).select('-password');
        if (!vendor || !isSellerRole(vendor.role)) {
            res.status(404).json({ message: 'Vendor not found' });
            return;
        }

        const products = await Product.find({ seller: vendor._id })
            .populate('category', 'name')
            .sort({ createdAt: -1 });

        res.json({
            vendor,
            products,
            totalProducts: products.length,
            lowStockCount: products.filter((p) => p.stock < 10).length,
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Admin monitor a customer's activity
// @route   GET /api/admin/customers/:id/activity
// @access  Private/Admin
export const getCustomerActivity = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const customer = await User.findById(req.params.id).select('-password');
        if (!customer || customer.role !== 'buyer') {
            res.status(404).json({ message: 'Customer not found' });
            return;
        }

        const cart = await Cart.findOne({ user: customer._id }).populate(
            'items.product',
            'name price images stock'
        );
        const orders = await Order.find({ user: customer._id }).sort({ createdAt: -1 });

        res.json({
            customer,
            cart,
            orders,
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Block/Unblock user
// @route   PUT /api/admin/users/:id/block
// @access  Private/Admin
export const toggleBlockUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = await User.findById(req.params.id);
        if (user) {
            (user as any).isBlocked = !(user as any).isBlocked;
            await user.save();
            res.json({ message: `User ${(user as any).isBlocked ? 'blocked' : 'unblocked'}`, isBlocked: (user as any).isBlocked });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
export const deleteUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = await User.findById(req.params.id);
        if (user) {
            await user.deleteOne();
            res.json({ message: 'User removed' });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Delete inactive non-admin users
// @route   DELETE /api/admin/users/inactive
// @access  Private/Admin
export const deleteInactiveUsers = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const requestedDays = Number(req.query.days);
        const inactivityDays = Number.isFinite(requestedDays) && requestedDays > 0 ? requestedDays : 180;

        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - inactivityDays);

        const candidateUsers = await User.find({
            role: { $ne: 'admin' },
            updatedAt: { $lte: cutoffDate },
        })
            .select('_id name email role updatedAt')
            .lean();

        const removedUsers: Array<{ _id: string; name: string; email: string; role: string }> = [];
        const currentAdminId = req.user?._id?.toString();

        for (const user of candidateUsers) {
            if (currentAdminId && user._id.toString() === currentAdminId) {
                continue;
            }

            let hasRecentActivity = false;
            if (user.role === 'buyer') {
                const recentOrder = await Order.exists({
                    user: user._id,
                    createdAt: { $gte: cutoffDate },
                });
                hasRecentActivity = Boolean(recentOrder);
            } else if (isSellerRole(user.role)) {
                const recentProduct = await Product.exists({
                    seller: user._id,
                    createdAt: { $gte: cutoffDate },
                });
                hasRecentActivity = Boolean(recentProduct);
            }

            if (!hasRecentActivity) {
                await User.findByIdAndDelete(user._id);
                removedUsers.push({
                    _id: user._id.toString(),
                    name: user.name,
                    email: user.email,
                    role: user.role,
                });
            }
        }

        res.json({
            message: `Removed ${removedUsers.length} inactive account(s)`,
            inactivityDays,
            removedCount: removedUsers.length,
            removedUsers,
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get all orders
// @route   GET /api/admin/orders
// @access  Private/Admin
export const getAllOrders = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const orders = await Order.find({}).populate('user', 'id name email').sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        next(error);
    }
};

// @desc    Update order status
// @route   PUT /api/admin/orders/:id/status
// @access  Private/Admin
export const updateOrderStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { status } = req.body;
        const order = await Order.findById(req.params.id);

        if (order) {
            order.status = status;
            if (status === 'Delivered') {
                order.isDelivered = true;
                order.deliveredAt = new Date();
            }
            if (status === 'Processing') {
                order.isPaid = true;
                order.paidAt = new Date();
            }

            const updatedOrder = await order.save();
            res.json(updatedOrder);
        } else {
            res.status(404).json({ message: 'Order not found' });
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Get pending products for moderation
// @route   GET /api/admin/products/pending
// @access  Private/Admin
export const getPendingProducts = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const products = await Product.find({ isApproved: false })
            .populate('seller', 'name shopName email')
            .populate('category', 'name')
            .sort({ createdAt: -1 });
        res.json(products);
    } catch (error) {
        next(error);
    }
};

// @desc    Approve/Reject product
// @route   PUT /api/admin/products/:id/approve
// @access  Private/Admin
export const approveProduct = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { approved } = req.body;
        const product = await Product.findById(req.params.id);

        if (product) {
            product.isApproved = approved;
            if (!approved) {
                await product.deleteOne();
                res.json({ message: 'Product rejected and removed' });
            } else {
                await product.save();
                res.json({ message: 'Product approved', product });
            }
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        next(error);
    }
};
