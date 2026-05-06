import mongoose, { Schema, Document } from 'mongoose';

export interface IProduct extends Document {
    name: string;
    description: string;
    price: number;
    comparePrice?: number;
    stock: number;
    category: mongoose.Types.ObjectId;
    subcategory?: mongoose.Types.ObjectId;
    images: string[];
    variants: Array<{
        size: string;
        color: string;
        stock: number;
    }>;
    averageRating: number;
    numReviews: number;
    seller: mongoose.Types.ObjectId;
    isApproved: boolean;
    isFeatured: boolean;
    tags: string[];
    salesCount: number;
    totalRevenue: number;
}

const ProductSchema: Schema = new Schema(
    {
        name: { type: String, required: true },
        description: { type: String, required: true },
        price: { type: Number, required: true, default: 0 },
        comparePrice: { type: Number },
        stock: { type: Number, required: true, default: 0 },
        category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
        subcategory: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
        images: [{ type: String }],
        variants: [
            {
                size: { type: String },
                color: { type: String },
                stock: { type: Number, default: 0 },
            },
        ],
        averageRating: { type: Number, default: 0 },
        numReviews: { type: Number, default: 0 },
        seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        isApproved: { type: Boolean, default: false },
        isFeatured: { type: Boolean, default: false },
        tags: [{ type: String }],
        salesCount: { type: Number, default: 0 },
        totalRevenue: { type: Number, default: 0 },
    },
    { timestamps: true }
);

// Text index for search
ProductSchema.index({ name: 'text', description: 'text', tags: 'text' });

// Performance indexes
ProductSchema.index({ category: 1 });
ProductSchema.index({ seller: 1 });
ProductSchema.index({ price: 1 });
ProductSchema.index({ isApproved: 1 });
ProductSchema.index({ createdAt: -1 });

export default mongoose.model<IProduct>('Product', ProductSchema);
