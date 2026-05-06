import { Request, Response, NextFunction } from 'express';
import Product from '../models/Product';
import Review from '../models/Review';
import Category from '../models/Category';

// @desc    Fetch all products
// @route   GET /api/products
// @access  Public
export const getProducts = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const pageSize = Number(req.query.limit) || 12;
        const page = Number(req.query.pageNumber) || 1;

        // Search Keyword
        const keyword = req.query.keyword
            ? {
                $or: [
                    { name: { $regex: req.query.keyword as string, $options: 'i' } },
                    { description: { $regex: req.query.keyword as string, $options: 'i' } },
                    { tags: { $regex: req.query.keyword as string, $options: 'i' } },
                ],
            }
            : {};

        // Filters
        let categoryFilter = {};
        if (req.query.category) {
            categoryFilter = { category: req.query.category };
        } else if (req.query.categoryName) {
            const categoryName = req.query.categoryName.toString();
            const categoryDoc = await Category.findOne({
                name: { $regex: new RegExp(`^${categoryName}$`, 'i') }
            });

            if (categoryDoc) {
                categoryFilter = { category: categoryDoc._id };
            } else {
                categoryFilter = { _id: { $exists: false } };
            }
        }

        const price = req.query.minPrice || req.query.maxPrice
            ? {
                price: {
                    ...(req.query.minPrice ? { $gte: Number(req.query.minPrice) } : {}),
                    ...(req.query.maxPrice ? { $lte: Number(req.query.maxPrice) } : {}),
                }
            }
            : {};

        const rating = req.query.minRating ? { averageRating: { $gte: Number(req.query.minRating) } } : {};
        const inStock = req.query.inStock === 'true' ? { stock: { $gt: 0 } } : {};
        const seller = req.query.seller ? { seller: req.query.seller } : {};

        // Only show approved products to public
        const approved = { isApproved: true };

        // Sorting
        let sort: any = { createdAt: -1 };
        if (req.query.sort) {
            switch (req.query.sort) {
                case 'priceAsc': sort = { price: 1 }; break;
                case 'priceDesc': sort = { price: -1 }; break;
                case 'rating': sort = { averageRating: -1 }; break;
                case 'newest': sort = { createdAt: -1 }; break;
                case 'popular': sort = { numReviews: -1 }; break;
            }
        }

        const filter = { ...keyword, ...categoryFilter, ...price, ...rating, ...inStock, ...seller, ...approved };

        const count = await Product.countDocuments(filter);
        const products = await Product.find(filter)
            .populate('category', 'name')
            .populate('seller', 'name shopName')
            .sort(sort)
            .limit(pageSize)
            .skip(pageSize * (page - 1));

        res.json({ products, page, pages: Math.ceil(count / pageSize), total: count });
    } catch (error) {
        next(error);
    }
};

// @desc    Fetch single product
// @route   GET /api/products/:id
// @access  Public
export const getProductById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const product = await Product.findById(req.params.id)
            .populate('category', 'name')
            .populate('seller', 'name shopName avatar');

        if (product) {
            res.json(product);
        } else {
            res.status(404);
            throw new Error('Product not found');
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Create a product (admin)
// @route   POST /api/products
// @access  Private/Admin
export const createProduct = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { name, price, description, category, subcategory, images, variants, stock, tags } = req.body;

        const product = new Product({
            name,
            price,
            seller: (req as any).user._id,
            images,
            category,
            subcategory,
            variants,
            description,
            stock: stock || 0,
            tags: tags || [],
            isApproved: true, // Admin products are auto-approved
        });

        const createdProduct = await product.save();
        res.status(201).json(createdProduct);
    } catch (error) {
        next(error);
    }
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
export const updateProduct = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { name, price, description, category, subcategory, images, variants, stock, tags, isApproved, isFeatured } = req.body;

        const product = await Product.findById(req.params.id);

        if (product) {
            product.name = name || product.name;
            product.price = price ?? product.price;
            product.description = description || product.description;
            product.category = category || product.category;
            (product as any).subcategory = subcategory ?? (product as any).subcategory;
            product.images = images || product.images;
            product.variants = variants || product.variants;
            product.stock = stock ?? product.stock;
            product.tags = tags || product.tags;
            if (isApproved !== undefined) product.isApproved = isApproved;
            if (isFeatured !== undefined) product.isFeatured = isFeatured;

            const updatedProduct = await product.save();
            res.json(updatedProduct);
        } else {
            res.status(404);
            throw new Error('Product not found');
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
export const deleteProduct = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const product = await Product.findById(req.params.id);

        if (product) {
            await product.deleteOne();
            res.json({ message: 'Product removed' });
        } else {
            res.status(404);
            throw new Error('Product not found');
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Create new review
// @route   POST /api/products/:id/reviews
// @access  Private
export const createProductReview = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { rating, comment } = req.body;
        const product = await Product.findById(req.params.id);

        if (product) {
            const alreadyReviewed = await Review.findOne({
                product: req.params.id,
                user: (req as any).user._id,
            });

            if (alreadyReviewed) {
                res.status(400);
                throw new Error('Product already reviewed');
            }

            const review = await Review.create({
                user: (req as any).user._id,
                product: req.params.id,
                rating: Number(rating),
                comment,
            });

            const reviews = await Review.find({ product: req.params.id });
            product.numReviews = reviews.length;
            product.averageRating =
                reviews.reduce((acc, item) => item.rating + acc, 0) / reviews.length;

            await product.save();
            res.status(201).json({ message: 'Review added' });
        } else {
            res.status(404);
            throw new Error('Product not found');
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Get featured products
// @route   GET /api/products/featured
// @access  Public
export const getFeaturedProducts = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const products = await Product.find({ isFeatured: true, isApproved: true })
            .populate('category', 'name')
            .populate('seller', 'name shopName')
            .limit(8);
        res.json(products);
    } catch (error) {
        next(error);
    }
};

// @desc    Get top rated products
// @route   GET /api/products/top
// @access  Public
export const getTopProducts = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const products = await Product.find({ isApproved: true })
            .sort({ averageRating: -1 })
            .populate('category', 'name')
            .populate('seller', 'name shopName')
            .limit(8);
        res.json(products);
    } catch (error) {
        next(error);
    }
};
