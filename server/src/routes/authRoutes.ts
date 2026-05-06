import express from 'express';
import { body } from 'express-validator';
import { loginUser, registerUser, getUserProfile, updateUserProfile, getSellerProfile, getSellers } from '../controllers/authController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.post(
    '/register',
    [
        body('name', 'Name is required').not().isEmpty(),
        body('email', 'Please include a valid email').isEmail(),
        body('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 }),
    ],
    registerUser
);

router.post(
    '/login',
    [
        body('email', 'Please include a valid email').isEmail(),
        body('password', 'Password is required').exists(),
    ],
    loginUser
);

router.get('/sellers', getSellers);
router.get('/seller/:id', getSellerProfile);
router.route('/profile').get(protect, getUserProfile).put(protect, updateUserProfile);

export default router;
