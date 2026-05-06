import mongoose, { Schema, Document } from 'mongoose';

export interface IWishlist extends Document {
    user: mongoose.Types.ObjectId;
    products: mongoose.Types.ObjectId[];
}

const WishlistSchema: Schema = new Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
        products: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
    },
    { timestamps: true }
);

export default mongoose.model<IWishlist>('Wishlist', WishlistSchema);
