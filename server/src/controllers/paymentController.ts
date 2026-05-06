import { Request, Response } from 'express';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
    apiVersion: '2025-03-31.basil' as any,
});

// @desc    Create payment intent
// @route   POST /api/payment/create-intent
// @access  Private
export const createPaymentIntent = async (req: Request, res: Response): Promise<void> => {
    try {
        const { amount, currency = 'usd' } = req.body;

        if (!amount || amount <= 0) {
            res.status(400).json({ message: 'Invalid amount' });
            return;
        }

        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount * 100), // Stripe expects cents
            currency,
            automatic_payment_methods: {
                enabled: true,
            },
        });

        res.json({
            clientSecret: paymentIntent.client_secret,
            paymentIntentId: paymentIntent.id,
        });
    } catch (error: any) {
        console.error('Stripe error:', error);
        // Fallback to mock payment if Stripe isn't configured
        res.json({
            clientSecret: `mock_secret_${Date.now()}`,
            paymentIntentId: `mock_pi_${Date.now()}`,
            mock: true,
        });
    }
};

// @desc    Get Stripe publishable key
// @route   GET /api/payment/config
// @access  Public
export const getPaymentConfig = async (req: Request, res: Response): Promise<void> => {
    res.json({
        publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || '',
    });
};
