import Fastify from 'fastify';
import cors from '@fastify/cors';
import multipart from '@fastify/multipart';
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

const PORT = parseInt(process.env.PORT || '3001', 10);
const HOST = process.env.HOST || '0.0.0.0';

const fastify = Fastify({
  logger: {
    level: process.env.LOG_LEVEL || 'info',
    transport: process.env.NODE_ENV === 'development'
      ? { target: 'pino-pretty' }
      : undefined
  }
});

// Register plugins
await fastify.register(cors, {
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
});

await fastify.register(multipart, {
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  }
});

// Health check
fastify.get('/health', async (request, reply) => {
  return { status: 'ok', timestamp: new Date().toISOString() };
});

// Register API routes
await fastify.register(instanceRoutes, { prefix: '/api/instances' });
await fastify.register(personRoutes, { prefix: '/api/people' });
await fastify.register(projectRoutes, { prefix: '/api/projects' });
await fastify.register(workOrderRoutes, { prefix: '/api/work-orders' });
await fastify.register(recurringTaskRoutes, { prefix: '/api/recurring-tasks' });
await fastify.register(quoteRoutes, { prefix: '/api/quotes' });
await fastify.register(roleRoutes, { prefix: '/api/roles' });

// Global error handler
fastify.setErrorHandler((error, request, reply) => {
  fastify.log.error(error);

  reply.status(error.statusCode || 500).send({
    error: 'Something went wrong!',
    message: error.message,
    statusCode: error.statusCode || 500
  });
});

// Graceful shutdown
const closeGracefully = async (signal: string) => {
  fastify.log.info(`Received ${signal}, closing gracefully...`);
  await prisma.$disconnect();
  await fastify.close();
  process.exit(0);
};

process.on('SIGINT', () => closeGracefully('SIGINT'));
process.on('SIGTERM', () => closeGracefully('SIGTERM'));

// Start server
try {
  await fastify.listen({ port: PORT, host: HOST });
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
} catch (err) {
  fastify.log.error(err);
  process.exit(1);
}
