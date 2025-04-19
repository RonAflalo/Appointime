import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { PrismaClient } from '@prisma/client';
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import serviceRoutes from './routes/services';
import appointmentRoutes from './routes/appointments';
import customerRoutes from './routes/customers';
import reviewRoutes from './routes/reviews';
import settingsRoutes from './routes/settings';

const prisma = new PrismaClient();
const app = express();

// Middleware
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(morgan('dev'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/settings', settingsRoutes);

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app; 