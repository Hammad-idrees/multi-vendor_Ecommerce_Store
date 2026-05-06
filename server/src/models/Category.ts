import mongoose, { Schema, Document } from 'mongoose';

export interface ICategory extends Document {
    name: string;
    description?: string;
    image?: string;
    parent?: mongoose.Types.ObjectId;
}

const CategorySchema: Schema = new Schema(
    {
        name: { type: String, required: true, unique: true },
        description: { type: String },
        image: { type: String },
        parent: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null },
    },
    { timestamps: true }
);

export default mongoose.model<ICategory>('Category', CategorySchema);
