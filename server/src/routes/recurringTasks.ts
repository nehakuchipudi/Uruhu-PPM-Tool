import { Router, Request, Response } from 'express';
import prisma from '../db.js';

const router = Router();

// Get all recurring tasks (optionally filtered by instance)
router.get('/', async (req: Request, res: Response) => {
  try {
    const { instanceId } = req.query;
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
    res.json(recurringTasks);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch recurring tasks' });
  }
});

// Get recurring task by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
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
      return res.status(404).json({ error: 'Recurring task not found' });
    }
    
    res.json(recurringTask);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch recurring task' });
  }
});

// Create recurring task
router.post('/', async (req: Request, res: Response) => {
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
    } = req.body;
    
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
    
    res.status(201).json(recurringTask);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create recurring task' });
  }
});

// Update recurring task
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
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
    } = req.body;
    
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
    
    res.json(recurringTask);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update recurring task' });
  }
});

// Delete recurring task
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.recurringTask.delete({
      where: { id },
    });
    res.json({ message: 'Recurring task deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete recurring task' });
  }
});

export default router;
