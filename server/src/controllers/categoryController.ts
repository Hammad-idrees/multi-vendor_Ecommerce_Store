import { Request, Response } from 'express';
import Category from '../models/Category';

// @desc    Get all categories (or by parent)
// @route   GET /api/categories
// @route   GET /api/categories?parent=<id>   → subcategories only
// @route   GET /api/categories?topLevel=true  → root categories only
// @access  Public
export const getCategories = async (req: Request, res: Response) => {
    let filter: any = {};
    if (req.query.parent) {
        filter.parent = req.query.parent;
    } else if (req.query.topLevel === 'true') {
        filter.parent = null;
    }
    const categories = await Category.find(filter);
    res.json(categories);
};

// @desc    Get single category
// @route   GET /api/categories/:id
// @access  Public
export const getCategoryById = async (req: Request, res: Response) => {
    const category = await Category.findById(req.params.id);
    if (category) {
        res.json(category);
    } else {
        res.status(404).json({ message: 'Category not found' });
    }
};

// @desc    Create a category
// @route   POST /api/categories
// @access  Private/Admin
export const createCategory = async (req: Request, res: Response) => {
    const { name, description, image } = req.body;

    const categoryExists = await Category.findOne({ name });
    if (categoryExists) {
        res.status(400).json({ message: 'Category already exists' });
        return;
    }

    const category = await Category.create({ name, description, image });
    res.status(201).json(category);
};

// @desc    Update a category
// @route   PUT /api/categories/:id
// @access  Private/Admin
export const updateCategory = async (req: Request, res: Response) => {
    const category = await Category.findById(req.params.id);

    if (category) {
        category.name = req.body.name || category.name;
        category.description = req.body.description || category.description;
        category.image = req.body.image || category.image;

        const updatedCategory = await category.save();
        res.json(updatedCategory);
    } else {
        res.status(404).json({ message: 'Category not found' });
    }
};

// @desc    Delete a category
// @route   DELETE /api/categories/:id
// @access  Private/Admin
export const deleteCategory = async (req: Request, res: Response) => {
    const category = await Category.findById(req.params.id);

    if (category) {
        await category.deleteOne();
        res.json({ message: 'Category removed' });
    } else {
        res.status(404).json({ message: 'Category not found' });
    }
};
