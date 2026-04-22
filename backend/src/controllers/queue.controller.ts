import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import queueService from '../services/queue.service';
import { AppError } from '../middlewares/error.middleware';

export const joinWaitlist = async (req: AuthRequest, res: Response) => {
  if (req.user.role !== 'patient') {
    throw new AppError(403, 'Only patients can join the waiting queue');
  }

  const entry = await queueService.joinQueue({
    patientId: req.user._id.toString(),
    doctorId: req.body.doctorId,
    date: req.body.date,
    time: req.body.time,
    symptoms: req.body.symptoms || [],
    priority: req.body.priority || 0,
  });

  const queueState = await queueService.getQueuePosition(entry._id.toString());
  res.status(201).json(queueState);
};

export const getQueueStatus = async (req: AuthRequest, res: Response) => {
  const queueState = await queueService.getQueuePosition(req.params.id);
  res.json(queueState);
};
