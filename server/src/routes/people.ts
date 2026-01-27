import { Router, Request, Response } from 'express';
import prisma from '../db.js';

const router = Router();

// Get all people (optionally filtered by instance)
router.get('/', async (req: Request, res: Response) => {
  try {
    const { instanceId } = req.query;
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
    res.json(people);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch people' });
  }
});

// Get person by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
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
      return res.status(404).json({ error: 'Person not found' });
    }
    
    res.json(person);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch person' });
  }
});

// Create person
router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, email, role, roleId, avatar, instanceId } = req.body;
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
    res.status(201).json(person);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create person' });
  }
});

// Update person
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, email, role, roleId, avatar } = req.body;
    
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
    
    res.json(person);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update person' });
  }
});

// Delete person
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.person.delete({
      where: { id },
    });
    res.json({ message: 'Person deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete person' });
  }
});

export default router;
