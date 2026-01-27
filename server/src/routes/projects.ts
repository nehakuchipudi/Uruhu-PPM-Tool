import { Router, Request, Response } from 'express';
import prisma from '../db.js';

const router = Router();

// Get all projects (optionally filtered by instance)
router.get('/', async (req: Request, res: Response) => {
  try {
    const { instanceId, status } = req.query;
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
    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

// Get project by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
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
      return res.status(404).json({ error: 'Project not found' });
    }
    
    res.json(project);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch project' });
  }
});

// Create project
router.post('/', async (req: Request, res: Response) => {
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
    } = req.body;
    
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
    
    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create project' });
  }
});

// Update project
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
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
    } = req.body;
    
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
    
    res.json(project);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update project' });
  }
});

// Delete project
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.project.delete({
      where: { id },
    });
    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete project' });
  }
});

export default router;
