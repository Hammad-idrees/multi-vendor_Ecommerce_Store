import mongoose, { Schema, Document } from 'mongoose';

export interface ICoupon extends Document {
    code: string;
    discountType: 'percentage' | 'fixed';
    discountValue: number;
    minOrderAmount: number;
    maxUses: number;
    usedCount: number;
    expiresAt: Date;
    isActive: boolean;
    createdBy: mongoose.Types.ObjectId;
}

const CouponSchema: Schema = new Schema(
    {
        code: { type: String, required: true, unique: true, uppercase: true },
        discountType: { type: String, enum: ['percentage', 'fixed'], required: true },
        discountValue: { type: Number, required: true },
        minOrderAmount: { type: Number, default: 0 },
        maxUses: { type: Number, default: 100 },
        usedCount: { type: Number, default: 0 },
        expiresAt: { type: Date, required: true },
        isActive: { type: Boolean, default: true },
        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    },
    { timestamps: true }
);

export default mongoose.model<ICoupon>('Coupon', CouponSchema);
