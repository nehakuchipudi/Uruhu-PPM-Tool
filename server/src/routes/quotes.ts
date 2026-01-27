import { Router, Request, Response } from 'express';
import prisma from '../db.js';

const router = Router();

// Get all quotes (optionally filtered by instance, status)
router.get('/', async (req: Request, res: Response) => {
  try {
    const { instanceId, status } = req.query;
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
    res.json(quotes);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch quotes' });
  }
});

// Get quote by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
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
      return res.status(404).json({ error: 'Quote not found' });
    }
    
    res.json(quote);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch quote' });
  }
});

// Create quote
router.post('/', async (req: Request, res: Response) => {
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
    } = req.body;
    
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
    
    res.status(201).json(quote);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create quote' });
  }
});

// Update quote
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
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
    } = req.body;
    
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
    
    res.json(quote);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update quote' });
  }
});

// Delete quote
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.quote.delete({
      where: { id },
    });
    res.json({ message: 'Quote deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete quote' });
  }
});

export default router;
