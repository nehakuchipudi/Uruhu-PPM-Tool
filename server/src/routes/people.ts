import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import prisma from '../db.js';

interface IdParam {
  id: string;
}

interface PeopleQuerystring {
  instanceId?: string;
}

interface CreatePersonBody {
  name: string;
  email: string;
  role?: string;
  roleId?: string;
  avatar?: string;
  instanceId: string;
}

interface UpdatePersonBody {
  name?: string;
  email?: string;
  role?: string;
  roleId?: string;
  avatar?: string;
}

export default async function peopleRoutes(fastify: FastifyInstance) {
  // Get all people (optionally filtered by instance)
  fastify.get<{ Querystring: PeopleQuerystring }>(
    '/',
    async (request: FastifyRequest<{ Querystring: PeopleQuerystring }>, reply: FastifyReply) => {
      try {
        const { instanceId } = request.query;
        const where = instanceId ? { instanceId: instanceId as string } : {};

        const people = await prisma.person.findMany({
          where,
          include: {
            assignedRole: true,
            instance: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        });
        return people;
      } catch (error) {
        reply.status(500).send({ error: 'Failed to fetch people' });
      }
    }
  );

  // Get person by ID
  fastify.get<{ Params: IdParam }>(
    '/:id',
    async (request: FastifyRequest<{ Params: IdParam }>, reply: FastifyReply) => {
      try {
        const { id } = request.params;
        const person = await prisma.person.findUnique({
          where: { id },
          include: {
            assignedRole: true,
            instance: true,
            projectAssignments: {
              include: {
                project: true,
              },
            },
          },
        });

        if (!person) {
          return reply.status(404).send({ error: 'Person not found' });
        }

        return person;
      } catch (error) {
        reply.status(500).send({ error: 'Failed to fetch person' });
      }
    }
  );

  // Create person
  fastify.post<{ Body: CreatePersonBody }>(
    '/',
    async (request: FastifyRequest<{ Body: CreatePersonBody }>, reply: FastifyReply) => {
      try {
        const { name, email, role, roleId, avatar, instanceId } = request.body;
        const person = await prisma.person.create({
          data: {
            name,
            email,
            role,
            roleId,
            avatar,
            instanceId,
          },
          include: {
            assignedRole: true,
          },
        });
        return reply.status(201).send(person);
      } catch (error) {
        reply.status(500).send({ error: 'Failed to create person' });
      }
    }
  );

  // Update person
  fastify.put<{ Params: IdParam; Body: UpdatePersonBody }>(
    '/:id',
    async (
      request: FastifyRequest<{ Params: IdParam; Body: UpdatePersonBody }>,
      reply: FastifyReply
    ) => {
      try {
        const { id } = request.params;
        const { name, email, role, roleId, avatar } = request.body;

        const person = await prisma.person.update({
          where: { id },
          data: {
            name,
            email,
            role,
            roleId,
            avatar,
          },
          include: {
            assignedRole: true,
          },
        });

        return person;
      } catch (error) {
        reply.status(500).send({ error: 'Failed to update person' });
      }
    }
  );

  // Delete person
  fastify.delete<{ Params: IdParam }>(
    '/:id',
    async (request: FastifyRequest<{ Params: IdParam }>, reply: FastifyReply) => {
      try {
        const { id } = request.params;
        await prisma.person.delete({
          where: { id },
        });
        return { message: 'Person deleted successfully' };
      } catch (error) {
        reply.status(500).send({ error: 'Failed to delete person' });
      }
    }
  );
}
