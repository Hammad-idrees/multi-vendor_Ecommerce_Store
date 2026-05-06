import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import http from 'http';
import { connectDB } from './config/database';
import { errorHandler } from './middleware/errorHandler';
import { initSocket } from './services/socketService';

import authRoutes from './routes/authRoutes';
import productRoutes from './routes/productRoutes';
import categoryRoutes from './routes/categoryRoutes';
import cartRoutes from './routes/cartRoutes';
import orderRoutes from './routes/orderRoutes';
import adminRoutes from './routes/adminRoutes';
import reviewRoutes from './routes/reviewRoutes';
import sellerRoutes from './routes/sellerRoutes';
import couponRoutes from './routes/couponRoutes';
import notificationRoutes from './routes/notificationRoutes';
import wishlistRoutes from './routes/wishlistRoutes';
import paymentRoutes from './routes/paymentRoutes';
import currencyRoutes from './routes/currencyRoutes';
import chatbotRoutes from './routes/chatbotRoutes';
import uploadRoutes from './routes/uploadRoutes';

// Load env vars
dotenv.config();

const app: Express = express();
const server = http.createServer(app);

// Initialize Socket.io
initSocket(server);

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/seller', sellerRoutes);
app.use('/api/vendor', sellerRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/currency', currencyRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/upload', uploadRoutes);

app.get('/', (req: Request, res: Response) => {
    res.json({ message: 'Welcome to Martify API' });
});

// Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
    server.listen(PORT, () => {
        console.log(`🚀 Martify server running on port ${PORT}`);
    });
});

export default app;
