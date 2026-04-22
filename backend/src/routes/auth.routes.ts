import express from 'express';
import { authUser, registerUser, googleAuth } from '../controllers/auth.controller';

const router = express.Router();

// Wrap async handlers to catch errors and pass them to error middleware
const asyncHandler = (fn: any) => (req: express.Request, res: express.Response, next: express.NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

router.post('/signup', asyncHandler(registerUser));
router.post('/login', asyncHandler(authUser));
router.post('/google', asyncHandler(googleAuth));

export default router;
