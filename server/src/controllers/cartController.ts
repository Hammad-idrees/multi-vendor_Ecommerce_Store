import { Request, Response, NextFunction } from 'express';
import Cart from '../models/Cart';
import { isSellerRole } from '../utils/roles';
import Product from '../models/Product';

const cartPopulateFields = 'name price images stock variants seller';

// @desc    Get user cart
// @route   GET /api/cart
// @access  Private
export const getCart = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (isSellerRole((req as any).user?.role)) {
            res.status(403).json({ message: 'Vendors cannot use cart' });
            return;
        }

        let cart = await Cart.findOne({ user: (req as any).user._id }).populate('items.product', cartPopulateFields);

        if (!cart) {
            cart = await Cart.create({ user: (req as any).user._id, items: [] });
        }

        res.json(cart);
    } catch (error) {
        next(error);
    }
};

// @desc    Add item to cart
// @route   POST /api/cart
// @access  Private
export const addToCart = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (isSellerRole((req as any).user?.role)) {
            res.status(403).json({ message: 'Vendors cannot add items to cart' });
            return;
        }

        const { productId, variant, quantity } = req.body;
        const userId = (req as any).user._id;
        const qty = Number(quantity);

        if (!productId || !qty || qty < 1) {
            res.status(400).json({ message: 'Valid product and quantity are required' });
            return;
        }

        const product = await Product.findById(productId);
        if (!product) {
            res.status(404).json({ message: 'Product not found' });
            return;
        }

        let cart = await Cart.findOne({ user: userId });

        if (!cart) {
            cart = await Cart.create({ user: userId, items: [] });
        }

        const itemIndex = cart.items.findIndex(
            (item) => item.product.toString() === productId && JSON.stringify(item.variant) === JSON.stringify(variant)
        );

        if (itemIndex > -1) {
            const newQty = cart.items[itemIndex].quantity + qty;
            const hasVariant = variant && (variant.size || variant.color);
            const available = hasVariant
                ? (product.variants.find((v) => v.size === variant.size && v.color === variant.color)?.stock || 0)
                : (product.stock || 0);
            if (newQty > available) {
                res.status(400).json({ message: `Only ${available} item(s) available in stock` });
                return;
            }
            cart.items[itemIndex].quantity = newQty;
        } else {
            cart.items.push({ product: productId, variant, quantity: qty, selected: true });
        }

        await cart.save();
        // Populate to return full item details
        await cart.populate('items.product', cartPopulateFields);
        res.json(cart);
    } catch (error) {
        next(error);
    }
};

// @desc    Update cart item (quantity or selection)
// @route   PUT /api/cart/:itemId
// @access  Private
export const updateCartItem = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (isSellerRole((req as any).user?.role)) {
            res.status(403).json({ message: 'Vendors cannot use cart' });
            return;
        }

        const { quantity, selected } = req.body;
        const userId = (req as any).user._id;
        const itemId = req.params.itemId;

        const cart = await Cart.findOne({ user: userId });

        if (cart) {
            const itemIndex = cart.items.findIndex((item) => (item as any)._id.toString() === itemId);
            if (itemIndex > -1) {
                if (quantity !== undefined) {
                    const qty = Number(quantity);
                    if (!qty || qty < 1) {
                        res.status(400).json({ message: 'Quantity must be greater than zero' });
                        return;
                    }
                    const product = await Product.findById(cart.items[itemIndex].product);
                    if (!product) {
                        res.status(404).json({ message: 'Product not found' });
                        return;
                    }
                    const variant = cart.items[itemIndex].variant;
                    const hasVariant = variant && (variant.size || variant.color);
                    const available = hasVariant
                        ? (product.variants.find((v) => v.size === variant.size && v.color === variant.color)?.stock || 0)
                        : (product.stock || 0);
                    if (qty > available) {
                        res.status(400).json({ message: `Only ${available} item(s) available in stock` });
                        return;
                    }
                    cart.items[itemIndex].quantity = qty;
                }
                if (selected !== undefined) cart.items[itemIndex].selected = selected;
                await cart.save();
                await cart.populate('items.product', cartPopulateFields);
                res.json(cart);
            } else {
                res.status(404).json({ message: 'Item not found in cart' });
            }
        } else {
            res.status(404).json({ message: 'Cart not found' });
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Update all cart items (e.g. Select All)
// @route   PUT /api/cart
// @access  Private
export const updateAllCartItems = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (isSellerRole((req as any).user?.role)) {
            res.status(403).json({ message: 'Vendors cannot use cart' });
            return;
        }

        const { selected } = req.body;
        const userId = (req as any).user._id;

        const cart = await Cart.findOne({ user: userId });

        if (cart) {
            cart.items.forEach(item => {
                item.selected = selected;
            });
            await cart.save();
            await cart.populate('items.product', cartPopulateFields);
            res.json(cart);
        } else {
            res.status(404).json({ message: 'Cart not found' });
        }
    } catch (error) {
        next(error);
    }
};


// @desc    Remove item from cart
// @route   DELETE /api/cart/:itemId
// @access  Private
export const removeFromCart = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (isSellerRole((req as any).user?.role)) {
            res.status(403).json({ message: 'Vendors cannot use cart' });
            return;
        }

        const userId = (req as any).user._id;
        const itemId = req.params.itemId;

        const cart = await Cart.findOne({ user: userId });

        if (cart) {
            cart.items = cart.items.filter((item) => (item as any)._id.toString() !== itemId);
            await cart.save();
            await cart.populate('items.product', cartPopulateFields);
            res.json(cart);
        } else {
            res.status(404);
            throw new Error('Cart not found');
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Clear cart
// @route   DELETE /api/cart
// @access  Private
export const clearCart = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (isSellerRole((req as any).user?.role)) {
            res.status(403).json({ message: 'Vendors cannot use cart' });
            return;
        }

        const userId = (req as any).user._id;
        const cart = await Cart.findOne({ user: userId });

        if (cart) {
            cart.items = [];
            await cart.save();
            res.json(cart);
        } else {
            res.status(404);
            throw new Error('Cart not found');
        }
    } catch (error) {
        next(error);
    }
};
