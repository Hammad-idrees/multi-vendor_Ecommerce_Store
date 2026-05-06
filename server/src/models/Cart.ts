import mongoose, { Schema, Document } from 'mongoose';

export interface ICart extends Document {
    user: mongoose.Types.ObjectId;
    items: Array<{
        product: mongoose.Types.ObjectId;
        variant?: { size: string; color: string };
        quantity: number;
        selected?: boolean;
    }>;
}

const CartSchema: Schema = new Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
        items: [
            {
                product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
                variant: {
                    size: { type: String },
                    color: { type: String },
                },
                quantity: { type: Number, required: true, default: 1 },
                selected: { type: Boolean, default: true },
            },
        ],
    },
    { timestamps: true }
);

export default mongoose.model<ICart>('Cart', CartSchema);
