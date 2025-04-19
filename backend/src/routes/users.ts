import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, isAdmin, AuthRequest } from '../middleware/auth';
import { body, validationResult } from 'express-validator';

const router = express.Router();
const prisma = new PrismaClient();

// Get current user
router.get('/me', authenticate, async (req: AuthRequest, res) => {
  try {
    const user = await prisma.$queryRaw`
      SELECT 
        u.id, 
        u.email, 
        u.full_name, 
        u.phone, 
        u.role,
        b.id as business_id,
        b.name as business_name,
        b.slug as business_slug,
        b.registration_code as business_registration_code,
        b.description as business_description,
        b.logo as business_logo,
        b.phone as business_phone,
        b.email as business_email,
        b.address as business_address
      FROM "User" u
      LEFT JOIN "Business" b ON u."businessId" = b.id
      WHERE u.id = ${req.user!.id}
    `;

    if (!user || !user[0]) {
      return res.status(404).json({ message: 'User not found' });
    }

    const userData = user[0];
    const business = userData.business_id ? {
      id: userData.business_id,
      name: userData.business_name,
      slug: userData.business_slug,
      registration_code: userData.business_registration_code,
      description: userData.business_description,
      logo: userData.business_logo,
      phone: userData.business_phone,
      email: userData.business_email,
      address: userData.business_address
    } : null;

    res.json({
      id: userData.id,
      full_name: userData.full_name,
      phone: userData.phone || '',
      email: userData.email,
      role: userData.role,
      business
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update current user
router.put('/me', [
  authenticate,
  body('name').optional().trim(),
  body('email').optional().isEmail().normalizeEmail()
], async (req: AuthRequest, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email } = req.body;
    const user = await prisma.user.update({
      where: { id: req.user!.id },
      data: { full_name: name, email },
      select: {
        id: true,
        email: true,
        full_name: true,
        role: true
      }
    });
    res.json(user);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router; 