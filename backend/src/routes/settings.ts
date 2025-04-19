import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

interface AuthUser {
  id: string;
  role: string;
  businessId?: string;
}

// Get settings
router.get('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const user = req.user as AuthUser;
    if (!user.businessId) {
      return res.status(400).json({ message: 'User must be associated with a business' });
    }

    const settings = await prisma.siteSettings.findUnique({
      where: { businessId: user.businessId }
    });

    if (!settings) {
      // Create default settings if none exist
      const defaultSettings = await prisma.siteSettings.create({
        data: {
          businessId: user.businessId,
          working_hours: {},
          timezone: 'Asia/Jerusalem',
          language: 'he',
          theme: {}
        }
      });
      return res.json(defaultSettings);
    }

    res.json(settings);
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ message: 'Error fetching settings' });
  }
});

// Update settings
router.put('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const user = req.user as AuthUser;
    if (!user.businessId) {
      return res.status(400).json({ message: 'User must be associated with a business' });
    }

    const { working_hours, timezone, language, theme } = req.body;

    const settings = await prisma.siteSettings.upsert({
      where: { businessId: user.businessId },
      update: {
        working_hours,
        timezone,
        language,
        theme
      },
      create: {
        businessId: user.businessId,
        working_hours,
        timezone,
        language,
        theme
      }
    });

    res.json(settings);
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ message: 'Error updating settings' });
  }
});

export default router; 