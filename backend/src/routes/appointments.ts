import express from 'express';
import { PrismaClient, Prisma } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth';
import { body, validationResult } from 'express-validator';

const router = express.Router();
const prisma = new PrismaClient();

// Get all appointments
router.get('/', authenticate, async (req: AuthRequest, res) => {
  try {
    // Get the current user with their business
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      include: {
        business: true
      }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.businessId) {
      return res.status(403).json({ message: 'User is not associated with a business' });
    }

    const appointments = await prisma.appointment.findMany({
      where: {
        businessId: user.businessId
      },
      include: {
        service: true,
        client: true,
        user: true
      }
    });
    res.json(appointments);
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get appointment by ID
router.get('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const appointment = await prisma.appointment.findUnique({
      where: { id: req.params.id },
      include: {
        service: true,
        client: true,
        user: true
      } as any
    });

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    res.json(appointment);
  } catch (error) {
    console.error('Error fetching appointment:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create appointment
router.post('/', [
  authenticate,
  body('date').isISO8601(),
  body('serviceId').notEmpty(),
  body('clientId').notEmpty(),
  body('notes').optional().trim()
], async (req: AuthRequest, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { date, serviceId, clientId, notes } = req.body;

    const appointment = await prisma.appointment.create({
      data: {
        date: new Date(date),
        status: 'pending',
        notes,
        userId: req.user!.id,
        serviceId,
        clientId
      } as any,
      include: {
        service: true,
        client: true,
        user: true
      } as any
    });

    res.status(201).json(appointment);
  } catch (error) {
    console.error('Error creating appointment:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update appointment
router.put('/:id', [
  authenticate,
  body('date').optional().isISO8601(),
  body('status').optional().isIn(['pending', 'confirmed', 'cancelled', 'completed']),
  body('notes').optional().trim()
], async (req: AuthRequest, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { date, status, notes } = req.body;

    const appointment = await prisma.appointment.update({
      where: { id: req.params.id },
      data: {
        date: date ? new Date(date) : undefined,
        status,
        notes
      },
      include: {
        service: true,
        client: true,
        user: true
      } as any
    });

    res.json(appointment);
  } catch (error) {
    console.error('Error updating appointment:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete appointment
router.delete('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    await prisma.appointment.delete({
      where: { id: req.params.id }
    });

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting appointment:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router; 