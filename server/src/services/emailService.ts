import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

export const sendEmail = async (to: string, subject: string, html: string) => {
    try {
        const info = await transporter.sendMail({
            from: `"Martify" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            html,
        });
        return info;
    } catch (error) {
        console.error('Email send error:', error);
        throw error;
    }
};

export const sendOrderConfirmation = async (to: string, orderId: string, total: number) => {
    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
                <h1 style="color: white; margin: 0;">Martify</h1>
            </div>
            <div style="padding: 30px; background: #f9fafb;">
                <h2>Order Confirmed! 🎉</h2>
                <p>Your order <strong>#${orderId.slice(-8).toUpperCase()}</strong> has been placed successfully.</p>
                <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <p style="margin: 0;"><strong>Total:</strong> $${total.toFixed(2)}</p>
                </div>
                <p>We'll notify you when your order ships. Thank you for shopping with Martify!</p>
            </div>
        </div>
    `;
    return sendEmail(to, `Order Confirmed - #${orderId.slice(-8).toUpperCase()}`, html);
};

export const sendStatusUpdate = async (to: string, orderId: string, status: string) => {
    const statusEmoji: Record<string, string> = {
        Processing: '⚙️',
        Shipped: '🚚',
        Delivered: '✅',
        Cancelled: '❌',
    };
    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
                <h1 style="color: white; margin: 0;">Martify</h1>
            </div>
            <div style="padding: 30px; background: #f9fafb;">
                <h2>Order Update ${statusEmoji[status] || '📦'}</h2>
                <p>Your order <strong>#${orderId.slice(-8).toUpperCase()}</strong> status has been updated to:</p>
                <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
                    <h3 style="color: #667eea; margin: 0;">${status}</h3>
                </div>
            </div>
        </div>
    `;
    return sendEmail(to, `Order ${status} - #${orderId.slice(-8).toUpperCase()}`, html);
};
