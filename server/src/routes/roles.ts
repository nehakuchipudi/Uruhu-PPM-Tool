import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import prisma from '../db.js';

interface IdParam {
  id: string;
}

interface RolesQuerystring {
  instanceId?: string;
}

interface CreateRoleBody {
  name: string;
  color?: string;
  instanceId: string;
  permissions?: string[];
  canApproveWork?: boolean;
  level?: number;
  requiresApprovalFrom?: string[];
}

interface UpdateRoleBody {
  name?: string;
  color?: string;
  permissions?: string[];
  canApproveWork?: boolean;
  level?: number;
  requiresApprovalFrom?: string[];
}

export default async function roleRoutes(fastify: FastifyInstance) {
  // Get all roles (optionally filtered by instance)
  fastify.get<{ Querystring: RolesQuerystring }>(
    '/',
    async (request: FastifyRequest<{ Querystring: RolesQuerystring }>, reply: FastifyReply) => {
      try {
        const { instanceId } = request.query;
        const where = instanceId ? { instanceId: instanceId as string } : {};

        const roles = await prisma.role.findMany({
          where,
          include: {
            _count: {
              select: {
                people: true,
              },
            },
          },
        });
        return roles;
      } catch (error) {
        reply.status(500).send({ error: 'Failed to fetch roles' });
      }
    }
  );

  // Get role by ID
  fastify.get<{ Params: IdParam }>(
    '/:id',
    async (request: FastifyRequest<{ Params: IdParam }>, reply: FastifyReply) => {
      try {
        const { id } = request.params;
        const role = await prisma.role.findUnique({
          where: { id },
          include: {
            people: true,
          },
        });

        if (!role) {
          return reply.status(404).send({ error: 'Role not found' });
        }

        return role;
      } catch (error) {
        reply.status(500).send({ error: 'Failed to fetch role' });
      }
    }
  );

  // Create role
  fastify.post<{ Body: CreateRoleBody }>(
    '/',
    async (request: FastifyRequest<{ Body: CreateRoleBody }>, reply: FastifyReply) => {
      try {
        const { name, color, instanceId, permissions, canApproveWork, level, requiresApprovalFrom } = request.body;
        const role = await prisma.role.create({
          data: {
            name,
            color,
            instanceId,
            permissions: permissions || [],
            canApproveWork: canApproveWork ?? false,
            level: level ?? 1,
            requiresApprovalFrom: requiresApprovalFrom || [],
          },
        });
        return reply.status(201).send(role);
      } catch (error) {
        reply.status(500).send({ error: 'Failed to create role' });
      }
    }
  );

  // Update role
  fastify.put<{ Params: IdParam; Body: UpdateRoleBody }>(
    '/:id',
    async (
      request: FastifyRequest<{ Params: IdParam; Body: UpdateRoleBody }>,
      reply: FastifyReply
    ) => {
      try {
        const { id } = request.params;
        const { name, color, permissions, canApproveWork, level, requiresApprovalFrom } = request.body;

        const role = await prisma.role.update({
          where: { id },
          data: {
            name,
            color,
            permissions,
            canApproveWork,
            level,
            requiresApprovalFrom,
          },
        });

        return role;
      } catch (error) {
        reply.status(500).send({ error: 'Failed to update role' });
      }
    }
  );

  // Delete role
  fastify.delete<{ Params: IdParam }>(
    '/:id',
    async (request: FastifyRequest<{ Params: IdParam }>, reply: FastifyReply) => {
      try {
        const { id } = request.params;
        await prisma.role.delete({
          where: { id },
        });
        return { message: 'Role deleted successfully' };
      } catch (error) {
        reply.status(500).send({ error: 'Failed to delete role' });
      }
    }
  );
}
