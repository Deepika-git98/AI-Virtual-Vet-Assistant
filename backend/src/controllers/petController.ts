import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface AuthRequest extends Request {
  userId?: string;
}

export const createPet = async (req: AuthRequest, res: Response) => {
  try {
    const { name, species, breed, age, weight, gender, description } = req.body;
    const userId = req.userId!;

    const pet = await prisma.pet.create({
      data: {
        name,
        species,
        breed,
        age,
        weight,
        gender,
        description,
        userId
      }
    });

    res.status(201).json(pet);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const getPets = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;

    const pets = await prisma.pet.findMany({
      where: { userId },
      include: {
        symptomReports: {
          orderBy: { createdAt: 'desc' },
          take: 5
        }
      }
    });

    res.json(pets);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const updatePet = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, species, breed, age, weight, gender, description } = req.body;
    const userId = req.userId!;

    const pet = await prisma.pet.updateMany({
      where: { id, userId },
      data: {
        name,
        species,
        breed,
        age,
        weight,
        gender,
        description
      }
    });

    if (pet.count === 0) {
      return res.status(404).json({ error: 'Pet not found' });
    }

    res.json({ message: 'Pet updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const deletePet = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.userId!;

    const pet = await prisma.pet.deleteMany({
      where: { id, userId }
    });

    if (pet.count === 0) {
      return res.status(404).json({ error: 'Pet not found' });
    }

    res.json({ message: 'Pet deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};