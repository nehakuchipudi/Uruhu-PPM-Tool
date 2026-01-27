import { Router, Request, Response } from 'express';
import prisma from '../db.js';

const router = Router();

// Get all work orders (optionally filtered by instance, project, status)
router.get('/', async (req: Request, res: Response) => {
  try {
    const { instanceId, projectId, status } = req.query;
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
    res.json(workOrders);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch work orders' });
  }
});

// Get work order by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
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
      return res.status(404).json({ error: 'Work order not found' });
    }
    
    res.json(workOrder);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch work order' });
  }
});

// Create work order
router.post('/', async (req: Request, res: Response) => {
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
    } = req.body;
    
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
    
    res.status(201).json(workOrder);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create work order' });
  }
});

// Update work order
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
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
    } = req.body;
    
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
    
    res.json(workOrder);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update work order' });
  }
});

// Delete work order
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.workOrder.delete({
      where: { id },
    });
    res.json({ message: 'Work order deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete work order' });
  }
});

export default router;
