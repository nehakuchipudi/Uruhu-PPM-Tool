import { Router, Request, Response } from 'express';
import prisma from '../db.js';

const router = Router();

// Get all roles (optionally filtered by instance)
router.get('/', async (req: Request, res: Response) => {
  try {
    const { instanceId } = req.query;
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
    res.json(roles);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch roles' });
  }
});

// Get role by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const role = await prisma.role.findUnique({
      where: { id },
      include: {
        people: true,
      },
    });
    
    if (!role) {
      return res.status(404).json({ error: 'Role not found' });
    }
    
    res.json(role);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch role' });
  }
});

// Create role
router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, color, instanceId, permissions, canApproveWork, level, requiresApprovalFrom } = req.body;
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
    res.status(201).json(role);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create role' });
  }
});

// Update role
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, color, permissions, canApproveWork, level, requiresApprovalFrom } = req.body;
    
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
    
    res.json(role);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update role' });
  }
});

// Delete role
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.role.delete({
      where: { id },
    });
    res.json({ message: 'Role deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete role' });
  }
});

export default router;
