import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import User, { IUser } from '../models/User';
import { isAdminRole, isSellerRole } from '../utils/roles';

export interface AuthRequest extends Request {
    user?: IUser;
}

export const protect = async (req: AuthRequest, res: Response, next: NextFunction) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];

            const decoded: any = jwt.verify(token, process.env.JWT_SECRET as string);

            const user = await User.findById(decoded.id).select('-password') as IUser;

            if (!user) {
                res.status(401).json({ message: 'User not found' });
                return;
            }

            if (user.isBlocked) {
                res.status(403).json({ message: 'Your account has been blocked' });
                return;
            }

            req.user = user;
            next();
        } catch (error) {
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};

export const admin = (req: AuthRequest, res: Response, next: NextFunction) => {
    if (req.user && isAdminRole(req.user.role)) {
        next();
    } else {
        res.status(403).json({ message: 'Not authorized as an admin' });
    }
};

export const seller = (req: AuthRequest, res: Response, next: NextFunction) => {
    if (req.user && (isSellerRole(req.user.role) || isAdminRole(req.user.role))) {
        next();
    } else {
        res.status(403).json({ message: 'Not authorized as a seller' });
    }
};
