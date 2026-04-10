import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

export const authMiddleware = (req) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.replace('Bearer ', '');

  if (!token) {
    return { user: null };
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'SECRET');
    return { user: decoded };
  } catch (err) {
    console.error('JWT Verification Error:', err.message);
    return { user: null };
  }
};