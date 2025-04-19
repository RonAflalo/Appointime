import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth';
import { body, validationResult } from 'express-validator';

const router = express.Router();
const prisma = new PrismaClient();

interface AuthUser {
  id: string;
  role: string;
  businessId?: string;
}

// Get all reviews
router.get('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const user = req.user as AuthUser;
    let where = {};
    
    // If user is admin, only show reviews for their business
    if (user.role === 'admin' && user.businessId) {
      where = {
        customer: {
          businessId: user.businessId
        }
      };
    }

    const reviews = await prisma.review.findMany({
      where,
      include: {
        customer: true,
        user: true
      }
    });
    res.json(reviews);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get review by ID
router.get('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const review = await prisma.review.findUnique({
      where: { id: req.params.id },
      include: {
        customer: true,
        user: true
      }
    });

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    res.json(review);
  } catch (error) {
    console.error('Error fetching review:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create review
router.post('/', [
  authenticate,
  body('rating').isInt({ min: 1, max: 5 }),
  body('comment').optional().trim(),
  body('customerId').notEmpty(),
  body('status').optional().isIn(['pending', 'approved', 'rejected'])
], async (req: AuthRequest, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { rating, comment, customerId, status } = req.body;

    const review = await prisma.review.create({
      data: {
        rating,
        comment,
        status: status || 'pending',
        user_id: req.user!.id,
        customer_id: customerId
      } as any,
      include: {
        customer: true,
        user: true
      }
    });

    res.status(201).json(review);
  } catch (error) {
    console.error('Error creating review:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update review
router.put('/:id', [
  authenticate,
  body('rating').optional().isInt({ min: 1, max: 5 }),
  body('comment').optional().trim()
], async (req: AuthRequest, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { rating, comment } = req.body;

    const review = await prisma.review.update({
      where: { id: req.params.id },
      data: {
        rating,
        comment
      },
      include: {
        customer: true,
        user: true
      }
    });

    res.json(review);
  } catch (error) {
    console.error('Error updating review:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete review
router.delete('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    await prisma.review.delete({
      where: { id: req.params.id }
    });

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router; 