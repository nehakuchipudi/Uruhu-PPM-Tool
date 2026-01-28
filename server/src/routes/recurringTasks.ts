import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import prisma from '../db.js';

interface IdParam {
  id: string;
}

interface RecurringTasksQuerystring {
  instanceId?: string;
}

interface CreateRecurringTaskBody {
  instanceId: string;
  projectId?: string;
  customerName?: string;
  title: string;
  description?: string;
  frequency: string;
  frequencyDetails?: any;
  startDate: string;
  endDate?: string;
  estimatedDuration?: number;
  activityLevel?: string;
  nextOccurrence: string;
  assignedTo?: string[];
  assignedRoles?: string[];
}

interface UpdateRecurringTaskBody {
  title?: string;
  description?: string;
  frequency?: string;
  frequencyDetails?: any;
  startDate?: string;
  endDate?: string;
  estimatedDuration?: number;
  activityLevel?: string;
  nextOccurrence?: string;
}

export default async function recurringTaskRoutes(fastify: FastifyInstance) {
  // Get all recurring tasks (optionally filtered by instance)
  fastify.get<{ Querystring: RecurringTasksQuerystring }>(
    '/',
    async (request: FastifyRequest<{ Querystring: RecurringTasksQuerystring }>, reply: FastifyReply) => {
      try {
        const { instanceId } = request.query;
        const where = instanceId ? { instanceId: instanceId as string } : {};

        const recurringTasks = await prisma.recurringTask.findMany({
          where,
          include: {
            project: true,
            assignments: {
              include: {
                person: true,
              },
            },
            roleAssignments: {
              include: {
                role: true,
              },
            },
          },
          orderBy: {
            nextOccurrence: 'asc',
          },
        });
        return recurringTasks;
      } catch (error) {
        reply.status(500).send({ error: 'Failed to fetch recurring tasks' });
      }
    }
  );

  // Get recurring task by ID
  fastify.get<{ Params: IdParam }>(
    '/:id',
    async (request: FastifyRequest<{ Params: IdParam }>, reply: FastifyReply) => {
      try {
        const { id } = request.params;
        const recurringTask = await prisma.recurringTask.findUnique({
          where: { id },
          include: {
            instance: true,
            project: true,
            assignments: {
              include: {
                person: true,
              },
            },
            roleAssignments: {
              include: {
                role: true,
              },
            },
            workOrders: true,
            completionHistory: true,
          },
        });

        if (!recurringTask) {
          return reply.status(404).send({ error: 'Recurring task not found' });
        }

        return recurringTask;
      } catch (error) {
        reply.status(500).send({ error: 'Failed to fetch recurring task' });
      }
    }
  );

  // Create recurring task
  fastify.post<{ Body: CreateRecurringTaskBody }>(
    '/',
    async (request: FastifyRequest<{ Body: CreateRecurringTaskBody }>, reply: FastifyReply) => {
      try {
        const {
          instanceId,
          projectId,
          customerName,
          title,
          description,
          frequency,
          frequencyDetails,
          startDate,
          endDate,
          estimatedDuration,
          activityLevel,
          nextOccurrence,
          assignedTo,
          assignedRoles,
        } = request.body;

        const recurringTask = await prisma.recurringTask.create({
          data: {
            instanceId,
            projectId,
            customerName,
            title,
            description,
            frequency,
            frequencyDetails,
            startDate: new Date(startDate),
            endDate: endDate ? new Date(endDate) : undefined,
            estimatedDuration,
            activityLevel: activityLevel || 'medium',
            nextOccurrence: new Date(nextOccurrence),
            assignments: {
              create: (assignedTo || []).map((personId: string) => ({
                personId,
              })),
            },
            roleAssignments: {
              create: (assignedRoles || []).map((roleId: string) => ({
                roleId,
              })),
            },
          },
          include: {
            assignments: {
              include: {
                person: true,
              },
            },
            roleAssignments: {
              include: {
                role: true,
              },
            },
          },
        });

        return reply.status(201).send(recurringTask);
      } catch (error) {
        reply.status(500).send({ error: 'Failed to create recurring task' });
      }
    }
  );

  // Update recurring task
  fastify.put<{ Params: IdParam; Body: UpdateRecurringTaskBody }>(
    '/:id',
    async (
      request: FastifyRequest<{ Params: IdParam; Body: UpdateRecurringTaskBody }>,
      reply: FastifyReply
    ) => {
      try {
        const { id } = request.params;
        const {
          title,
          description,
          frequency,
          frequencyDetails,
          startDate,
          endDate,
          estimatedDuration,
          activityLevel,
          nextOccurrence,
        } = request.body;

        const recurringTask = await prisma.recurringTask.update({
          where: { id },
          data: {
            title,
            description,
            frequency,
            frequencyDetails,
            startDate: startDate ? new Date(startDate) : undefined,
            endDate: endDate ? new Date(endDate) : undefined,
            estimatedDuration,
            activityLevel,
            nextOccurrence: nextOccurrence ? new Date(nextOccurrence) : undefined,
          },
          include: {
            assignments: {
              include: {
                person: true,
              },
            },
          },
        });

        return recurringTask;
      } catch (error) {
        reply.status(500).send({ error: 'Failed to update recurring task' });
      }
    }
  );

  // Delete recurring task
  fastify.delete<{ Params: IdParam }>(
    '/:id',
    async (request: FastifyRequest<{ Params: IdParam }>, reply: FastifyReply) => {
      try {
        const { id } = request.params;
        await prisma.recurringTask.delete({
          where: { id },
        });
        return { message: 'Recurring task deleted successfully' };
      } catch (error) {
        reply.status(500).send({ error: 'Failed to delete recurring task' });
      }
    }
  );
}
