import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

const generateToken = (id: mongoose.Types.ObjectId | string): string => {
  const secret: jwt.Secret = process.env.JWT_SECRET || 'fallback_secret';
  const expiresIn = (process.env.JWT_EXPIRES_IN || '30d') as jwt.SignOptions['expiresIn'];
  
  return jwt.sign(
    { id: id.toString() }, 
    secret, 
    { expiresIn }
  );
};

export default generateToken;
