import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import prisma from '../db.js';

interface IdParam {
  id: string;
}

interface CreateInstanceBody {
  name: string;
  logo?: string;
  primaryColor?: string;
  workflowEnabled?: boolean;
  customFields?: any[];
}

interface UpdateInstanceBody {
  name?: string;
  logo?: string;
  primaryColor?: string;
  workflowEnabled?: boolean;
  customFields?: any[];
}

export default async function instanceRoutes(fastify: FastifyInstance) {
  // Get all instances
  fastify.get('/', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const instances = await prisma.instance.findMany({
        include: {
          _count: {
            select: {
              people: true,
              projects: true,
              workOrders: true,
            },
          },
        },
      });
      return instances;
    } catch (error) {
      reply.status(500).send({ error: 'Failed to fetch instances' });
    }
  });

  // Get instance by ID
  fastify.get<{ Params: IdParam }>(
    '/:id',
    async (request: FastifyRequest<{ Params: IdParam }>, reply: FastifyReply) => {
      try {
        const { id } = request.params;
        const instance = await prisma.instance.findUnique({
          where: { id },
          include: {
            people: true,
            roles: true,
            projects: true,
          },
        });

        if (!instance) {
          return reply.status(404).send({ error: 'Instance not found' });
        }

        return instance;
      } catch (error) {
        reply.status(500).send({ error: 'Failed to fetch instance' });
      }
    }
  );

  // Create instance
  fastify.post<{ Body: CreateInstanceBody }>(
    '/',
    async (request: FastifyRequest<{ Body: CreateInstanceBody }>, reply: FastifyReply) => {
      try {
        const { name, logo, primaryColor, workflowEnabled, customFields } = request.body;
        const instance = await prisma.instance.create({
          data: {
            name,
            logo,
            primaryColor,
            workflowEnabled: workflowEnabled ?? true,
            customFields: customFields || [],
          },
        });
        return reply.status(201).send(instance);
      } catch (error) {
        reply.status(500).send({ error: 'Failed to create instance' });
      }
    }
  );

  // Update instance
  fastify.put<{ Params: IdParam; Body: UpdateInstanceBody }>(
    '/:id',
    async (
      request: FastifyRequest<{ Params: IdParam; Body: UpdateInstanceBody }>,
      reply: FastifyReply
    ) => {
      try {
        const { id } = request.params;
        const { name, logo, primaryColor, workflowEnabled, customFields } = request.body;

        const instance = await prisma.instance.update({
          where: { id },
          data: {
            name,
            logo,
            primaryColor,
            workflowEnabled,
            customFields,
          },
        });

        return instance;
      } catch (error) {
        reply.status(500).send({ error: 'Failed to update instance' });
      }
    }
  );

  // Delete instance
  fastify.delete<{ Params: IdParam }>(
    '/:id',
    async (request: FastifyRequest<{ Params: IdParam }>, reply: FastifyReply) => {
      try {
        const { id } = request.params;
        await prisma.instance.delete({
          where: { id },
        });
        return { message: 'Instance deleted successfully' };
      } catch (error) {
        reply.status(500).send({ error: 'Failed to delete instance' });
      }
    }
  );
}
