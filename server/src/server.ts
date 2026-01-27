import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import prisma from './db.js';

// Import routes
import instanceRoutes from './routes/instances.js';
import personRoutes from './routes/people.js';
import projectRoutes from './routes/projects.js';
import workOrderRoutes from './routes/workOrders.js';
import recurringTaskRoutes from './routes/recurringTasks.js';
import quoteRoutes from './routes/quotes.js';
import roleRoutes from './routes/roles.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/instances', instanceRoutes);
app.use('/api/people', personRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/work-orders', workOrderRoutes);
app.use('/api/recurring-tasks', recurringTaskRoutes);
app.use('/api/quotes', quoteRoutes);
app.use('/api/roles', roleRoutes);

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: any) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!', 
    message: err.message 
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});
