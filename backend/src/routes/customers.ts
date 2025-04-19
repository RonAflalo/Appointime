import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth';
import { body, validationResult } from 'express-validator';

const router = express.Router();
const prisma = new PrismaClient();

// Get all customers
router.get('/', authenticate, async (req: AuthRequest, res) => {
  try {
    // Get the current user with their business
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      include: { business: true }
    });

    if (!user || !user.businessId) {
      return res.status(403).json({ message: 'User is not associated with a business' });
    }

    const customers = await prisma.customer.findMany({
      where: {
        businessId: user.businessId
      },
      include: {
        business: true,
        appointments: {
          include: {
            service: true,
            user: true
          }
        },
        reviews: true
      }
    });

    console.log('Found customers:', customers); // Add logging to debug
    res.json(customers);
  } catch (error) {
    console.error('Error fetching customers:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get customer by ID
router.get('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    // Get the current user with their business
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      include: { business: true }
    });

    if (!user || !user.businessId) {
      return res.status(403).json({ message: 'User is not associated with a business' });
    }

    const customer = await prisma.customer.findUnique({
      where: { 
        id: req.params.id,
        businessId: user.businessId
      },
      include: {
        appointments: {
          include: {
            service: true,
            user: true
          }
        },
        reviews: true
      }
    });

    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    res.json(customer);
  } catch (error) {
    console.error('Error fetching customer:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create customer
router.post('/', [
  authenticate,
  body('full_name').notEmpty().trim(),
  body('email').optional().isEmail().normalizeEmail(),
  body('phone').optional().trim()
], async (req: AuthRequest, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Get the current user with their business
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      include: { business: true }
    });

    if (!user || !user.businessId) {
      return res.status(403).json({ message: 'User is not associated with a business' });
    }

    const { full_name, email, phone } = req.body;

    console.log('Creating customer with business ID:', user.businessId); // Add logging

    const customer = await prisma.customer.create({
      data: {
        full_name,
        email,
        phone,
        businessId: user.businessId // Use direct businessId assignment
      },
      include: {
        business: true
      }
    });

    console.log('Created customer:', customer); // Add logging
    res.status(201).json(customer);
  } catch (error) {
    console.error('Error creating customer:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update customer
router.put('/:id', [
  authenticate,
  body('full_name').optional().trim(),
  body('email').optional().isEmail().normalizeEmail(),
  body('phone').optional().trim()
], async (req: AuthRequest, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Get the current user with their business
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      include: { business: true }
    });

    if (!user || !user.businessId) {
      return res.status(403).json({ message: 'User is not associated with a business' });
    }

    const { full_name, email, phone } = req.body;

    const customer = await prisma.customer.update({
      where: { 
        id: req.params.id,
        businessId: user.businessId
      },
      data: {
        full_name,
        email,
        phone
      }
    });

    res.json(customer);
  } catch (error) {
    console.error('Error updating customer:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete customer
router.delete('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    // Get the current user with their business
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      include: { business: true }
    });

    if (!user || !user.businessId) {
      return res.status(403).json({ message: 'User is not associated with a business' });
    }

    await prisma.customer.delete({
      where: { 
        id: req.params.id,
        businessId: user.businessId
      }
    });

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting customer:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router; 