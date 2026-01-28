import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import prisma from '../db.js';

interface IdParam {
  id: string;
}

interface QuotesQuerystring {
  instanceId?: string;
  status?: string;
}

interface LineItem {
  description: string;
  quantity: number;
  unitPrice: number;
  discount?: number;
  tax?: number;
  total: number;
}

interface CreateQuoteBody {
  quoteNumber: string;
  instanceId: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  customerAddress?: string;
  title: string;
  description?: string;
  status?: string;
  priority?: string;
  lineItems?: LineItem[];
  subtotal: number;
  taxRate?: number;
  taxAmount?: number;
  discountRate?: number;
  discountAmount?: number;
  totalAmount: number;
  validUntil: string;
  notes?: string;
  termsAndConditions?: string;
  createdById?: string;
}

interface UpdateQuoteBody {
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  customerAddress?: string;
  title?: string;
  description?: string;
  status?: string;
  priority?: string;
  subtotal?: number;
  taxRate?: number;
  taxAmount?: number;
  discountRate?: number;
  discountAmount?: number;
  totalAmount?: number;
  validUntil?: string;
  notes?: string;
  termsAndConditions?: string;
}

export default async function quoteRoutes(fastify: FastifyInstance) {
  // Get all quotes (optionally filtered by instance, status)
  fastify.get<{ Querystring: QuotesQuerystring }>(
    '/',
    async (request: FastifyRequest<{ Querystring: QuotesQuerystring }>, reply: FastifyReply) => {
      try {
        const { instanceId, status } = request.query;
        const where: any = {};

        if (instanceId) where.instanceId = instanceId as string;
        if (status) where.status = status as string;

        const quotes = await prisma.quote.findMany({
          where,
          include: {
            createdBy: true,
            lineItems: true,
            project: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
        });
        return quotes;
      } catch (error) {
        reply.status(500).send({ error: 'Failed to fetch quotes' });
      }
    }
  );

  // Get quote by ID
  fastify.get<{ Params: IdParam }>(
    '/:id',
    async (request: FastifyRequest<{ Params: IdParam }>, reply: FastifyReply) => {
      try {
        const { id } = request.params;
        const quote = await prisma.quote.findUnique({
          where: { id },
          include: {
            instance: true,
            createdBy: true,
            lineItems: {
              orderBy: {
                order: 'asc',
              },
            },
            project: true,
          },
        });

        if (!quote) {
          return reply.status(404).send({ error: 'Quote not found' });
        }

        return quote;
      } catch (error) {
        reply.status(500).send({ error: 'Failed to fetch quote' });
      }
    }
  );

  // Create quote
  fastify.post<{ Body: CreateQuoteBody }>(
    '/',
    async (request: FastifyRequest<{ Body: CreateQuoteBody }>, reply: FastifyReply) => {
      try {
        const {
          quoteNumber,
          instanceId,
          customerName,
          customerEmail,
          customerPhone,
          customerAddress,
          title,
          description,
          status,
          priority,
          lineItems,
          subtotal,
          taxRate,
          taxAmount,
          discountRate,
          discountAmount,
          totalAmount,
          validUntil,
          notes,
          termsAndConditions,
          createdById,
        } = request.body;

        const quote = await prisma.quote.create({
          data: {
            quoteNumber,
            instanceId,
            customerName,
            customerEmail,
            customerPhone,
            customerAddress,
            title,
            description,
            status: status || 'draft',
            priority,
            subtotal,
            taxRate: taxRate || 0,
            taxAmount: taxAmount || 0,
            discountRate,
            discountAmount,
            totalAmount,
            validUntil: new Date(validUntil),
            notes,
            termsAndConditions,
            createdById,
            attachments: [],
            lineItems: {
              create: (lineItems || []).map((item: any, index: number) => ({
                description: item.description,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                discount: item.discount || 0,
                tax: item.tax || 0,
                total: item.total,
                order: index,
              })),
            },
          },
          include: {
            createdBy: true,
            lineItems: true,
          },
        });

        return reply.status(201).send(quote);
      } catch (error) {
        console.error(error);
        reply.status(500).send({ error: 'Failed to create quote' });
      }
    }
  );

  // Update quote
  fastify.put<{ Params: IdParam; Body: UpdateQuoteBody }>(
    '/:id',
    async (
      request: FastifyRequest<{ Params: IdParam; Body: UpdateQuoteBody }>,
      reply: FastifyReply
    ) => {
      try {
        const { id } = request.params;
        const {
          customerName,
          customerEmail,
          customerPhone,
          customerAddress,
          title,
          description,
          status,
          priority,
          subtotal,
          taxRate,
          taxAmount,
          discountRate,
          discountAmount,
          totalAmount,
          validUntil,
          notes,
          termsAndConditions,
        } = request.body;

        const quote = await prisma.quote.update({
          where: { id },
          data: {
            customerName,
            customerEmail,
            customerPhone,
            customerAddress,
            title,
            description,
            status,
            priority,
            subtotal,
            taxRate,
            taxAmount,
            discountRate,
            discountAmount,
            totalAmount,
            validUntil: validUntil ? new Date(validUntil) : undefined,
            notes,
            termsAndConditions,
            sentAt: status === 'sent' ? new Date() : undefined,
            approvedAt: status === 'approved' ? new Date() : undefined,
            rejectedAt: status === 'rejected' ? new Date() : undefined,
          },
          include: {
            createdBy: true,
            lineItems: true,
          },
        });

        return quote;
      } catch (error) {
        reply.status(500).send({ error: 'Failed to update quote' });
      }
    }
  );

  // Delete quote
  fastify.delete<{ Params: IdParam }>(
    '/:id',
    async (request: FastifyRequest<{ Params: IdParam }>, reply: FastifyReply) => {
      try {
        const { id } = request.params;
        await prisma.quote.delete({
          where: { id },
        });
        return { message: 'Quote deleted successfully' };
      } catch (error) {
        reply.status(500).send({ error: 'Failed to delete quote' });
      }
    }
  );
}
