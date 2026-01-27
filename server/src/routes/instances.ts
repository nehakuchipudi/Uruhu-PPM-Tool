import { Router, Request, Response } from 'express';
import prisma from '../db.js';

const router = Router();

// Get all instances
router.get('/', async (req: Request, res: Response) => {
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
    res.json(instances);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch instances' });
  }
});

// Get instance by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const instance = await prisma.instance.findUnique({
      where: { id },
      include: {
        people: true,
        roles: true,
        projects: true,
      },
    });
    
    if (!instance) {
      return res.status(404).json({ error: 'Instance not found' });
    }
    
    res.json(instance);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch instance' });
  }
});

// Create instance
router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, logo, primaryColor, workflowEnabled, customFields } = req.body;
    const instance = await prisma.instance.create({
      data: {
        name,
        logo,
        primaryColor,
        workflowEnabled: workflowEnabled ?? true,
        customFields: customFields || [],
      },
    });
    res.status(201).json(instance);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create instance' });
  }
});

// Update instance
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, logo, primaryColor, workflowEnabled, customFields } = req.body;
    
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
    
    res.json(instance);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update instance' });
  }
});

// Delete instance
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.instance.delete({
      where: { id },
    });
    res.json({ message: 'Instance deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete instance' });
  }
});

export default router;
