import mongoose, { Schema, Document } from 'mongoose';

export interface IReview extends Document {
    user: mongoose.Types.ObjectId;
    product: mongoose.Types.ObjectId;
    rating: number;
    comment: string;
}

const ReviewSchema: Schema = new Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
        rating: { type: Number, required: true, min: 1, max: 5 },
        comment: { type: String, required: true },
    },
    { timestamps: true }
);

export default mongoose.model<IReview>('Review', ReviewSchema);
