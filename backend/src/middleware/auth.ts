import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface AuthRequest extends Request {
  user?: {
    id: string;
    role: string;
    businessId?: string;
  };
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      id: string;
      role: string;
      businessId?: string;
    };

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      include: { business: true }
    });

    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    req.user = {
      id: user.id,
      role: user.role,
      businessId: user.businessId || undefined
    };

    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

export const isAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied' });
  }
  next();
}; 