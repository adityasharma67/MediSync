import express from 'express';
import { getNotifications, markAsRead, clearNotifications } from '../controllers/notification.controller';
import { protect } from '../middlewares/auth.middleware';

const router = express.Router();

const asyncHandler = (fn: any) => (req: express.Request, res: express.Response, next: express.NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

router.get('/', protect, asyncHandler(getNotifications));
router.put('/:id', protect, asyncHandler(markAsRead));
router.delete('/', protect, asyncHandler(clearNotifications));

export default router;
