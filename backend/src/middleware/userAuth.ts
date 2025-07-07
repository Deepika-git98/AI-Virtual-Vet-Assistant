import jwt from 'jsonwebtoken';
import { Request, RequestHandler } from 'express';

interface AuthRequest extends Request {
  userId?: string;
}

// Middleware to authenticate JWT token
export const authenticateToken: RequestHandler = (req, res, next): void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({ error: 'Access token required' });
    return;
  }

  jwt.verify(token, process.env.JWT_SECRET!, (err, decoded: any) => {
    console.log('TOKEN:', token);
    if (err) return res.status(403).json({ error: 'Invalid token' });
    (req as AuthRequest).userId = decoded.userId;
    next();
  });
};
