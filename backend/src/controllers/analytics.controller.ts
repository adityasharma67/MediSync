import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import analyticsService from '../services/analytics.service';

export const getAnalyticsDashboard = async (req: AuthRequest, res: Response) => {
  const analytics = await analyticsService.getDashboard();
  res.json(analytics);
};
