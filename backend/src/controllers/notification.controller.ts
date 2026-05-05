import { Router, Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import Notification from '../models/notification.model';
import { AppError } from '../middlewares/error.middleware';

const router = Router();

// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Private
export const getNotifications = async (req: AuthRequest, res: Response) => {
  try {
    const notifications = await Notification.find({ user: req.user!._id })
      .sort({ createdAt: -1 })
      .limit(50);
    
    res.json(notifications);
  } catch (error: any) {
    throw new AppError(500, error.message);
  }
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id
// @access  Private
export const markAsRead = async (req: AuthRequest, res: Response) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { read: true },
      { new: true }
    );
    
    if (!notification) {
      throw new AppError(404, 'Notification not found');
    }
    
    res.json(notification);
  } catch (error: any) {
    throw new AppError(500, error.message);
  }
};

// @desc    Clear all notifications
// @route   DELETE /api/notifications
// @access  Private
export const clearNotifications = async (req: AuthRequest, res: Response) => {
  try {
    await Notification.deleteMany({ user: req.user!._id });
    res.json({ message: 'Notifications cleared' });
  } catch (error: any) {
    throw new AppError(500, error.message);
  }
};

export default router;
