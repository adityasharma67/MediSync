import { Response } from 'express';
import { bookAppointment } from './appointment.controller';
import Appointment from '../models/appointment.model';
import { AuthRequest } from '../middlewares/auth.middleware';

jest.mock('../models/appointment.model');

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
      body: { doctorId: 'doc-1', date: '2026-04-30', time: '10:00' },
      user: { _id: 'admin-1', role: 'admin' },
    } as unknown as AuthRequest;

    const res = mockRes();

    await expect(bookAppointment(req, res)).rejects.toThrow('Only patients can book appointments');
  });

  it('rejects when slot is already booked', async () => {
    const req = {
      body: { doctorId: 'doc-1', date: '2026-04-30', time: '10:00' },
      user: { _id: 'patient-1', role: 'patient' },
    } as unknown as AuthRequest;

    const res = mockRes();

    (Appointment.findOneAndUpdate as jest.Mock).mockResolvedValue({
      lastErrorObject: {},
      value: null,
    });

    await expect(bookAppointment(req, res)).rejects.toThrow('This slot is already booked');
  });
});
