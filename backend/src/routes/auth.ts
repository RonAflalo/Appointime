import express from 'express';
import { PrismaClient, Prisma } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';

const router = express.Router();
const prisma = new PrismaClient();

// Register new user
router.post('/register', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('full_name').notEmpty(),
  body('is_admin').isBoolean(),
  body('business_name').optional(),
  body('registration_code').optional()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, full_name, is_admin, business_name, registration_code } = req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    try {
      if (is_admin) {
        // Create business if business_name is provided
        let businessId: string | null = null;
        if (business_name) {
          const business = await prisma.business.create({
            data: {
              name: business_name,
              slug: business_name.toLowerCase().replace(/\s+/g, '-'),
              registration_code: Math.random().toString(36).substring(2, 8).toUpperCase()
            }
          });
          businessId = business.id;
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user (admin)
        const user = await prisma.user.create({
          data: {
            email,
            password: hashedPassword,
            full_name,
            role: 'admin',
            businessId
          },
          include: {
            business: true
          }
        });

        // Generate JWT token
        const token = jwt.sign(
          { 
            id: user.id, 
            email: user.email, 
            role: user.role,
            businessId: user.businessId 
          },
          process.env.JWT_SECRET || 'your-secret-key',
          { expiresIn: '24h' }
        );

        // Return user data without sensitive information
        return res.status(201).json({
          token,
          user: {
            id: user.id,
            email: user.email,
            full_name: user.full_name,
            role: user.role,
            businessId: user.businessId,
            business: user.business
          }
        });
      } else {
        // Create customer (non-admin)
        if (!registration_code) {
          return res.status(400).json({ message: 'Registration code is required for customer registration' });
        }

        // Find business by registration code
        const business = await prisma.business.findUnique({
          where: { registration_code },
          include: {
            users: {
              take: 1
            }
          }
        });

        if (!business) {
          return res.status(400).json({ message: 'Invalid registration code' });
        }

        if (!business.users || business.users.length === 0) {
          return res.status(400).json({ message: 'No manager found for this business' });
        }

        // Create customer
        const customer = await prisma.customer.create({
          data: {
            full_name,
            email,
            phone: null,
            businessId: business.id,
            managerId: business.users[0].id, // Link to the first user (manager) of the business
            createdAt: new Date(),
            updatedAt: new Date()
          }
        });

        // Return customer data
        return res.status(201).json({
          customer: {
            id: customer.id,
            full_name: customer.full_name,
            email: customer.email,
            phone: customer.phone,
            businessId: customer.businessId,
            managerId: customer.managerId,
            createdAt: customer.createdAt,
            updatedAt: customer.updatedAt
          }
        });
      }
    } catch (error) {
      console.error('Transaction error:', error);
      res.status(500).json({ 
        message: 'Transaction failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      message: 'Registration failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Login user
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        business: true
      }
    });

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        role: user.role,
        businessId: user.businessId 
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        businessId: user.businessId,
        business: user.business
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      message: 'Login failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router; 