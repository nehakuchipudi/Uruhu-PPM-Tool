import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import prisma from '../db.js';

interface IdParam {
  id: string;
}

interface WorkOrdersQuerystring {
  instanceId?: string;
  projectId?: string;
  status?: string;
}

interface CreateWorkOrderBody {
  projectId?: string;
  instanceId: string;
  customerName?: string;
  title: string;
  description?: string;
  status?: string;
  priority?: string;
  location?: string;
  scheduledDate: string;
  scheduledTime?: string;
  duration?: number;
  activityLevel?: string;
  estimatedDuration?: number;
  isRecurring?: boolean;
  recurringTaskId?: string;
  assignedTo?: string[];
  assignedRoles?: string[];
}

interface UpdateWorkOrderBody {
  title?: string;
  description?: string;
  status?: string;
  priority?: string;
  location?: string;
  scheduledDate?: string;
  scheduledTime?: string;
  duration?: number;
  completedDate?: string;
  completedById?: string;
  activityLevel?: string;
  estimatedDuration?: number;
  actualDuration?: number;
  completionNotes?: string;
  approvalNotes?: string;
  approvalStatus?: string;
  approvedById?: string;
  reviewNotes?: string;
}

export default async function workOrderRoutes(fastify: FastifyInstance) {
  // Get all work orders (optionally filtered by instance, project, status)
  fastify.get<{ Querystring: WorkOrdersQuerystring }>(
    '/',
    async (request: FastifyRequest<{ Querystring: WorkOrdersQuerystring }>, reply: FastifyReply) => {
      try {
        const { instanceId, projectId, status } = request.query;
        const where: any = {};

        if (instanceId) where.instanceId = instanceId as string;
        if (projectId) where.projectId = projectId as string;
        if (status) where.status = status as string;

        const workOrders = await prisma.workOrder.findMany({
          where,
          include: {
            project: true,
            assignments: {
              include: {
                person: true,
              },
            },
            completedBy: true,
            approvedBy: true,
          },
          orderBy: {
            scheduledDate: 'desc',
          },
        });
        return workOrders;
      } catch (error) {
        reply.status(500).send({ error: 'Failed to fetch work orders' });
      }
    }
  );

  // Get work order by ID
  fastify.get<{ Params: IdParam }>(
    '/:id',
    async (request: FastifyRequest<{ Params: IdParam }>, reply: FastifyReply) => {
      try {
        const { id } = request.params;
        const workOrder = await prisma.workOrder.findUnique({
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
            completedBy: true,
            approvedBy: true,
            photos: true,
            approvals: true,
          },
        });

        if (!workOrder) {
          return reply.status(404).send({ error: 'Work order not found' });
        }

        return workOrder;
      } catch (error) {
        reply.status(500).send({ error: 'Failed to fetch work order' });
      }
    }
  );

  // Create work order
  fastify.post<{ Body: CreateWorkOrderBody }>(
    '/',
    async (request: FastifyRequest<{ Body: CreateWorkOrderBody }>, reply: FastifyReply) => {
      try {
        const {
          projectId,
          instanceId,
          customerName,
          title,
          description,
          status,
          priority,
          location,
          scheduledDate,
          scheduledTime,
          duration,
          activityLevel,
          estimatedDuration,
          isRecurring,
          recurringTaskId,
          assignedTo,
          assignedRoles,
        } = request.body;

        const workOrder = await prisma.workOrder.create({
          data: {
            projectId,
            instanceId,
            customerName,
            title,
            description,
            status: status || 'draft',
            priority: priority || 'medium',
            location,
            scheduledDate: new Date(scheduledDate),
            scheduledTime,
            duration,
            activityLevel: activityLevel || 'medium',
            estimatedDuration,
            isRecurring: isRecurring || false,
            recurringTaskId,
            completionPhotos: [],
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

        return reply.status(201).send(workOrder);
      } catch (error) {
        console.error(error);
        reply.status(500).send({ error: 'Failed to create work order' });
      }
    }
  );

  // Update work order
  fastify.put<{ Params: IdParam; Body: UpdateWorkOrderBody }>(
    '/:id',
    async (
      request: FastifyRequest<{ Params: IdParam; Body: UpdateWorkOrderBody }>,
      reply: FastifyReply
    ) => {
      try {
        const { id } = request.params;
        const {
          title,
          description,
          status,
          priority,
          location,
          scheduledDate,
          scheduledTime,
          duration,
          completedDate,
          completedById,
          activityLevel,
          estimatedDuration,
          actualDuration,
          completionNotes,
          approvalNotes,
          approvalStatus,
          approvedById,
          reviewNotes,
        } = request.body;

        const workOrder = await prisma.workOrder.update({
          where: { id },
          data: {
            title,
            description,
            status,
            priority,
            location,
            scheduledDate: scheduledDate ? new Date(scheduledDate) : undefined,
            scheduledTime,
            duration,
            completedDate: completedDate ? new Date(completedDate) : undefined,
            completedById,
            activityLevel,
            estimatedDuration,
            actualDuration,
            completionNotes,
            approvalNotes,
            approvalStatus,
            approvedById,
            approvedAt: approvedById ? new Date() : undefined,
            reviewNotes,
          },
          include: {
            assignments: {
              include: {
                person: true,
              },
            },
            completedBy: true,
            approvedBy: true,
          },
        });

        return workOrder;
      } catch (error) {
        reply.status(500).send({ error: 'Failed to update work order' });
      }
    }
  );

  // Delete work order
  fastify.delete<{ Params: IdParam }>(
    '/:id',
    async (request: FastifyRequest<{ Params: IdParam }>, reply: FastifyReply) => {
      try {
        const { id } = request.params;
        await prisma.workOrder.delete({
          where: { id },
        });
        return { message: 'Work order deleted successfully' };
      } catch (error) {
        reply.status(500).send({ error: 'Failed to delete work order' });
      }
    }
  );
}
