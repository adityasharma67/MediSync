import { Request, Response } from 'express';
import { authUser } from './auth.controller';
import User from '../models/user.model';
import AuthService from '../services/auth.service';

jest.mock('../models/user.model');
jest.mock('../services/auth.service');

describe('auth.controller', () => {
  const mockRes = () => {
    const res = {} as Response;
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('returns 401 for invalid credentials', async () => {
    const req = {
      body: { email: 'demo@demo.com', password: 'wrong' },
    } as Request;
    const res = mockRes();

    (User.findOne as jest.Mock).mockResolvedValue(null);

    await expect(authUser(req, res)).rejects.toThrow('Invalid email or password');
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('returns access and refresh tokens for valid credentials', async () => {
    const req = {
      body: { email: 'demo@demo.com', password: 'ValidPass123!' },
    } as Request;
    const res = mockRes();

    const save = jest.fn().mockResolvedValue(undefined);
    const user = {
      _id: 'user-id',
      email: 'demo@demo.com',
      name: 'Demo',
      role: 'patient',
      avatar: '',
      matchPassword: jest.fn().mockResolvedValue(true),
      save,
    };

    (User.findOne as jest.Mock).mockReturnValue({
      select: jest.fn().mockResolvedValue(user),
    });

    (AuthService.generateAccessToken as jest.Mock).mockReturnValue('access-token');
    (AuthService.generateRefreshToken as jest.Mock).mockReturnValue('refresh-token');
    (AuthService.hashToken as jest.Mock).mockReturnValue('hashed-refresh-token');

    await authUser(req, res);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      })
    );
  });
});
