import { Response } from 'express';
import { bookAppointment } from './appointment.controller';
import Appointment from '../models/appointment.model';
import User from '../models/user.model';
import { AuthRequest } from '../middlewares/auth.middleware';

jest.mock('../models/appointment.model');
jest.mock('../models/user.model');

describe('appointment.controller', () => {
  const mockRes = () => {
    const res = {} as Response;
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('rejects non-patient users', async () => {
    const req = {
      body: { doctorId: 'doc-1', scheduledAt: '2026-04-30T10:00:00.000Z' },
      user: { _id: 'admin-1', role: 'admin' },
    } as unknown as AuthRequest;

    const res = mockRes();

    await expect(bookAppointment(req, res)).rejects.toThrow('Only patients can book appointments');
  });

  it('rejects when slot is already booked', async () => {
    const req = {
      body: { doctorId: 'doc-1', scheduledAt: '2026-04-30T10:00:00.000Z' },
      user: { _id: 'patient-1', role: 'patient' },
    } as unknown as AuthRequest;

    const res = mockRes();

    (User.findById as jest.Mock).mockResolvedValue({ _id: 'doc-1', role: 'doctor' });
    (Appointment.findOne as jest.Mock).mockResolvedValue({ _id: 'appointment-1' });

    await expect(bookAppointment(req, res)).rejects.toThrow('This slot is already booked');
  });
});
