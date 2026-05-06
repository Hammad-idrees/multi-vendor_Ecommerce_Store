import { Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';
import User from '../models/User';
import generateToken from '../utils/generateToken';
import { AuthRequest } from '../middleware/auth';
import { normalizeRole, isSellerRole } from '../utils/roles';

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            res.status(401).json({ message: 'Invalid email or password' });
            return;
        }

        if (user.isBlocked) {
            res.status(403).json({ message: 'Your account has been blocked. Contact support.' });
            return;
        }

        if (await user.matchPassword(password)) {
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                avatar: (user as any).avatar,
                shopName: (user as any).shopName,
                token: generateToken(user._id),
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { name, email, password, role, shopName, shopDescription, phone } = req.body;

        const userExists = await User.findOne({ email });

        if (userExists) {
            res.status(400).json({ message: 'User already exists' });
            return;
        }

        const assignedRole = normalizeRole(role);

        const userData: any = {
            name,
            email,
            password,
            role: assignedRole,
            phone: phone || '',
        };

        if (isSellerRole(assignedRole)) {
            userData.shopName = shopName || `${name}'s Shop`;
            userData.shopDescription = shopDescription || '';
        }

        const user = await User.create(userData);

        if (user) {
            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                shopName: (user as any).shopName,
                token: generateToken(user._id),
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
export const getUserProfile = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const user = await User.findById(req.user!._id);

        if (user) {
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                avatar: (user as any).avatar,
                phone: (user as any).phone,
                address: (user as any).address,
                city: (user as any).city,
                postalCode: (user as any).postalCode,
                country: (user as any).country,
                shopName: (user as any).shopName,
                shopDescription: (user as any).shopDescription,
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateUserProfile = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const user = await User.findById(req.user!._id);

        if (user) {
            user.name = req.body.name || user.name;
            user.email = req.body.email || user.email;
            if (req.body.password) {
                user.password = req.body.password;
            }

            (user as any).avatar = req.body.avatar || (user as any).avatar;
            (user as any).phone = req.body.phone || (user as any).phone;
            (user as any).address = req.body.address || (user as any).address;
            (user as any).city = req.body.city || (user as any).city;
            (user as any).postalCode = req.body.postalCode || (user as any).postalCode;
            (user as any).country = req.body.country || (user as any).country;
            (user as any).shopName = req.body.shopName || (user as any).shopName;
            (user as any).shopDescription = req.body.shopDescription || (user as any).shopDescription;

            const updatedUser = await user.save();

            res.json({
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                role: updatedUser.role,
                avatar: (updatedUser as any).avatar,
                phone: (updatedUser as any).phone,
                address: (updatedUser as any).address,
                city: (updatedUser as any).city,
                postalCode: (updatedUser as any).postalCode,
                country: (updatedUser as any).country,
                shopName: (updatedUser as any).shopName,
                shopDescription: (updatedUser as any).shopDescription,
                token: generateToken(updatedUser._id),
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Get seller public profile
// @route   GET /api/auth/seller/:id
// @access  Public
export const getSellerProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = await User.findById(req.params.id);

        if (user && isSellerRole(user.role)) {
            res.json({
                _id: user._id,
                name: user.name,
                shopName: (user as any).shopName,
                shopDescription: (user as any).shopDescription,
                avatar: (user as any).avatar,
                createdAt: (user as any).createdAt,
            });
        } else {
            res.status(404).json({ message: 'Seller not found' });
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Get all sellers (public)
// @route   GET /api/auth/sellers
// @access  Public
export const getSellers = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const sellers = await User.find({ role: 'seller' }).select('name shopName shopDescription avatar');
        res.json(sellers);
    } catch (error) {
        next(error);
    }
};
