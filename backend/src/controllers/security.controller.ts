import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import securityService from '../services/security.service';

export const setupTwoFactor = async (req: AuthRequest, res: Response) => {
  const setup = await securityService.setupTwoFactor(req.user._id.toString());
  res.json(setup);
};

export const enableTwoFactor = async (req: AuthRequest, res: Response) => {
  const result = await securityService.enableTwoFactor(req.user._id.toString(), req.body.code);
  res.json(result);
};

export const getSessions = async (req: AuthRequest, res: Response) => {
  const sessions = await securityService.listSessions(req.user._id.toString());
  res.json(sessions);
};
