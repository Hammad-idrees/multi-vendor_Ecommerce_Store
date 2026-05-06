import mongoose, { Schema, Document } from 'mongoose';

export interface INotification extends Document {
    user: mongoose.Types.ObjectId;
    title: string;
    message: string;
    type: 'order' | 'system' | 'promotion' | 'review';
    isRead: boolean;
    link?: string;
}

const NotificationSchema: Schema = new Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        title: { type: String, required: true },
        message: { type: String, required: true },
        type: { type: String, enum: ['order', 'system', 'promotion', 'review'], default: 'system' },
        isRead: { type: Boolean, default: false },
        link: { type: String },
    },
    { timestamps: true }
);

export default mongoose.model<INotification>('Notification', NotificationSchema);
