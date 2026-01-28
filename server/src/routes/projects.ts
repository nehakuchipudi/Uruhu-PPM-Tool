import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import prisma from '../db.js';

interface IdParam {
  id: string;
}

interface ProjectsQuerystring {
  instanceId?: string;
  status?: string;
}

interface CreateProjectBody {
  name: string;
  description?: string;
  instanceId: string;
  customerName?: string;
  status?: string;
  startDate: string;
  endDate: string;
  budget?: number;
  progress?: number;
  priority?: string;
  assignedTo?: string[];
}

interface UpdateProjectBody {
  name?: string;
  description?: string;
  customerName?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  budget?: number;
  progress?: number;
  priority?: string;
}

export default async function projectRoutes(fastify: FastifyInstance) {
  // Get all projects (optionally filtered by instance)
  fastify.get<{ Querystring: ProjectsQuerystring }>(
    '/',
    async (request: FastifyRequest<{ Querystring: ProjectsQuerystring }>, reply: FastifyReply) => {
      try {
        const { instanceId, status } = request.query;
        const where: any = {};

        if (instanceId) where.instanceId = instanceId as string;
        if (status) where.status = status as string;

        const projects = await prisma.project.findMany({
          where,
          include: {
            assignments: {
              include: {
                person: true,
              },
            },
            tasks: true,
            workOrders: true,
            _count: {
              select: {
                tasks: true,
                workOrders: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        });
        return projects;
      } catch (error) {
        reply.status(500).send({ error: 'Failed to fetch projects' });
      }
    }
  );

  // Get project by ID
  fastify.get<{ Params: IdParam }>(
    '/:id',
    async (request: FastifyRequest<{ Params: IdParam }>, reply: FastifyReply) => {
      try {
        const { id } = request.params;
        const project = await prisma.project.findUnique({
          where: { id },
          include: {
            instance: true,
            assignments: {
              include: {
                person: true,
              },
            },
            tasks: {
              include: {
                assignments: {
                  include: {
                    person: true,
                  },
                },
              },
            },
            workOrders: true,
          },
        });

        if (!project) {
          return reply.status(404).send({ error: 'Project not found' });
        }

        return project;
      } catch (error) {
        reply.status(500).send({ error: 'Failed to fetch project' });
      }
    }
  );

  // Create project
  fastify.post<{ Body: CreateProjectBody }>(
    '/',
    async (request: FastifyRequest<{ Body: CreateProjectBody }>, reply: FastifyReply) => {
      try {
        const {
          name,
          description,
          instanceId,
          customerName,
          status,
          startDate,
          endDate,
          budget,
          progress,
          priority,
          assignedTo,
        } = request.body;

        const project = await prisma.project.create({
          data: {
            name,
            description,
            instanceId,
            customerName,
            status: status || 'planning',
            startDate: new Date(startDate),
            endDate: new Date(endDate),
            budget,
            progress: progress || 0,
            priority: priority || 'medium',
            assignments: {
              create: (assignedTo || []).map((personId: string) => ({
                personId,
              })),
            },
          },
          include: {
            assignments: {
              include: {
                person: true,
              },
            },
          },
        });

        return reply.status(201).send(project);
      } catch (error) {
        reply.status(500).send({ error: 'Failed to create project' });
      }
    }
  );

  // Update project
  fastify.put<{ Params: IdParam; Body: UpdateProjectBody }>(
    '/:id',
    async (
      request: FastifyRequest<{ Params: IdParam; Body: UpdateProjectBody }>,
      reply: FastifyReply
    ) => {
      try {
        const { id } = request.params;
        const {
          name,
          description,
          customerName,
          status,
          startDate,
          endDate,
          budget,
          progress,
          priority,
        } = request.body;

        const project = await prisma.project.update({
          where: { id },
          data: {
            name,
            description,
            customerName,
            status,
            startDate: startDate ? new Date(startDate) : undefined,
            endDate: endDate ? new Date(endDate) : undefined,
            budget,
            progress,
            priority,
          },
          include: {
            assignments: {
              include: {
                person: true,
              },
            },
          },
        });

        return project;
      } catch (error) {
        reply.status(500).send({ error: 'Failed to update project' });
      }
    }
  );

  // Delete project
  fastify.delete<{ Params: IdParam }>(
    '/:id',
    async (request: FastifyRequest<{ Params: IdParam }>, reply: FastifyReply) => {
      try {
        const { id } = request.params;
        await prisma.project.delete({
          where: { id },
        });
        return { message: 'Project deleted successfully' };
      } catch (error) {
        reply.status(500).send({ error: 'Failed to delete project' });
      }
    }
  );
}
