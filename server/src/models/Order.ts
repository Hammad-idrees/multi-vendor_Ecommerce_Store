import mongoose, { Schema, Document } from 'mongoose';

export interface IOrder extends Document {
    user: mongoose.Types.ObjectId;
    items: Array<{
        product: mongoose.Types.ObjectId;
        seller: mongoose.Types.ObjectId;
        name: string;
        price: number;
        quantity: number;
        image: string;
        variant?: { size: string; color: string };
    }>;
    shippingAddress: {
        address: string;
        city: string;
        postalCode: string;
        country: string;
    };
    paymentMethod: string;
    paymentResult?: {
        id: string;
        status: string;
        update_time: string;
        email_address: string;
    };
    totalPrice: number;
    isPaid: boolean;
    paidAt?: Date;
    isDelivered: boolean;
    deliveredAt?: Date;
    status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
    couponCode?: string;
    discountAmount: number;
    displayId: string;
    createdAt: Date;
    updatedAt: Date;
}

const OrderSchema: Schema = new Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        items: [
            {
                product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
                seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
                name: { type: String, required: true },
                price: { type: Number, required: true },
                quantity: { type: Number, required: true },
                image: { type: String, required: true },
                variant: {
                    size: { type: String },
                    color: { type: String },
                },
            },
        ],
        shippingAddress: {
            address: { type: String, required: true },
            city: { type: String, required: true },
            postalCode: { type: String, required: true },
            country: { type: String, required: true },
        },
        paymentMethod: { type: String, required: true },
        paymentResult: {
            id: { type: String },
            status: { type: String },
            update_time: { type: String },
            email_address: { type: String },
        },
        totalPrice: { type: Number, required: true, default: 0.0 },
        isPaid: { type: Boolean, required: true, default: false },
        paidAt: { type: Date },
        isDelivered: { type: Boolean, required: true, default: false },
        deliveredAt: { type: Date },
        status: {
            type: String,
            enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
            default: 'Pending',
        },
        couponCode: { type: String },
        discountAmount: { type: Number, default: 0 },
        displayId: { type: String, required: true, unique: true },
    },
    { timestamps: true }
);

export default mongoose.model<IOrder>('Order', OrderSchema);
