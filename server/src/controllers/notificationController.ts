import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import Notification from '../models/Notification';

// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Private
export const getNotifications = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const notifications = await Notification.find({ user: req.user!._id })
            .sort({ createdAt: -1 })
            .limit(50);
        res.json(notifications);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
export const markAsRead = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const notification = await Notification.findById(req.params.id);

        if (!notification) {
            res.status(404).json({ message: 'Notification not found' });
            return;
        }

        if (notification.user.toString() !== req.user!._id.toString()) {
            res.status(403).json({ message: 'Not authorized' });
            return;
        }

        notification.isRead = true;
        await notification.save();
        res.json(notification);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Mark all as read
// @route   PUT /api/notifications/read-all
// @access  Private
export const markAllAsRead = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        await Notification.updateMany(
            { user: req.user!._id, isRead: false },
            { isRead: true }
        );
        res.json({ message: 'All notifications marked as read' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get unread count
// @route   GET /api/notifications/unread-count
// @access  Private
export const getUnreadCount = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const count = await Notification.countDocuments({
            user: req.user!._id,
            isRead: false,
        });
        res.json({ count });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Delete notification
// @route   DELETE /api/notifications/:id
// @access  Private
export const deleteNotification = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const notification = await Notification.findById(req.params.id);
        if (!notification) {
            res.status(404).json({ message: 'Notification not found' });
            return;
        }
        if (notification.user.toString() !== req.user!._id.toString()) {
            res.status(403).json({ message: 'Not authorized' });
            return;
        }
        await notification.deleteOne();
        res.json({ message: 'Notification removed' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// Helper to create notification (used internally)
export const createNotification = async (
    userId: string,
    title: string,
    message: string,
    type: 'order' | 'system' | 'promotion' | 'review' = 'system',
    link?: string
) => {
    try {
        const notification = await Notification.create({
            user: userId,
            title,
            message,
            type,
            link,
        });
        // Emit via socket handled at call site
        return notification;
    } catch (error) {
        console.error('Create notification error:', error);
    }
};
