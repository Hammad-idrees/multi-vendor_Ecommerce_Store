import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
    name: string;
    email: string;
    password: string;
    role: 'admin' | 'buyer' | 'seller';
    avatar?: string;
    phone?: string;
    address?: string;
    city?: string;
    postalCode?: string;
    country?: string;
    shopName?: string;
    shopDescription?: string;
    isBlocked: boolean;
    googleId?: string;
    matchPassword: (enteredPassword: string) => Promise<boolean>;
}

const UserSchema: Schema = new Schema(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        role: { type: String, enum: ['admin', 'buyer', 'seller'], default: 'buyer' },
        avatar: { type: String, default: '' },
        phone: { type: String },
        address: { type: String },
        city: { type: String },
        postalCode: { type: String },
        country: { type: String },
        shopName: { type: String },
        shopDescription: { type: String },
        isBlocked: { type: Boolean, default: false },
        googleId: { type: String },
    },
    { timestamps: true }
);

// Encrypt password using bcrypt
UserSchema.pre<IUser>('save', async function (next) {
    if (!this.isModified('password')) {
        next();
        return;
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Match user entered password to hashed password in database
UserSchema.methods.matchPassword = async function (enteredPassword: string) {
    return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model<IUser>('User', UserSchema);
