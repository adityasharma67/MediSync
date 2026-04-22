import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import timelineService from '../services/timeline.service';

export const getMyTimeline = async (req: AuthRequest, res: Response) => {
  const timeline = await timelineService.getPatientTimeline(req.user._id.toString());
  res.json(timeline);
};
