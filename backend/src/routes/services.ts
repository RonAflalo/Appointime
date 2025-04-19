import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, isAdmin, AuthRequest } from '../middleware/auth';
import { body, validationResult } from 'express-validator';

const router = express.Router();
const prisma = new PrismaClient();

// Get all services
router.get('/', async (req: AuthRequest, res) => {
  try {
    const services = await prisma.service.findMany();
    res.json(services);
  } catch (error) {
    console.error('Error fetching services:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get service by ID
router.get('/:id', async (req: AuthRequest, res) => {
  try {
    const service = await prisma.service.findUnique({
      where: { id: req.params.id }
    });

    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    res.json(service);
  } catch (error) {
    console.error('Error fetching service:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create service (admin only)
router.post('/', [
  authenticate,
  isAdmin,
  body('name').notEmpty().trim(),
  body('description').optional().trim(),
  body('duration').isInt({ min: 1 }),
  body('price').isFloat({ min: 0 })
], async (req: AuthRequest, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, description, duration, price } = req.body;

    const service = await prisma.service.create({
      data: {
        name,
        description,
        duration,
        price
      }
    });

    res.status(201).json(service);
  } catch (error) {
    console.error('Error creating service:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update service (admin only)
router.put('/:id', [
  authenticate,
  isAdmin,
  body('name').optional().trim(),
  body('description').optional().trim(),
  body('duration').optional().isInt({ min: 1 }),
  body('price').optional().isFloat({ min: 0 })
], async (req: AuthRequest, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, description, duration, price } = req.body;

    const service = await prisma.service.update({
      where: { id: req.params.id },
      data: {
        name,
        description,
        duration,
        price
      }
    });

    res.json(service);
  } catch (error) {
    console.error('Error updating service:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete service (admin only)
router.delete('/:id', [authenticate, isAdmin], async (req: AuthRequest, res) => {
  try {
    await prisma.service.delete({
      where: { id: req.params.id }
    });

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting service:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router; 